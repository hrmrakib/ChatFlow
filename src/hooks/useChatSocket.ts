import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { socketService } from '../services/socket';
import {
  fetchConversations,
  fetchMessages,
  setConnectionStatus,
  chatSlice,
} from '../store/slices/chatSlice';

export function useChatSocket() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { activeConversationId } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      return;
    }

    socketService.connect(token);

    const unsubStatus = socketService.onStatusChange((status) => {
      dispatch(setConnectionStatus(status));
    });

    // Request notification permission if not already granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const unsubMessage = socketService.onMessage((msg) => {
      dispatch(
        chatSlice.actions.receiveSocketMessage({
          message: msg,
          currentUserId: user?._id,
        })
      );

      // Show native browser notification if app is in background
      if (
        typeof document !== 'undefined' &&
        document.hidden &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
        if (senderId !== user?._id) {
          const senderName = typeof msg.sender === 'object' && msg.sender.name ? msg.sender.name : 'New Message';
          new Notification(`ChatFlow: ${senderName}`, {
            body: msg.text,
            icon: '/favicon.ico',
          });
        }
      }
    });

    const unsubConv = socketService.onConversationUpdate(() => {
      dispatch(fetchConversations());
    });

    return () => {
      unsubStatus();
      unsubMessage();
      unsubConv();
    };
  }, [token, user?._id, dispatch]);
}
