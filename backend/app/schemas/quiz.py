from pydantic import BaseModel


class QuizSubmitRequest(BaseModel):

    score: int

    total_questions: int