from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id")
    )

    difficulty = Column(String)

    question = Column(String)

    choice_a = Column(String)
    choice_b = Column(String)
    choice_c = Column(String)
    choice_d = Column(String)

    answer = Column(String)

    quiz = relationship(
        "Quiz",
        back_populates="questions"
    )