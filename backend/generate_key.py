from cryptography.fernet import Fernet
import base64

# Generate the key
key = Fernet.generate_key()

# Convert to string format for .env file
key_str = key.decode()

print("Add this to your backend/.env file:")
print(f"ENCRYPTION_KEY={key_str}")

# Optionally write directly to .env file
with open(".env", "a") as env_file:
    env_file.write(f"\n# Encryption key for Canvas API tokens\nENCRYPTION_KEY={key_str}\n") 