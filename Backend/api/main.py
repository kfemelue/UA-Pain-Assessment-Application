import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from Schemas.assessment import AssessmentResponse
import Services.promis_service as promis
import Services.emotion_service as emotions


load_dotenv(".env")
app = FastAPI()
origins = os.environ["ORIGINS"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def read_root():
    return {"Status": "Server is running"}


@app.get("/api/promis/forms/{form_oid}")
async def get_form(form_oid: str):
    oid = form_oid
    questions = await promis.get_form_details(oid)
    return questions


@app.post("/api/promis/forms/{form_oid}/stateless")
async def score_responses(form_oid: str, body: list[AssessmentResponse]):
    response_list = body
    results = await promis.fetch_stateless_assessment_item(form_oid, response_list)
    return results


@app.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        await emotions.decode_image(data['data'])
        predictions = await emotions.get_predictions_from_image("./temp.jpeg")
        results = await predictions.get_emotions_dict()
        os.remove("./temp.jpeg")
        await websocket.send_json(results)


# path to read and store json summary of socket messages
# @app.post("/store")
# async def save_results(results: ResultModel):
#     # function to connect to db
#     # function to store results

