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

    return () => {
      unsubStatus();
      unsubMessage();
      unsubConv();
    };
  }, [token, user?._id, dispatch]);
}
