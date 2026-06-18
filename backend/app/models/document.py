from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, index=True, nullable=False)
    filepath = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations ORM
    owner = relationship("User", backref="documents")

    quizzes = relationship(
        "Quiz",
        backref="document",
        cascade="all, delete-orphan"
    )