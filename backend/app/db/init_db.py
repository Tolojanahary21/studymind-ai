from app.db.database import Base
from app.db.database import engine
from app.models.user import User
from app.models.document import Document


Base.metadata.create_all(bind=engine)
User.metadata.create_all(bind=engine)
Document.metadata.create_all(bind=engine)