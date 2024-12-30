from cryptography.fernet import Fernet
import os
from base64 import b64encode

def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("Encryption key not found in environment variables")
    # Convert the string back to bytes
    return key.encode()

def encrypt_token(token: str) -> str:
    f = Fernet(get_encryption_key())
    return f.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_token.encode()).decode() 