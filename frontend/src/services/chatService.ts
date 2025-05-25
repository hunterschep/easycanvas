import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { ChatMessage, MessageRole, ChatResponse } from '@/types/chat';

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

export const sendMessage = async (message: string, previousResponseId?: string): Promise<ChatMessage> => {
  try {
    const http = await createAuthenticatedRequest();
    
    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content: message,
      timestamp: new Date(),
    };
    
    // Include the previous response ID if available
    const requestBody: any = { 
      message: userMessage 
    };
    
    if (previousResponseId) {
      requestBody.previous_response_id = previousResponseId;
    }
    
    const response = await http.post<ChatResponse>('/api/chat', requestBody);
    
    // Add the response ID to the returned message
    return {
      ...response.data.message,
      responseId: response.data.response_id
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 