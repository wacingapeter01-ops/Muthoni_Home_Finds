from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderCreate

def create_order(db: Session, order_data: OrderCreate, user_id: int):
    # Dynamically compute safety values rather than trusting the frontend's total mathematics.
    total_amount = 0.0
    order_items_db = []
    
    for item in order_data.items:
        # 1. Verify product actually exists in catalog
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
            
        # 2. Verify we physically have enough inventory
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.title}. Only {product.stock_quantity} remaining.")
            
        # 3. Deduct stock globally so no one else buys it
        product.stock_quantity -= item.quantity
        
        # 4. Mathematically compute subtotal securely based on DB price (not frontend price!)
        total_amount += product.price * item.quantity
        
        # 5. Pack relational mapping for DB
        order_items_db.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_time_of_purchase=product.price
            )
        )
        
    # Combine the entire payload!
    db_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        items=order_items_db
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

def get_user_orders(db: Session, user_id: int):
    """Retrieves the history of all orders mathematically linked to a user account."""
    return db.query(Order).filter(Order.user_id == user_id).all()

def update_order_status(db: Session, order_id: int, new_status: str):
    """Used by Administrators to transition a user's delivery status."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
