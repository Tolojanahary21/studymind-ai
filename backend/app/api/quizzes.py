from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.quiz_attempt import QuizAttempt
from app.schemas.quiz import QuizSubmitRequest
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/{quiz_id}")
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db)
):

    quiz = (
        db.query(Quiz)
        .filter(
            Quiz.id == quiz_id
        )
        .first()
    )

    if not quiz:
        return {
            "error": "Quiz not found"
        }

    questions = (
        db.query(Question)
        .filter(
            Question.quiz_id == quiz.id
        )
        .all()
    )

    return {
        "quiz_id": quiz.id,
        "document_id": quiz.document_id,
        "questions": [
            {
                "id": q.id,
                "difficulty": q.difficulty,
                "question": q.question,
                "choices": [
                q.choice_a,
                q.choice_b,
                q.choice_c,
                q.choice_d
                ],
                "answer": q.answer
            }
            for q in questions
        ]
    }

@router.post("/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    quiz = (
        db.query(Quiz)
        .filter(
            Quiz.id == quiz_id
        )
        .first()
    )

    if not quiz:
        return {
            "error": "Quiz not found"
        }

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=payload.score,
        total_questions=payload.total_questions
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "message": "Quiz submitted",
        "attempt_id": attempt.id
    }