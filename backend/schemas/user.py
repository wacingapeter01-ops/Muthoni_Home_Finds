from pydantic import BaseModel, EmailStr
from typing import Optional

class RegistrationRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Schema outputted exactly as requested by standard OAuth2 documentation 
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
