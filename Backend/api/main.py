from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Schemas.assessment import AssessmentResponse
import Services.promis_service as promis

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)


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

