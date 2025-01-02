from cryptography.fernet import Fernet
import os
import base64
from src.config.settings import get_settings

settings = get_settings()

def get_encryption_key():
    key = settings.ENCRYPTION_KEY
    # Ensure the key is properly padded for base64
    padding = len(key) % 4
    if padding:
        key += '=' * (4 - padding)
    return base64.urlsafe_b64decode(key)

def encrypt_token(token: str) -> str:
    try:
        f = Fernet(get_encryption_key())
        return f.encrypt(token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Encryption failed: {str(e)}")

def decrypt_token(encrypted_token: str) -> str:
    try:
        f = Fernet(get_encryption_key())
        return f.decrypt(encrypted_token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")