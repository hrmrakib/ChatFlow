import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createGroupChat } from '../../store/slices/chatSlice';
import { api } from '../../services/api';
import { User } from '../../types';
import { Users, X, Check, Loader2, Search, AlertCircle } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { token, user: currentUser } = useAppSelector((state) => state.auth);

  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setQuery('');
      setSelectedUsers([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!token) return;
      setIsSearching(true);
      try {
        const data = await api.users.search(query.trim() || 'a', token);
        const filtered = data.filter((u) => u._id !== currentUser?._id);
        setAvailableUsers(filtered);
      } catch {
        // silent search fallback
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen, token, currentUser?._id]);

  if (!isOpen) return null;

  const toggleSelectUser = (u: User) => {
    if (selectedUsers.some((item) => item._id === u._id)) {
      setSelectedUsers(selectedUsers.filter((item) => item._id !== u._id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedUsers.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(
        createGroupChat({
          name: groupName.trim(),
          participantIds: selectedUsers.map((u) => u._id),
        })
      ).unwrap();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Create New Group</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Group Name
            </label>
            <input
              id="group-name-input"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Engineering Core, Product Design, Madagascar Team"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-xs"
                  >
                    <span>{u.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleSelectUser(u)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Member Search */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Add Participants
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-group-members-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search colleagues to add..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 p-1">
              {isSearching ? (
                <div className="py-6 flex items-center justify-center text-slate-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-400" />
                  <span>Searching...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs">No users found</div>
              ) : (
                availableUsers.map((u) => {
                  const isSelected = selectedUsers.some((sel) => sel._id === u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleSelectUser(u)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.phone}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-group-btn"
              type="submit"
              disabled={isSubmitting || !groupName.trim() || selectedUsers.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Group...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>Create Group ({selectedUsers.length + 1} members)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
