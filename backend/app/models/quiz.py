from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=True)

    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    questions = relationship(
        "Question",
        backref="quiz",
        cascade="all, delete-orphan"
    )