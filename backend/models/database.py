from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# Use the URL configured in .env (or config.py)
# Note: connect_args={"check_same_thread": False} is strictly for SQLite.
# We dynamically add it only if the driver says "sqlite".
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Creating a session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models to inherit from
Base = declarative_base()

# Dependency function to use the database session in our routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()