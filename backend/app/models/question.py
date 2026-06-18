from sqlalchemy import Column, Integer, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)

    difficulty = Column(String, nullable=False)  # easy | medium | hard

    question = Column(Text, nullable=False)

    choices = Column(JSONB, nullable=False)  # ["A","B","C","D"]

    answer = Column(String, nullable=False)   # correct answer