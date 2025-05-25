import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { ChatMessage, MessageRole, ChatResponse, Chat, ChatListItem } from '@/types/chat';

const API_URL = import.meta.env.VITE_API_URL || '';

// Create authenticated axios instance
const createAuthenticatedRequest = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

// Helper to prepare message for sending to the API
const prepareMessageForApi = (message: ChatMessage) => {
  // Convert Date objects to ISO strings to ensure proper serialization
  return {
    ...message,
    timestamp: message.timestamp instanceof Date 
      ? message.timestamp.toISOString() 
      : message.timestamp,
  };
};

export const sendMessage = async (
  message: string, 
  chatId?: string, 
  previousResponseId?: string,
  previousMessages?: ChatMessage[]
): Promise<ChatMessage> => {
  try {
    const http = await createAuthenticatedRequest();
    
    // Build request body
    const requestBody: any = { 
      message
    };
    
    // Include optional parameters if available
    if (previousResponseId) {
      requestBody.previous_response_id = previousResponseId;
    }
    
    if (chatId) {
      requestBody.chat_id = chatId;
    }
    
    // Include previous messages if available (for resuming conversations)
    if (previousMessages && previousMessages.length > 0) {
      // Only include up to the last 10 messages to keep request size reasonable
      const recentMessages = previousMessages.slice(-10);
      console.log(`Sending ${recentMessages.length} previous messages for context`);
      
      // Prepare messages for API - ensure dates are serialized correctly
      requestBody.previous_messages = recentMessages.map(prepareMessageForApi);
    }
    
    const response = await http.post<ChatResponse>('/api/chat', requestBody);
    
    // Add the response ID and chat ID to the returned message
    return {
      ...response.data.message,
      responseId: response.data.response_id,
      chatId: response.data.chat_id
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserChats = async (): Promise<ChatListItem[]> => {
  try {
    const http = await createAuthenticatedRequest();
    const response = await http.get('/api/chats');
    return response.data.chats || [];
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const http = await createAuthenticatedRequest();
    const response = await http.get(`/api/chats/${chatId}/messages`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    return [];
  }
};

export const createChat = async (title: string): Promise<string | null> => {
  try {
    const http = await createAuthenticatedRequest();
    const response = await http.post('/api/chats', { title });
    return response.data.chat_id;
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
};

export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  try {
    const http = await createAuthenticatedRequest();
    await http.put(`/api/chats/${chatId}/title`, { title });
    return true;
  } catch (error) {
    console.error(`Error updating chat ${chatId} title:`, error);
    return false;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    const http = await createAuthenticatedRequest();
    await http.delete(`/api/chats/${chatId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error);
    return false;
  }
}; 