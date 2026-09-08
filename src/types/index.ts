export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface DirectParticipant {
  _id: string;
  name: string;
  phone: string;
}

export interface LastMessage {
  _id?: string;
  conversation?: string;
  sender?: string;
  text?: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: (DirectParticipant | string)[];
  participant?: DirectParticipant;
  lastMessage?: LastMessage;
  updatedAt?: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | DirectParticipant;
  text: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'error' | 'queued';
  tempId?: string;
  reactions?: Record<string, string[]>; // emoji -> array of user names
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SearchUserResult extends User {}

export interface MessagesResponse {
  messages: Message[];
}

export interface ConversationsResponse {
  data: Conversation[];
}

export type ActiveTab = 'chat' | 'landing' | 'docs' | 'writeup';
