from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import User
from models.order import Order
from api.deps import get_current_user
from core.mpesa import mpesa_client

router = APIRouter(
    prefix="/payment",
    tags=["Safaricom M-Pesa Integration"]
)

@router.post("/stkpush/{order_id}")
def trigger_mpesa_payment(order_id: int, phone_number: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Called strictly from the frontend immediately after a Cart creates an Order.
    This triggers the exact M-Pesa push onto their mobile device mathematically tied to the order.
    """
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or you lack ownership permissions.")
        
    # Standardize Kenya numbers to Safaricom's required format: 254... e.g., 0712345678 -> 254712345678
    if phone_number.startswith("0"):
        phone_number = "254" + phone_number[1:]
    elif phone_number.startswith("+254"):
        phone_number = phone_number[1:]
        
    try:
        # Amount must naturally be strictly cast to int for Daraja
        response = mpesa_client.initiate_stk_push(
            phone_number=phone_number, 
            amount=int(order.total_amount), 
            order_id=str(order.id)
        )
        return {"message": "STK Push successfully initiated", "daraja_tracker": response}
    except Exception as e:
        print(f"M-PESA ERROR ENCOUNTERED: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect physically to Safaricom. Check console logging.")

@router.post("/mpesa/callback")
async def mpesa_webhook_callback(request: Request, db: Session = Depends(get_db)):
    """
    DARAJA WEBHOOK: Safaricom physically POSTs to this URL once the user types their PIN and money moves.
    ResultCode == 0 strictly means SUCCESS. 
    """
    data = await request.json()
    print("------- M-PESA DARAJA CALLBACK RECEIVED -------")
    print(data)
    
    # Normally, you would parse the ResultCode dynamically and trace it.
    body = data.get("Body", {}).get("stkCallback", {})
    result_code = body.get("ResultCode")
    merchant_request_id = body.get("MerchantRequestID")
    
    if result_code == 0:
        # SUCCESS!
        # A Production architect would use the MerchantRequestID to query the database, find the pending order mapping,
        # update the order.status = "Paid & Processing" automatically, without frontend intervention.
        pass
        
    # Tell Safaricom we safely received the communication so they stop pinging us.
    return {"ResultCode": 0, "ResultDesc": "Callback Successfully Received at Muthoni Home Finds Servers."}
