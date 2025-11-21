# Pain-App-Server

Python Fast API Server

Server must be run on a Python version  <= 3.9.25 for all dependencies to be built.

To run locally:

1. Create a virtual env and install dependencies

```commandline
python -m venv env
pip install -r requirements.txt
```

2. Create a .env file based on .env.example or the text below, and fill in the desired port number credentials.

```commandline
PORT=
# PROMIS API Credentials and URL
PROMIS_BASE_URL=http://www.assessmentcenter.net/ac_api
PROMIS_API_VERSION=2014-01
PROMIS_REGISTRATION=
PROMIS_TOKEN=
PEDIATRIC_PAIN_INTERFERENCE_SHORT_FORM_OID=
```

3. Start the server in dev mode locally:

```commandline
 python -m uvicorn api.main:app --reload --port 3000
```
