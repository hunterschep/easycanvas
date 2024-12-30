from cryptography.fernet import Fernet

# Generate a new key
key = Fernet.generate_key()
key_str = key.decode()

# Test the key to ensure it's valid
f = Fernet(key)
test = f.encrypt(b"test")
f.decrypt(test)  # This will raise an error if the key is invalid

print("Add this to your backend/.env file:")
print(f"ENCRYPTION_KEY={key_str}")

# Optionally write directly to .env file
with open(".env", "a") as env_file:
    env_file.write(f"\n# Encryption key for Canvas API tokens\nENCRYPTION_KEY={key_str}\n") 