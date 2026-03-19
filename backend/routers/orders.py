from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.user import User
from schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from crud import order_crud
from api.deps import get_current_user, get_current_active_admin

router = APIRouter(
    prefix="/orders", 
    tags=["Checkout & Orders"]
)

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout_cart(order: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Receives a cart payload from React, verifies stock, charges the user mathematically, and creates physical shipping orders."""
    return order_crud.create_order(db=db, order_data=order, user_id=current_user.id)

@router.get("/history", response_model=List[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns all past orders the currently authenticated user has made for their dashboard."""
    return order_crud.get_user_orders(db=db, user_id=current_user.id)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db), admin_user: User = Depends(get_current_active_admin)):
    """ADMIN ONLY: Move an order from 'Processing' -> 'Dispatched' -> 'Delivered'"""
    order = order_crud.update_order_status(db=db, order_id=order_id, new_status=status_update.status)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order physically not found in database.")
    return order
