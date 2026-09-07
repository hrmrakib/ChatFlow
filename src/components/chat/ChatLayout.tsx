import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchConversations, fetchMessages, setActiveConversation } from '../../store/slices/chatSlice';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { NewConversationModal } from './NewConversationModal';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailsModal } from './GroupDetailsModal';
import { MessageSquare, ArrowLeft, Users, UserPlus } from 'lucide-react';

export const ChatLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId } = useAppSelector((state) => state.chat);
  const { token } = useAppSelector((state) => state.auth);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);

  // Initial load
  useEffect(() => {
    if (token) {
      dispatch(fetchConversations());
    }
  }, [token, dispatch]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (token && activeConversationId) {
      dispatch(fetchMessages(activeConversationId));
    }
  }, [token, activeConversationId, dispatch]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div id="chat-layout-root" className="flex-1 flex overflow-hidden bg-slate-950 relative">
      {/* Sidebar: on mobile, hidden if a conversation is actively open */}
      <div
        className={`${
          activeConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}
      >
        <ConversationList
          onOpenNewChat={() => setShowNewChatModal(true)}
          onOpenNewGroup={() => setShowNewGroupModal(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        } flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative`}
      >
        {activeConversation ? (
          <>
            {/* Mobile back button banner */}
            <div className="md:hidden bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center">
              <button
                onClick={() => dispatch(setActiveConversation(null))}
                className="text-xs text-indigo-400 flex items-center space-x-1 py-1 px-2 rounded-lg bg-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Conversations</span>
              </button>
            </div>

            <ChatHeader
              conversation={activeConversation}
              onOpenGroupDetails={() => setShowGroupDetailsModal(true)}
            />

            <MessageList conversation={activeConversation} />

            <MessageInput conversationId={activeConversation._id} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <div className="w-16 h-16 rounded-3xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 shadow-2xl shadow-indigo-950">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Select a conversation</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-2 leading-relaxed">
              Choose an existing direct message or group conversation from the sidebar, or initiate a new connection.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Start Direct Chat</span>
              </button>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewConversationModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />

      <CreateGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
      />

      {activeConversation && activeConversation.type === 'group' && (
        <GroupDetailsModal
          conversation={activeConversation}
          isOpen={showGroupDetailsModal}
          onClose={() => setShowGroupDetailsModal(false)}
        />
      )}
    </div>
  );
};
