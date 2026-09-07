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

    const unsubMessage = socketService.onMessage((msg) => {
      dispatch(
        chatSlice.actions.receiveSocketMessage({
          message: msg,
          currentUserId: user?._id,
        })
      );
    });

    const unsubConv = socketService.onConversationUpdate(() => {
      dispatch(fetchConversations());
    });

    // Safety polling fallback every 6 seconds to ensure zero missed messages
    const pollInterval = setInterval(() => {
      if (activeConversationId && token) {
        dispatch(fetchMessages(activeConversationId));
      }
    }, 6000);

    return () => {
      unsubStatus();
      unsubMessage();
      unsubConv();
      clearInterval(pollInterval);
    };
  }, [token, user?._id, activeConversationId, dispatch]);
}
