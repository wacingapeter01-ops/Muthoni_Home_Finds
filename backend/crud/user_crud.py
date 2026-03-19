from sqlalchemy.orm import Session
from models.user import User
from schemas.user import RegistrationRequest

# We import from our newly created security module instead of the old hashlib placeholder
from core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    """Retrieves a user from the database by their email address."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: RegistrationRequest):
    """Creates a new user in the database with a securely hashed password."""
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
