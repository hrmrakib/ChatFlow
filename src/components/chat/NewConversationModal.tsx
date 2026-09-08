import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { startDirectChat } from '../../store/slices/chatSlice';
import { api } from '../../services/api';
import { User } from '../../types';
import { Search, X, UserPlus, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { token, user: currentUser } = useAppSelector((state) => state.auth);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [submittingUserId, setSubmittingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      return;
    }

    // Default search or blank
    const timer = setTimeout(async () => {
      if (!token) return;
      setIsSearching(true);
      setError(null);
      try {
        const data = await api.users.search(query.trim() || 'a', token);
        // Exclude current user from results
        const filtered = data.filter((u) => u._id !== currentUser?._id);
        setResults(filtered);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, token, currentUser?._id]);

  if (!isOpen) return null;

  const handleStartChat = async (targetUser: User) => {
    setSubmittingUserId(targetUser._id);
    setError(null);
    try {
      await dispatch(startDirectChat(targetUser._id)).unwrap();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    } finally {
      setSubmittingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Start New Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-user-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by user name or phone number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-3 space-y-1.5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs">Searching user registry...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs mt-1">Try typing a different name or phone number</p>
            </div>
          ) : (
            results.map((u) => (
              <div
                key={u._id}
                className="p-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{u.name}</h4>
                    <p className="text-xs text-slate-400">{u.phone}</p>
                  </div>
                </div>

                <button
                  id={`start-chat-with-${u._id}`}
                  onClick={() => handleStartChat(u)}
                  disabled={submittingUserId !== null}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {submittingUserId === u._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Search matches live database</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
