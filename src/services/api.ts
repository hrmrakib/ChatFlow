import { User, Conversation, Message, LoginResponse } from '../types';

export const API_BASE_URL = 'https://frontend-task-chatapp.onrender.com/api';
export const SOCKET_ORIGIN = 'https://frontend-task-chatapp.onrender.com';

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message =
      typeof errorData === 'object' && errorData !== null && 'message' in errorData
        ? String((errorData as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (phone: string, name: string): Promise<LoginResponse> =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, name }),
      }),
    me: (token: string): Promise<User> =>
      request<User>('/auth/me', { method: 'GET' }, token),
  },

  users: {
    search: (query: string, token: string): Promise<User[]> =>
      request<User[]>(`/users/search?q=${encodeURIComponent(query)}`, { method: 'GET' }, token),
  },

  conversations: {
    list: async (token: string): Promise<Conversation[]> => {
      const res = await request<{ data: Conversation[] }>('/conversations', { method: 'GET' }, token);
      return res.data || [];
    },

    startDirect: (userId: string, token: string): Promise<Conversation> =>
      request<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }, token),

    createGroup: (name: string, participantIds: string[], token: string): Promise<Conversation> =>
      request<Conversation>('/conversations/group', {
        method: 'POST',
        body: JSON.stringify({ name, participantIds }),
      }, token),

    getMessages: async (conversationId: string, token: string): Promise<Message[]> => {
      const res = await request<{ messages: Message[] }>(
        `/conversations/${conversationId}/messages`,
        { method: 'GET' },
        token
      );
      return res.messages || [];
    },

    addParticipants: (conversationId: string, userIds: string[], token: string): Promise<unknown> =>
      request(`/conversations/${conversationId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ userIds }),
      }, token),

    removeParticipant: (conversationId: string, userId: string, token: string): Promise<unknown> =>
      request(`/conversations/${conversationId}/participants/${userId}`, {
        method: 'DELETE',
      }, token),

    promoteAdmin: (conversationId: string, userId: string, token: string): Promise<unknown> =>
      request(`/conversations/${conversationId}/admins`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }, token),

    renameGroup: (conversationId: string, name: string, token: string): Promise<Conversation> =>
      request<Conversation>(`/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }, token),
  },

  messages: {
    send: (conversationId: string, text: string, token: string): Promise<Message> =>
      request<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text }),
      }, token),
  },

  health: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
