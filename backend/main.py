from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Core Settings & Database
from core.config import settings
from models.database import engine, Base, get_db
import models.user
import models.product
import models.order

# Security & Operations
from crud import user_crud
from core import security

# Request Schemas
from schemas.user import RegistrationRequest, LoginRequest, Token

# Routers (Clean Architecture)
from routers import products
from routers import orders
from routers import payment

# Automatically create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# Hooking our detached routers into the core application!
app.include_router(products.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(payment.router, prefix="/api/v1")


@app.post("/registration", status_code=status.HTTP_201_CREATED, tags=["Auth"])
def sign_up(data: RegistrationRequest, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_email(db, email=data.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    new_user = user_crud.create_user(db=db, user=data)
    return {"message": "sign up successful", "email": new_user.email}


@app.post("/login", response_model=Token, tags=["Auth"])
def log_in(data: LoginRequest, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_email(db, email=data.email)
    
    if not db_user or not security.verify_password(data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
