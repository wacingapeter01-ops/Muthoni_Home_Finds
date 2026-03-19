import base64
from datetime import datetime
import requests
from requests.auth import HTTPBasicAuth
from core.config import settings

class MpesaClient:
    """Core integration model handling standard authentications and triggers directly against Safaricom's physical API layer."""
    
    def __init__(self):
        self.env = settings.MPESA_ENVIRONMENT
        # Use completely live URL if moving to production
        self.base_url = "https://sandbox.safaricom.co.ke" if self.env == "sandbox" else "https://api.safaricom.co.ke"
        
    def generate_access_token(self) -> str:
        """Fetches the 3599-second OAuth token strictly required to perform Daraja Operations"""
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(
            url, 
            auth=HTTPBasicAuth(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET)
        )
        response.raise_for_status()
        return response.json()["access_token"]

    def generate_password(self, timestamp: str) -> str:
        """Generates the Base64 mathematical STK Push signature using the shortcode, passkey, and live timestamp."""
        data_to_encode = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
        return base64.b64encode(data_to_encode.encode("utf-8")).decode("utf-8")

    def initiate_stk_push(self, phone_number: str, amount: int, order_id: str):
        """Builds the actual trigger firing the physical M-Pesa PIN UI heavily reliant on proper parameter structuring."""
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        access_token = self.generate_access_token()
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # M-PESA Time Standard requirement: YYYYMMDDHHmmss
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = self.generate_password(timestamp)
        
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", 
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"MuthoniHome_{order_id}",
            "TransactionDesc": f"Payment for Order #{order_id}"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

# Initializing global interface
mpesa_client = MpesaClient()
