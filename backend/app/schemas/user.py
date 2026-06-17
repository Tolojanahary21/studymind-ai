from pydantic import BaseModel


class UserResponse(BaseModel):

    id: int
    firstname: str
    lastname: str
    email: str

    class Config:
        from_attributes = True