import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchConversations, setActiveConversation } from '../../store/slices/chatSlice';
import { api } from '../../services/api';
import { Conversation, DirectParticipant } from '../../types';
import { Users, X, Shield, ShieldAlert, LogOut, Edit2, Check, Loader2, AlertCircle, UserPlus } from 'lucide-react';

interface GroupDetailsModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { token, user: currentUser } = useAppSelector((state) => state.auth);

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(conversation.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = conversation.admins?.includes(currentUser?._id || '') || conversation.createdBy === currentUser?._id;

  const handleRename = async () => {
    if (!token || !newName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.conversations.renameGroup(conversation._id, newName.trim(), token);
      await dispatch(fetchConversations());
      setIsRenaming(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to rename group');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.conversations.promoteAdmin(conversation._id, userId, token);
      await dispatch(fetchConversations());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to promote member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.conversations.removeParticipant(conversation._id, userId, token);
      await dispatch(fetchConversations());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!token || !currentUser) return;
    if (!window.confirm('Are you sure you want to leave this group conversation?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.conversations.removeParticipant(conversation._id, currentUser._id, token);
      await dispatch(fetchConversations());
      dispatch(setActiveConversation(null));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
      setIsLoading(false);
    }
  };

  const participants = conversation.participants || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Group Information</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Name Header */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            {isRenaming ? (
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleRename}
                  disabled={isLoading || !newName.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{conversation.name || 'Group Chat'}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setIsRenaming(true)}
                      className="text-slate-400 hover:text-indigo-400 p-1 rounded transition-colors"
                      title="Rename Group"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {participants.length} member{participants.length !== 1 ? 's' : ''} • Created by{' '}
                  {conversation.createdBy === currentUser?._id ? 'You' : 'Admin'}
                </p>
              </div>
            )}
          </div>

          {/* Participants list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Members
              </h4>
              {isAdmin && (
                <span className="text-[11px] text-indigo-400 flex items-center">
                  <Shield className="w-3 h-3 mr-1" /> Admin privileges enabled
                </span>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 p-1">
              {participants.map((p, idx) => {
                const isObj = typeof p === 'object' && p !== null;
                const pId = isObj ? (p as DirectParticipant)._id : String(p);
                const pName = isObj ? (p as DirectParticipant).name : `User ${pId.slice(-4)}`;
                const pPhone = isObj ? (p as DirectParticipant).phone : '';
                const isSelf = pId === currentUser?._id;
                const memberIsAdmin =
                  conversation.admins?.includes(pId) || conversation.createdBy === pId;

                return (
                  <div
                    key={pId || idx}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200">
                        {pName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-medium text-slate-200">
                            {pName} {isSelf && '(You)'}
                          </p>
                          {memberIsAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center">
                              Admin
                            </span>
                          )}
                        </div>
                        {pPhone && <p className="text-[10px] text-slate-400">{pPhone}</p>}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && !isSelf && (
                      <div className="flex items-center space-x-1">
                        {!memberIsAdmin && (
                          <button
                            onClick={() => handlePromoteAdmin(pId)}
                            disabled={isLoading}
                            className="px-2 py-1 text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded transition-colors"
                            title="Promote to Admin"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(pId)}
                          disabled={isLoading}
                          className="px-2 py-1 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition-colors"
                          title="Remove Member"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave group */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleLeaveGroup}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Group</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
