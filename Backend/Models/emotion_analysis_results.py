from pydantic import BaseModel

class EmotionAnalysisReport(BaseModel):
    participant_ID: str
    emotion_analysis_report: list[dict]