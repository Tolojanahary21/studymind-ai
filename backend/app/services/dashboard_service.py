from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.document import Document
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt


class DashboardService:

    @staticmethod
    def get_stats(db: Session, user_id: int):

        documents_count = (
            db.query(func.count(Document.id))
            .filter(Document.owner_id == user_id)
            .scalar()
        ) or 0

        quizzes_count = (
            db.query(func.count(Quiz.id))
            .join(Document, Quiz.document_id == Document.id)
            .filter(Document.owner_id == user_id)
            .scalar()
        ) or 0

        attempts_count = (
            db.query(func.count(QuizAttempt.id))
            .filter(QuizAttempt.user_id == user_id)
            .scalar()
        ) or 0

        average_score_raw = (
            db.query(
                func.avg(
                    QuizAttempt.score * 100.0 / QuizAttempt.total_questions
                )
            )
            .filter(
                QuizAttempt.user_id == user_id,
                QuizAttempt.total_questions > 0,
            )
            .scalar()
        )

        average_score = round(average_score_raw, 1) if average_score_raw else 0

        recent_documents = DashboardService._get_recent_documents(db, user_id)
        recent_attempts = DashboardService._get_recent_attempts(db, user_id)
        progress_data = DashboardService._get_progress_data(db, user_id)

        return {
            "documents_count": documents_count,
            "quizzes_count": quizzes_count,
            "attempts_count": attempts_count,
            "average_score": average_score,
            "recent_documents": recent_documents,
            "recent_attempts": recent_attempts,
            "progress_data": progress_data,
        }

    @staticmethod
    def _get_recent_documents(db: Session, user_id: int):

        documents = (
            db.query(Document)
            .filter(Document.owner_id == user_id)
            .order_by(Document.created_at.desc())
            .limit(5)
            .all()
        )

        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
                "character_count": len(doc.content) if doc.content else 0,
            }
            for doc in documents
        ]

    @staticmethod
    def _get_recent_attempts(db: Session, user_id: int):

        rows = (
            db.query(QuizAttempt, Document.filename)
            .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
            .join(Document, Quiz.document_id == Document.id)
            .filter(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.created_at.desc())
            .limit(5)
            .all()
        )

        return [
            {
                "id": attempt.id,
                "document_name": filename,
                "score": attempt.score,
                "total_questions": attempt.total_questions,
                "percentage": (
                    round((attempt.score / attempt.total_questions) * 100, 1)
                    if attempt.total_questions
                    else 0
                ),
                "created_at": (
                    attempt.created_at.isoformat() if attempt.created_at else None
                ),
            }
            for attempt, filename in rows
        ]

    @staticmethod
    def _get_progress_data(db: Session, user_id: int):

        attempts = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.created_at.asc())
            .all()
        )

        return [
            {
                "attempt": index + 1,
                "score": (
                    round((attempt.score / attempt.total_questions) * 100, 1)
                    if attempt.total_questions
                    else 0
                ),
            }
            for index, attempt in enumerate(attempts)
        ]