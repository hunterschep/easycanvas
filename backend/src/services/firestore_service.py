import firebase_admin
from firebase_admin import firestore
from datetime import datetime
import uuid
from typing import List, Dict, Any, Optional
import json

from src.models.chat import Chat, ChatMessage, ChatListItem, MessageType
from src.utils.logging import setup_logger

logger = setup_logger(__name__)

class FirestoreService:
    """Service for interacting with Firestore database"""
    
    @staticmethod
    def get_db():
        """Get Firestore client instance"""
        if not firebase_admin._apps:
            raise RuntimeError("Firebase app not initialized")
        
        return firestore.client()
    
    @staticmethod
    async def create_chat(user_id: str, title: str) -> str:
        """Create a new chat for a user and return the chat ID"""
        db = FirestoreService.get_db()
        
        # Generate a unique ID for the chat
        chat_id = str(uuid.uuid4())
        
        # Create chat document
        chat_ref = db.collection('chats').document(chat_id)
        
        # Set initial chat data
        chat_data = {
            'chat_id': chat_id,
            'user_id': user_id,
            'title': title,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        # Firestore set() is not actually async, so we don't use await
        chat_ref.set(chat_data)
        logger.info(f"Created new chat {chat_id} for user {user_id}")
        
        return chat_id
    
    @staticmethod
    async def get_chat(chat_id: str) -> Optional[Dict]:
        """Get a chat by ID"""
        db = FirestoreService.get_db()
        chat_ref = db.collection('chats').document(chat_id)
        chat_doc = chat_ref.get()  # Removed await
        
        if not chat_doc.exists:
            logger.warning(f"Chat {chat_id} not found")
            return None
            
        return chat_doc.to_dict()
    
    @staticmethod
    async def save_message(chat_id: str, message: ChatMessage) -> str:
        """Save a message to a chat and return the message ID"""
        db = FirestoreService.get_db()
        
        # Generate message ID if not provided
        message_id = message.message_id or str(uuid.uuid4())
        
        # Convert message to dict
        message_dict = message.model_dump()
        message_dict['message_id'] = message_id
        message_dict['timestamp'] = message.timestamp.isoformat() if message.timestamp else datetime.utcnow().isoformat()
        
        # Handle function call type messages
        if message.type == MessageType.FUNCTION_CALL:
            # Ensure function call fields are saved
            if not message_dict.get('name') or not message_dict.get('arguments'):
                logger.warning("Incomplete function call message being saved")
        
        elif message.type == MessageType.FUNCTION_CALL_OUTPUT:
            # Ensure function call output fields are saved
            if not message_dict.get('call_id') or not message_dict.get('output'):
                logger.warning("Incomplete function call output message being saved")
        
        # Add message to chat
        message_ref = db.collection('chats').document(chat_id).collection('messages').document(message_id)
        message_ref.set(message_dict)  # Removed await
        
        # Update chat's updated_at timestamp
        # Only update last_message for user/assistant text messages (not function calls)
        chat_ref = db.collection('chats').document(chat_id)
        update_data = {'updated_at': firestore.SERVER_TIMESTAMP}
        
        if message.type == MessageType.TEXT:
            update_data['last_message'] = message.content[:100]  # Store truncated message for preview
        
        chat_ref.update(update_data)  # Removed await
        
        return message_id
    
    @staticmethod
    async def get_chat_messages(chat_id: str) -> List[Dict]:
        """Get all messages for a chat ordered by timestamp"""
        db = FirestoreService.get_db()
        
        messages_ref = db.collection('chats').document(chat_id).collection('messages')
        messages_query = messages_ref.order_by('timestamp')
        
        messages = []
        messages_docs = messages_query.get()  # Removed await
        
        for doc in messages_docs:
            message_data = doc.to_dict()
            
            # Ensure the type field exists and is properly converted
            if 'type' not in message_data:
                message_data['type'] = MessageType.TEXT.value
                
            messages.append(message_data)
            
        return messages
    
    @staticmethod
    async def get_user_chats(user_id: str) -> List[ChatListItem]:
        """Get all chats for a user"""
        db = FirestoreService.get_db()
        
        chats_ref = db.collection('chats')
        # Use a simple query without sorting to avoid index issues initially
        query = chats_ref.where('user_id', '==', user_id)
        
        chat_items = []
        chat_docs = query.get()  # Removed await
        
        for doc in chat_docs:
            chat_data = doc.to_dict()
            chat_items.append(ChatListItem(
                chat_id=chat_data.get('chat_id'),
                title=chat_data.get('title'),
                created_at=chat_data.get('created_at').timestamp() if chat_data.get('created_at') else datetime.utcnow(),
                updated_at=chat_data.get('updated_at').timestamp() if chat_data.get('updated_at') else datetime.utcnow(),
                last_message=chat_data.get('last_message')
            ))
        
        # Sort in memory instead of using Firestore sorting (which requires a composite index)
        chat_items.sort(key=lambda x: x.updated_at, reverse=True)
            
        return chat_items
    
    @staticmethod
    async def update_chat_title(chat_id: str, title: str) -> bool:
        """Update a chat's title"""
        db = FirestoreService.get_db()
        chat_ref = db.collection('chats').document(chat_id)
        
        chat_ref.update({  # Removed await
            'title': title,
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        
        return True
    
    @staticmethod
    async def delete_chat(chat_id: str) -> bool:
        """Delete a chat and all its messages"""
        db = FirestoreService.get_db()
        
        # Delete all messages in the chat
        messages_ref = db.collection('chats').document(chat_id).collection('messages')
        messages = messages_ref.get()  # Removed await
        
        for message in messages:
            message.reference.delete()  # Removed await
        
        # Delete the chat document
        chat_ref = db.collection('chats').document(chat_id)
        chat_ref.delete()  # Removed await
        
        return True 