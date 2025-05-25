export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  responseId?: string;
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
} 