import os
import Services.promis_service as promis
import Services.emotion_service as emotions
import json
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from Models.assessment import AssessmentResponse
from Models.pain_assessment_results import PainAssessmentResults
from Models.emotion_analysis_results import EmotionAnalysisReport
from datetime import datetime


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


#path to read and store json summary of socket messages
@app.post("/emotions-report")
async def save_results(emotion_analysis_report: EmotionAnalysisReport):
    print(emotion_analysis_report)

    # replace with function to store results in a DB instead of a file
    data = emotion_analysis_report.model_dump()

    print(data)
    time = datetime.now()
    participant_id = emotion_analysis_report.participant_ID

    with open(f"temp_files/emotions-analysis_{time}_{participant_id}_data.json", "w") as f:
        json.dump({"data": data}, f, indent=4)

    return {"message": "Data saved successfully", "saved_data": data}



# path to read and store json summary of pain assessment results
@app.post("/pain-report")
async def save_results(assessment_results: PainAssessmentResults):
    print(assessment_results)
    # replace with function to store results in a DB instead of a file
    data = assessment_results.model_dump()
    print(data)
    time = datetime.now()
    participant_id = assessment_results.participant_ID

    with open(f"temp_files/pain-assessment_{time}_{participant_id}_data.json", "w") as f:
        json.dump({"data": data}, f, indent=4)

    return {"message": "Data saved successfully", "saved_data": data}
