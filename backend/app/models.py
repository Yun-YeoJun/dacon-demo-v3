from pydantic import BaseModel, Field
from typing import Literal, Optional, Any, List

Label = Literal["스미싱", "정상", "불명"]

class AnalyzeRequest(BaseModel):
    request_id: str = Field(default="req_manual")
    text: str
    channel: Optional[str] = None  # sms/instagram/kakao 등 (선택)

class AnalyzeResult(BaseModel):
    label: Label = "불명"
    score: Optional[float] = None
    reasons: List[str] = []
    raw: Optional[Any] = None

class AnalyzeResponse(BaseModel):
    request_id: str
    result: AnalyzeResult
