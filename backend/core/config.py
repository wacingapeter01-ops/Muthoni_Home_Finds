import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Muthoni Home Finds"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database Settings
    # This will read from the .env file, mapping exactly to DATABASE_URL
    DATABASE_URL: str 
    
    # JWT Security Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Safaricom Daraja API
    MPESA_ENVIRONMENT: str = "sandbox"
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    MPESA_CALLBACK_URL: str = "https://your-public-url.ngrok.io/api/v1/payment/mpesa/callback"

    class Config:
        env_file = ".env"

# Instantiate the settings so we can import it in other files
settings = Settings()
