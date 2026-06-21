from app.db.database import Base
from app.db.database import engine
from app.models.user import User
from app.models.document import Document
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.quiz_attempt import QuizAttempt

Base.metadata.create_all(bind=engine)
User.metadata.create_all(bind=engine)
Document.metadata.create_all(bind=engine)
Quiz.metadata.create_all(bind=engine)
Question.metadata.create_all(bind=engine)
QuizAttempt.metadata.create_all(bind=engine)