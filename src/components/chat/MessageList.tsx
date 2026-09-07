import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addReaction } from '../../store/slices/chatSlice';
import { Message, Conversation, DirectParticipant } from '../../types';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  ArrowDown,
  Smile,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface MessageListProps {
  conversation: Conversation;
}

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '😂', '🚀', '🎉'];

export const MessageList: React.FC<MessageListProps> = ({ conversation }) => {
  const dispatch = useAppDispatch();
  const { messages, isLoadingMessages } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const conversationMessages = useMemo(() => {
    return messages[conversation._id] || [];
  }, [messages, conversation._id]);

  const { containerRef, hasNewMessages, handleScroll, scrollToBottom } = useAutoScroll(
    conversationMessages,
    { threshold: 90 }
  );

  // Map participant IDs to names for groups
  const participantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (conversation.participants) {
      conversation.participants.forEach((p) => {
        if (typeof p === 'object' && p !== null) {
          map.set(p._id, p.name);
        }
      });
    }
    return map;
  }, [conversation.participants]);

  const getSenderInfo = (msg: Message) => {
    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
    const isMe = senderId === currentUser?._id;
    let senderName = 'Teammate';

    if (isMe) {
      senderName = 'You';
    } else if (typeof msg.sender === 'object' && msg.sender !== null) {
      senderName = msg.sender.name;
    } else if (participantNameMap.has(senderId)) {
      senderName = participantNameMap.get(senderId)!;
    } else if (conversation.participant && conversation.participant._id === senderId) {
      senderName = conversation.participant.name;
    }

    return { isMe, senderName, senderId };
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleReactionClick = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    dispatch(
      addReaction({
        conversationId: conversation._id,
        messageId,
        emoji,
        userName: currentUser.name,
      })
    );
  };

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { date: string; items: Message[] }[] = [];
    let currentDate = '';
    let currentItems: Message[] = [];

    conversationMessages.forEach((msg) => {
      const dateKey = formatMessageDate(msg.createdAt);
      if (dateKey !== currentDate) {
        if (currentItems.length > 0) {
          groups.push({ date: currentDate, items: currentItems });
        }
        currentDate = dateKey;
        currentItems = [msg];
      } else {
        currentItems.push(msg);
      }
    });

    if (currentItems.length > 0) {
      groups.push({ date: currentDate, items: currentItems });
    }

    return groups;
  }, [conversationMessages]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-slate-950">
      {/* Scrollable Container */}
      <div
        id="messages-scroll-container"
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-medium">Loading chat history...</p>
            <p className="text-xs text-slate-600 mt-1">Decrypting conversation messages</p>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-950/50">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-300">No messages yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Be the first to say hello! Your messages are synchronized in real-time.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date} className="space-y-4">
              {/* Date divider */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-400 shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Messages in this date */}
              <div className="space-y-2.5">
                {group.items.map((msg, index) => {
                  const { isMe, senderName } = getSenderInfo(msg);
                  const isGroup = conversation.type === 'group';

                  return (
                    <div
                      key={msg._id || msg.tempId || index}
                      id={`message-bubble-${msg._id || msg.tempId}`}
                      className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {/* Group sender name tag for incoming messages */}
                      {!isMe && isGroup && (
                        <span className="text-[11px] font-medium text-indigo-400 mb-1 ml-3 select-none">
                          {senderName}
                        </span>
                      )}

                      <div className="relative max-w-[80%] sm:max-w-[70%] md:max-w-[62%]">
                        {/* Hover Quick Reaction Bar */}
                        <div
                          className={`absolute -top-7 ${
                            isMe ? 'right-0' : 'left-0'
                          } opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 shadow-lg flex items-center space-x-1 z-20`}
                        >
                          {COMMON_EMOJIS.slice(0, 4).map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReactionClick(msg._id, emoji)}
                              className="text-xs hover:scale-125 transition-transform p-0.5"
                              title={`React ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Bubble Body */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed break-words ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-slate-900 border border-slate-800/90 text-slate-100 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* Footer: Timestamp & Delivery Status */}
                          <div
                            className={`flex items-center justify-end space-x-1 text-[10px] mt-1 select-none ${
                              isMe ? 'text-indigo-200' : 'text-slate-500'
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>

                            {isMe && (
                              <span className="inline-flex items-center ml-0.5">
                                {msg.status === 'sending' ? (
                                  <Clock className="w-3 h-3 animate-pulse text-indigo-300" />
                                ) : msg.status === 'error' ? (
                                  <AlertCircle className="w-3 h-3 text-rose-300" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reaction badges */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div
                            className={`flex flex-wrap gap-1 mt-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {Object.entries(msg.reactions).map(([emoji, rawUsers]) => {
                              const userList = Array.isArray(rawUsers) ? (rawUsers as string[]) : [];
                              const hasReacted =
                                currentUser && userList.includes(currentUser.name);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactionClick(msg._id, emoji)}
                                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                                    hasReacted
                                      ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                  }`}
                                  title={`Reacted by: ${userList.join(', ')}`}
                                >
                                  <span>{emoji}</span>
                                  <span className="font-semibold text-[10px]">{userList.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Auto-Scroll Notification Pill */}
      {hasNewMessages && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            id="jump-to-latest-btn"
            onClick={() => scrollToBottom(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center space-x-2 text-xs font-semibold tracking-wide transition-all hover:scale-105 active:scale-95"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>New messages below</span>
          </button>
        </div>
      )}
    </div>
  );
};
