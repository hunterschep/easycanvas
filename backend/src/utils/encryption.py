from cryptography.fernet import Fernet
import os
from base64 import b64decode, b64encode

def get_encryption_key():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("Encryption key not found in environment variables")
    
    # If the key is already a valid Fernet key (base64-encoded 32 bytes), use it directly
    try:
        # Try to create a Fernet instance to validate the key
        Fernet(key.encode())
        return key.encode()
    except:
        # If that fails, try to decode it as base64 and then re-encode
        try:
            decoded_key = b64decode(key.encode())
            if len(decoded_key) == 32:
                return b64encode(decoded_key)
            else:
                raise ValueError("Key must be 32 bytes when decoded")
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {str(e)}")

def encrypt_token(token: str) -> str:
    try:
        key = get_encryption_key()
        f = Fernet(key)
        return f.encrypt(token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Encryption failed: {str(e)}")

def decrypt_token(encrypted_token: str) -> str:
    try:
        key = get_encryption_key()
        f = Fernet(key)
        return f.decrypt(encrypted_token.encode()).decode()
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")