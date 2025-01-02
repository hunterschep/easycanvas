from cryptography.fernet import Fernet
import os
from base64 import b64decode, b64encode

def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("Encryption key not found in environment variables")
    try:
        # Decode the base64 key from environment variable
        return b64decode(key.encode())
    except Exception as e:
        raise ValueError(f"Invalid encryption key format: {str(e)}")

def encrypt_token(token: str) -> str:
    try:
        f = Fernet(b64encode(get_encryption_key()))
        return f.encrypt(token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Encryption failed: {str(e)}")

def decrypt_token(encrypted_token: str) -> str:
    try:
        f = Fernet(b64encode(get_encryption_key()))
        return f.decrypt(encrypted_token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")