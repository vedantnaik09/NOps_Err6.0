from pydantic import BaseModel, EmailStr
from typing import Optional

# Model for user registration
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    phoneNumber: Optional[str]
    address: str

# Model for user login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Model for returning a token
class Token(BaseModel):
    token: str
