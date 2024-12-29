from cryptography.fernet import Fernet
import os
from base64 import b64encode

def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        key = Fernet.generate_key()
        # Save this key securely!
    return key

def encrypt_token(token: str) -> str:
    f = Fernet(get_encryption_key())
    return f.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_token.encode()).decode() 