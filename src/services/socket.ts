import { io, Socket } from 'socket.io-client';
import { SOCKET_ORIGIN } from './api';
import { Message, Conversation } from '../types';

let socket: Socket | null = null;
let currentToken: string | null = null;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type MessageCallback = (message: Message) => void;
type ConversationUpdateCallback = (conversation: Conversation | { conversationId: string }) => void;
type StatusCallback = (status: ConnectionStatus) => void;

const messageListeners = new Set<MessageCallback>();
const conversationListeners = new Set<ConversationUpdateCallback>();
const statusListeners = new Set<StatusCallback>();

let currentStatus: ConnectionStatus = 'disconnected';

function notifyStatus(status: ConnectionStatus) {
  currentStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

export const socketService = {
  connect(token: string) {
    if (socket && currentToken === token && socket.connected) {
      return;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    currentToken = token;
    notifyStatus('connecting');

    socket = io(SOCKET_ORIGIN, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      notifyStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        notifyStatus('disconnected');
      } else {
        notifyStatus('connecting');
      }
    });

    socket.on('connect_error', () => {
      notifyStatus('error');
    });

    socket.on('message:new', (msg: Message) => {
      messageListeners.forEach((fn) => fn(msg));
    });

    socket.on('conversation:updated', (conv: Conversation | { conversationId: string }) => {
      conversationListeners.forEach((fn) => fn(conv));
    });
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    currentToken = null;
    notifyStatus('disconnected');
  },

  sendMessage(
    conversationId: string,
    text: string,
    ackCallback?: (ack: { ok?: boolean; error?: string }) => void
  ) {
    if (!socket || !socket.connected) {
      if (ackCallback) ackCallback({ error: 'Socket not connected' });
      return;
    }
    socket.emit('message:send', { conversationId, text }, ackCallback);
  },

  onMessage(cb: MessageCallback) {
    messageListeners.add(cb);
    return () => {
      messageListeners.delete(cb);
    };
  },

  onConversationUpdate(cb: ConversationUpdateCallback) {
    conversationListeners.add(cb);
    return () => {
      conversationListeners.delete(cb);
    };
  },

  onStatusChange(cb: StatusCallback) {
    statusListeners.add(cb);
    cb(currentStatus);
    return () => {
      statusListeners.delete(cb);
    };
  },

  getStatus(): ConnectionStatus {
    return currentStatus;
  },

  isConnected(): boolean {
    return !!(socket && socket.connected);
  },
};
