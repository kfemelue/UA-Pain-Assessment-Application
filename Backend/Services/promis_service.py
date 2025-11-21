from dotenv import load_dotenv
import os
import base64
import requests
import json

load_dotenv(".env")

PROMIS_BASE_URL = os.environ['PROMIS_BASE_URL']
PROMIS_API_VERSION = os.environ['PROMIS_API_VERSION']
PROMIS_REGISTRATION = os.environ['PROMIS_REGISTRATION']
PROMIS_TOKEN = os.environ['PROMIS_TOKEN']
PEDIATRIC_PAIN_INTERFERENCE_SHORT_FORM_OID = os.environ['PEDIATRIC_PAIN_INTERFERENCE_SHORT_FORM_OID']


class PromisError(Exception):
    def __init__(self, message, status_code, payload):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


async def ensure_credentials():
    if not PROMIS_REGISTRATION or not PROMIS_TOKEN:
        raise PromisError("PROMIS API credentials are not configured", 500)


async def build_url(url_path):
    trimmed = url_path.replace(r'/^\//', '')
    if url_path == f"StatelessParticipants/{PEDIATRIC_PAIN_INTERFERENCE_SHORT_FORM_OID}.json?BodyParam=true":
        return f"https://www.assessmentcenter.net/ac_api/2014-01/{trimmed}"

    return f"{PROMIS_BASE_URL}/{PROMIS_API_VERSION}/{trimmed}"


async def auth_header():
    encoded = base64.b64encode((f"{PROMIS_REGISTRATION}:{PROMIS_TOKEN}".encode("utf-8"))).decode('utf-8')
    credential = f"Basic {encoded}"
    return credential


async def request(path, request_body, request_method):
    await ensure_credentials()
    auth = await auth_header()
    request_headers = {
        "Authorization": auth,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # if not request_headers["Content-Type"]:
    #     request_headers["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8'

    url = await build_url(path)

    if request_method == "POST":
        print("POST: " + url)
        payload = request_body
        response = requests.post(url, data=payload, headers=request_headers)
        data = await safe_json(response)
        if not response.ok:
            raise PromisError("PROMIS API request failed", response.status_code, data)

        return data
    elif request_method == "GET":
        print("GET: " + url)
        response = requests.get(url, headers=request_headers)
        data = await safe_json(response)
        if not response.ok:
            raise PromisError("PROMIS API request failed", response.status_code, data)
        return data


async def safe_json(response):
    try:
        return response.json()
    except requests.RequestException:
        return {"message": response.reason}


async def list_forms():
    return await request('Forms/.json', {}, "GET")


async def get_form_details(form_oid):
    if not form_oid:
        raise PromisError("Form OID is required", 400)
    else:
        return await request(f"Forms/{form_oid}.json", {}, "GET")


async def fetch_stateless_assessment_item(form_oid, form_responses):
    has_responses = True if (len(form_responses) > 0) else False
    path = f"StatelessParticipants/{form_oid}.json?BodyParam=true" \
        if has_responses \
        else f"StatelessParticipants/{form_oid}.json"
    body = json.dumps([r.model_dump() for r in form_responses]) if has_responses else ""

    return await request(path, body, "POST")


async def score_form_responses(form_oid, responses):
    if not form_oid:
        raise PromisError('Form OID is required', 400)

    return await request(f"Score/{form_oid}.json?BodyParam=true", responses, "POST")

