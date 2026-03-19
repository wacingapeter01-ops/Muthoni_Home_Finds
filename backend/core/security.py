from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
import bcrypt
from core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if the provided plain password matches the bcrypt hashed password securely."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt hash of the given password natively using raw bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JSON Web Token (JWT) that encodes user login data so the frontend can prove they are logged in."""
    to_encode = data.copy()
    
    # Calculate expiry time mathematically based on system timezone logic
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Pack the expiration time into the token payload
    to_encode.update({"exp": expire})
    
    # Digitally sign the token using the secret key from our .env
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
