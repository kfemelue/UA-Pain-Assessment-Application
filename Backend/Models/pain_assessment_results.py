from pydantic import BaseModel

# class PainAssessmentResults(BaseModel):
#     timestamp: str
#     participant_ID: str
#     pain_assessment_submission: list[dict]
#     pain_assessment_score: dict


from pydantic import BaseModel


class AssessmentItem(BaseModel):
    ItemID: str
    ItemResponseOID: str
    Order: int


class PainScore(BaseModel):
    theta: float
    stderror: float


class PainAssessmentResults(BaseModel):
    timestamp: str  # Because you used String(Date.now())
    participant_ID: str
    pain_assessment_submission: list[AssessmentItem]
    pain_assessment_score: PainScore
