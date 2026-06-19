from sqlalchemy.orm import Session

from app.models.quiz import Quiz
from app.models.question import Question


class QuizService:

    @staticmethod
    def save_quiz(
        db: Session,
        document_id: int,
        quiz_data: list
    ):

        quiz = Quiz(
            document_id=document_id
        )

        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        for q in quiz_data:

            question = Question(
                quiz_id=quiz.id,
                difficulty=q["difficulty"],
                question=q["question"],
                choice_a=q["choices"][0],
                choice_b=q["choices"][1],
                choice_c=q["choices"][2],
                choice_d=q["choices"][3],
                answer=q["answer"]
            )

            db.add(question)

        db.commit()

        return quiz