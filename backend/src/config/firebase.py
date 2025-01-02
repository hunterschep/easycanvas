import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth

load_dotenv()

def initialize_firebase():
    cred_path = os.getenv('FIREBASE_ADMIN_CREDENTIALS')
    if not cred_path:
        raise ValueError("Firebase admin credentials path not found in environment variables")

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()