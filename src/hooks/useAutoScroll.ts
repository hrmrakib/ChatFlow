import { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from '../types';

interface UseAutoScrollOptions {
  threshold?: number;
}

export function useAutoScroll(messages: Message[], options: UseAutoScrollOptions = {}) {
  const { threshold = 100 } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessagesCountRef = useRef(messages.length);

  const checkIfNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom <= threshold;
  }, [threshold]);

  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    if (nearBottom) {
      setHasNewMessages(false);
    }
  }, [checkIfNearBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setHasNewMessages(false);
    setIsNearBottom(true);
  }, []);

  // When messages update:
  useEffect(() => {
    const prevCount = prevMessagesCountRef.current;
    const currentCount = messages.length;
    prevMessagesCountRef.current = currentCount;

    if (currentCount > prevCount) {
      if (isNearBottom) {
        // User was already at the bottom, auto-scroll smoothly to newest
        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
      } else {
        // User is reviewing history up-page, do not interrupt; show notification pill
        setHasNewMessages(true);
      }
    }
  }, [messages, isNearBottom, scrollToBottom]);

  return {
    containerRef,
    isNearBottom,
    hasNewMessages,
    handleScroll,
    scrollToBottom,
  };
}
