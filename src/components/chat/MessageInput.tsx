import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendMessage } from '../../store/slices/chatSlice';
import { Send, Smile, Loader2, Paperclip } from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
}

const QUICK_EMOJIS = ['😊', '👍', '🔥', '🚀', '🎉', '💡', '❤️', '👏'];

const draftStore: Record<string, string> = {};

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();
  const { isSendingMessage } = useAppSelector((state) => state.chat);

  const [text, setText] = useState(draftStore[conversationId] || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync draft store when conversation changes
  useEffect(() => {
    setText(draftStore[conversationId] || '');
  }, [conversationId]);

  // Update draft store when text changes
  useEffect(() => {
    if (text.trim() || draftStore[conversationId]) {
      draftStore[conversationId] = text;
    }
  }, [text, conversationId]);

  const canSend = text.trim().length > 0 && !isSendingMessage;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText('');
    draftStore[conversationId] = '';
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    dispatch(sendMessage({ conversationId, text: trimmed }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-20">
      {/* Emoji picker drawer */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-150">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-slate-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl p-2 transition-colors">
        {/* Emoji trigger */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-xl transition-colors ${
            showEmojiPicker
              ? 'text-indigo-400 bg-indigo-950/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
          }`}
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          id="chat-message-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 max-h-32 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-2 px-1 leading-relaxed"
        />

        {/* Send Button */}
        <button
          id="send-message-btn"
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center flex-shrink-0"
          title="Send message (Enter)"
        >
          {isSendingMessage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="mt-1.5 px-2 flex justify-between items-center text-[10px] text-slate-500 select-none">
        <span>Press <b>Enter</b> to send, <b>Shift + Enter</b> for line break</span>
        <span>Markdown & Emojis supported</span>
      </div>
    </div>
  );
};
