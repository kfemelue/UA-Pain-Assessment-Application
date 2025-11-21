from pydantic import BaseModel


class AssessmentForm(BaseModel):
    form_oid: str


class AssessmentResponse(BaseModel):
    ItemID: str
    ItemResponseOID: str
    Order: int
