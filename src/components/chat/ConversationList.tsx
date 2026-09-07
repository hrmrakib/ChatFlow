import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveConversation } from '../../store/slices/chatSlice';
import { Conversation, DirectParticipant } from '../../types';
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  UserPlus,
  Loader2,
  Clock,
  CheckCheck,
} from 'lucide-react';

interface ConversationListProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onOpenNewChat,
  onOpenNewGroup,
}) => {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, isLoadingConversations } = useAppSelector(
    (state) => state.chat
  );
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [filterText, setFilterText] = useState('');

  const getConversationDetails = (conv: Conversation) => {
    if (conv.type === 'group') {
      return {
        title: conv.name || 'Group Chat',
        subtitle: `${conv.participants?.length || 0} participants`,
        isGroup: true,
        initials: (conv.name || 'GC').slice(0, 2).toUpperCase(),
      };
    }

    // Direct conversation: find other participant
    let otherName = 'Direct Contact';
    let otherPhone = '';
    if (conv.participant) {
      otherName = conv.participant.name;
      otherPhone = conv.participant.phone;
    } else if (Array.isArray(conv.participants)) {
      const other = conv.participants.find((p) => {
        if (typeof p === 'object' && p !== null) {
          return (p as DirectParticipant)._id !== currentUser?._id;
        }
        return p !== currentUser?._id;
      });
      if (typeof other === 'object' && other !== null) {
        otherName = (other as DirectParticipant).name;
        otherPhone = (other as DirectParticipant).phone;
      }
    }

    return {
      title: otherName,
      subtitle: otherPhone,
      isGroup: false,
      initials: otherName.slice(0, 2).toUpperCase(),
    };
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((c) => {
    if (!filterText.trim()) return true;
    const { title } = getConversationDetails(c);
    const lastMsg = c.lastMessage?.text || '';
    const term = filterText.toLowerCase();
    return title.toLowerCase().includes(term) || lastMsg.toLowerCase().includes(term);
  });

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Conversations</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {conversations.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="start-new-chat-btn"
            onClick={onOpenNewChat}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600 rounded-xl transition-all shadow-sm"
            title="Start Direct Chat"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            id="create-new-group-btn"
            onClick={onOpenNewGroup}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600 rounded-xl transition-all shadow-sm"
            title="Create Group Chat"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Search */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="filter-conversations-input"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search chats or messages..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Conversation Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-xs">Synchronizing conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">No conversations</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Search for team members or start a new group conversation to begin chatting.
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={onOpenNewChat}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const { title, subtitle, isGroup, initials } = getConversationDetails(c);
            const isActive = c._id === activeConversationId;
            const timeStr = formatTimestamp(c.lastMessage?.createdAt || c.updatedAt);
            const previewText = c.lastMessage?.text || 'No messages yet';

            return (
              <div
                key={c._id}
                id={`conversation-item-${c._id}`}
                onClick={() => dispatch(setActiveConversation(c._id))}
                className={`p-3.5 cursor-pointer transition-all flex items-start space-x-3 group relative ${
                  isActive
                    ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-semibold text-xs tracking-wider shadow-inner ${
                      isGroup
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white'
                        : 'bg-slate-800 text-indigo-300 border border-slate-700'
                    }`}
                  >
                    {isGroup ? <Users className="w-5 h-5" /> : initials}
                  </div>
                  {!isGroup && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {title}
                    </h3>
                    <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2">
                      {timeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <p className="truncate text-slate-400 group-hover:text-slate-300 text-[13px]">
                      {previewText}
                    </p>
                    {isGroup && (
                      <span className="ml-1.5 flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        Group
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
