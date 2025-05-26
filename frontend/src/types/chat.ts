export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum MessageType {
  TEXT = 'text',
  FUNCTION_CALL = 'function_call',
  FUNCTION_CALL_OUTPUT = 'function_call_output'
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  responseId?: string;  // ID returned by OpenAI for context
  messageId?: string;   // Firestore message ID
  chatId?: string;      // ID of the chat this message belongs to
  type?: MessageType;   // Type of message (text, function call, etc.)
  
  // Function call fields
  name?: string;        // For function calls
  arguments?: string;   // JSON-encoded arguments
  call_id?: string;     // For linking function calls and results
  output?: string;      // For function call results
}

export interface ChatConversation {
  id?: string;
  messages: ChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
  lastResponseId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  response_id: string;
  chat_id: string;
}

export interface ChatListItem {
  chat_id: string;
  title: string;
  created_at: string | Date;
  updated_at: string | Date;
  last_message?: string;
}

export interface Chat {
  chat_id: string;
  user_id: string;
  title: string;
  created_at: string | Date;
  updated_at: string | Date;
  messages: ChatMessage[];
} 