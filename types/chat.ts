export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: Role;
  content: string;
} 