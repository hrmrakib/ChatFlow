import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store';
import { syncOfflineMessages } from '../store/slices/chatSlice';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      dispatch(syncOfflineMessages());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check (in case we're already online when mounting)
    if (navigator.onLine) {
      dispatch(syncOfflineMessages());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return isOnline;
};
