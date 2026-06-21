from pydantic import BaseModel
from typing import List, Optional


class RecentDocumentOut(BaseModel):
    id: int
    filename: str
    created_at: Optional[str] = None
    character_count: int


class RecentAttemptOut(BaseModel):
    id: int
    document_name: str
    score: int
    total_questions: int
    percentage: float
    created_at: Optional[str] = None


class ProgressPointOut(BaseModel):
    attempt: int
    score: float


class DashboardStatsOut(BaseModel):
    documents_count: int
    quizzes_count: int
    attempts_count: int
    average_score: float
    recent_documents: List[RecentDocumentOut]
    recent_attempts: List[RecentAttemptOut]
    progress_data: List[ProgressPointOut]