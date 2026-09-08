import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '../../types';
import { api } from '../../services/api';
import { socketService, ConnectionStatus } from '../../services/socket';
import { playMessageReceivedSound, playMessageSentSound } from '../../utils/sound';
import { RootState } from '../index';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> Message[]
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  soundEnabled: boolean;
  hasNewMessageBelow: boolean;
  searchQuery: string;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  connectionStatus: 'disconnected',
  soundEnabled: true,
  hasNewMessageBelow: false,
  searchQuery: '',
};

export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { state: RootState }
>('chat/fetchConversations', async (_, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('Not authenticated');
  try {
    const list = await api.conversations.list(token);
    return list;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch conversations';
    return rejectWithValue(msg);
  }
});

export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: Message[] },
  string,
  { state: RootState }
>('chat/fetchMessages', async (conversationId, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('Not authenticated');
  try {
    const messages = await api.conversations.getMessages(conversationId, token);
    return { conversationId, messages };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch messages';
    return rejectWithValue(msg);
  }
});

export const syncOfflineMessages = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('chat/syncOfflineMessages', async (_, { getState, dispatch }) => {
  const token = getState().auth.token;
  if (!token) return;

  const queueStr = localStorage.getItem('chat_offline_queue');
  if (!queueStr) return;

  try {
    const queue: { tempId: string; conversationId: string; text: string; createdAt: string; sender: string }[] = JSON.parse(queueStr);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remainingQueue = [...queue];

    for (const msg of queue) {
      try {
        const sentMsg = await api.messages.send(msg.conversationId, msg.text, token);
        dispatch(chatSlice.actions.reconcileMessage({ tempId: msg.tempId, realMessage: sentMsg }));
        
        // Remove from remaining queue
        const idx = remainingQueue.findIndex(m => m.tempId === msg.tempId);
        if (idx > -1) remainingQueue.splice(idx, 1);
        localStorage.setItem('chat_offline_queue', JSON.stringify(remainingQueue));
      } catch (err) {
        // If it fails due to network, stop processing the rest so they stay in order
        break;
      }
    }
  } catch (err) {
    console.error('Failed to parse offline queue', err);
    localStorage.removeItem('chat_offline_queue');
  }
});

export const sendMessage = createAsyncThunk<
  Message | null,
  { conversationId: string; text: string },
  { state: RootState }
>('chat/sendMessage', async ({ conversationId, text }, { getState, dispatch, rejectWithValue }) => {
  const token = getState().auth.token;
  const user = getState().auth.user;
  if (!token || !user) return rejectWithValue('Not authenticated');

  const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const optimisticMsg: Message = {
    _id: tempId,
    tempId,
    conversation: conversationId,
    sender: user._id,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    status: isOnline ? 'sending' : 'queued',
  };

  dispatch(chatSlice.actions.addOptimisticMessage(optimisticMsg));

  if (getState().chat.soundEnabled) {
    playMessageSentSound();
  }

  if (!isOnline) {
    try {
      const queueStr = localStorage.getItem('chat_offline_queue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      queue.push({
        tempId,
        conversationId,
        text: text.trim(),
        createdAt: optimisticMsg.createdAt,
        sender: user._id
      });
      localStorage.setItem('chat_offline_queue', JSON.stringify(queue));
    } catch (err) {
      console.error('Failed to save message offline', err);
    }
    return null; // Return null to prevent rejecting
  }

  try {
    const sentMsg = await api.messages.send(conversationId, text.trim(), token);

    dispatch(chatSlice.actions.reconcileMessage({ tempId, realMessage: sentMsg }));
    return sentMsg;
  } catch (err: unknown) {
    dispatch(chatSlice.actions.markMessageFailed({ conversationId, tempId }));
    const msg = err instanceof Error ? err.message : 'Failed to send message';
    return rejectWithValue(msg);
  }
});

export const startDirectChat = createAsyncThunk<
  Conversation,
  string,
  { state: RootState }
>('chat/startDirectChat', async (targetUserId, { getState, dispatch, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('Not authenticated');
  try {
    const conv = await api.conversations.startDirect(targetUserId, token);
    await dispatch(fetchConversations());
    dispatch(chatSlice.actions.setActiveConversation(conv._id));
    return conv;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to start conversation';
    return rejectWithValue(msg);
  }
});

export const createGroupChat = createAsyncThunk<
  Conversation,
  { name: string; participantIds: string[] },
  { state: RootState }
>('chat/createGroupChat', async ({ name, participantIds }, { getState, dispatch, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('Not authenticated');
  try {
    const group = await api.conversations.createGroup(name, participantIds, token);
    await dispatch(fetchConversations());
    dispatch(chatSlice.actions.setActiveConversation(group._id));
    return group;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create group';
    return rejectWithValue(msg);
  }
});

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      state.hasNewMessageBelow = false;
    },
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setHasNewMessageBelow(state, action: PayloadAction<boolean>) {
      state.hasNewMessageBelow = action.payload;
    },
    addOptimisticMessage(state, action: PayloadAction<Message>) {
      const { conversation } = action.payload;
      if (!state.messages[conversation]) {
        state.messages[conversation] = [];
      }
      state.messages[conversation].push(action.payload);

      // Update conversation lastMessage
      const conv = state.conversations.find((c) => c._id === conversation);
      if (conv) {
        conv.lastMessage = {
          _id: action.payload._id,
          text: action.payload.text,
          createdAt: action.payload.createdAt,
          sender: typeof action.payload.sender === 'string' ? action.payload.sender : action.payload.sender._id,
        };
        conv.updatedAt = action.payload.createdAt;
      }
    },
    reconcileMessage(
      state,
      action: PayloadAction<{ tempId: string; realMessage: Message }>
    ) {
      const { tempId, realMessage } = action.payload;
      const convId = realMessage.conversation;
      const list = state.messages[convId];
      if (list) {
        const idx = list.findIndex((m) => m._id === tempId || m.tempId === tempId);
        if (idx !== -1) {
          list[idx] = { ...realMessage, status: 'sent' };
        } else {
          // If tempId not found and real message isn't there, push it
          if (!list.some((m) => m._id === realMessage._id)) {
            list.push({ ...realMessage, status: 'sent' });
          }
        }
      }
    },
    markMessageFailed(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>
    ) {
      const { conversationId, tempId } = action.payload;
      const list = state.messages[conversationId];
      if (list) {
        const msg = list.find((m) => m._id === tempId || m.tempId === tempId);
        if (msg) {
          msg.status = 'error';
        }
      }
    },
    receiveSocketMessage(
      state,
      action: PayloadAction<{ message: Message; currentUserId: string | undefined }>
    ) {
      const { message, currentUserId } = action.payload;
      const convId = message.conversation;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      const list = state.messages[convId];
      // Check if already exists (by _id)
      const exists = list.some((m) => m._id === message._id);

      if (!exists) {
        list.push({ ...message, status: 'sent' });

        const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
        if (currentUserId && senderId !== currentUserId) {
          if (state.soundEnabled) {
            playMessageReceivedSound();
          }
          if (state.activeConversationId === convId) {
            // Check if user scrolled up
          }
        }
      }

      // Update conversation in list
      const conv = state.conversations.find((c) => c._id === convId);
      if (conv) {
        conv.lastMessage = {
          _id: message._id,
          text: message.text,
          createdAt: message.createdAt,
          sender: typeof message.sender === 'string' ? message.sender : message.sender._id,
        };
        conv.updatedAt = message.createdAt;
      }
    },
    addReaction(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        emoji: string;
        userName: string;
      }>
    ) {
      const { conversationId, messageId, emoji, userName } = action.payload;
      const list = state.messages[conversationId];
      if (list) {
        const msg = list.find((m) => m._id === messageId);
        if (msg) {
          if (!msg.reactions) msg.reactions = {};
          if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
          const users = msg.reactions[emoji];
          if (users.includes(userName)) {
            msg.reactions[emoji] = users.filter((u) => u !== userName);
            if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
          } else {
            msg.reactions[emoji].push(userName);
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload;
        // If no active conversation yet and conversations exist, select first one
        if (!state.activeConversationId && action.payload.length > 0) {
          state.activeConversationId = action.payload[0]._id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = (action.payload as string) || 'Failed to load conversations';
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { conversationId, messages } = action.payload;
        // The API returns messages in descending order (newest first). 
        // We reverse them to ascending order so the newest are at the bottom.
        state.messages[conversationId] = messages.slice().reverse();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = (action.payload as string) || 'Failed to load messages';
      });
  },
});

export const {
  setActiveConversation,
  setConnectionStatus,
  toggleSound,
  setSearchQuery,
  setHasNewMessageBelow,
  addReaction,
} = chatSlice.actions;

export default chatSlice.reducer;
