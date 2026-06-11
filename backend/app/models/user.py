from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    firstname = Column(String)

    lastname = Column(String)

    email = Column(String, unique=True)

    hashed_password = Column(String)