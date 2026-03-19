from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from schemas.product import CategoryCreate, CategoryResponse, ProductCreate, ProductResponse
from crud import product_crud
from api.deps import get_current_active_admin

# This gives us a standalone module strictly for product routing (Clean Architecture)
router = APIRouter(
    prefix="/catalog", 
    tags=["Catalog Setup"]
)

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Creates a new category group in the database (e.g., 'Living Room')."""
    return product_crud.create_category(db=db, category=category)

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves all active categories out of the database."""
    return product_crud.get_categories(db=db, skip=skip, limit=limit)

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """Registers a new physical product and assigns it to a given category via its ID."""
    return product_crud.create_product(db=db, product=product)

@router.get("/products", response_model=List[ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns all product information stored in our backend to populate the React UI."""
    return product_crud.get_products(db=db, skip=skip, limit=limit)
