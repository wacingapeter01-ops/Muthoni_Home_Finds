import sys
import os

# Add the backend root to sys.path so we can import from core
backend_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_root)

try:
    from core.mpesa import mpesa_client
    # Using a fake order ID and a small amount for the sandbox test
    # NOTE: In sandbox mode, this will return a 200 OK from Safaricom 
    # but the prompt ONLY appears on specific test phone numbers registered in the Daraja portal.
    print("Testing M-Pesa STK Push via Safaricom Sandbox API...")
    
    # Amount 1, Order ID 999, Phone Number 254708374149 (Example Safaricom Sandbox Test Number)
    response = mpesa_client.initiate_stk_push(
        phone_number="254708374149", 
        amount=1, 
        order_id="TEST_999"
    )
    print("\n✅ SUCCESS: Connection to Safaricom is working!")
    print("Safaricom Response:", response)
except Exception as e:
    print("\n❌ FAILED: Could not trigger M-Pesa.")
    print("Error Details:", str(e))
