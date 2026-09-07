import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSound, fetchMessages } from '../../store/slices/chatSlice';
import { Conversation, DirectParticipant } from '../../types';
import {
  Users,
  Volume2,
  VolumeX,
  RefreshCw,
  Info,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenGroupDetails: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onOpenGroupDetails,
}) => {
  const dispatch = useAppDispatch();
  const { connectionStatus, soundEnabled, isLoadingMessages } = useAppSelector(
    (state) => state.chat
  );
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const isGroup = conversation.type === 'group';

  let title = conversation.name || 'Conversation';
  let subtitle = '';

  if (isGroup) {
    const count = conversation.participants?.length || 0;
    subtitle = `${count} participant${count !== 1 ? 's' : ''}`;
  } else {
    if (conversation.participant) {
      title = conversation.participant.name;
      subtitle = conversation.participant.phone;
    } else if (Array.isArray(conversation.participants)) {
      const other = conversation.participants.find((p) => {
        if (typeof p === 'object' && p !== null) {
          return (p as DirectParticipant)._id !== currentUser?._id;
        }
        return p !== currentUser?._id;
      });
      if (typeof other === 'object' && other !== null) {
        title = (other as DirectParticipant).name;
        subtitle = (other as DirectParticipant).phone;
      }
    }
  }

  const handleRefresh = () => {
    dispatch(fetchMessages(conversation._id));
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Socket</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting...</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <WifiOff className="w-3 h-3" />
            <span>Socket Error (Polling)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">
            <Wifi className="w-3 h-3" />
            <span>Standby</span>
          </span>
        );
    }
  };

  return (
    <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 select-none">
      <div className="flex items-center space-x-3.5">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-xs tracking-wider shadow-inner ${
            isGroup
              ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white'
              : 'bg-slate-800 text-indigo-300 border border-slate-700'
          }`}
        >
          {isGroup ? <Users className="w-5 h-5" /> : title.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
            {isGroup && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20">
                Group
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-2">
            <span>{subtitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {getStatusBadge()}

        {/* Manual Refresh */}
        <button
          onClick={handleRefresh}
          disabled={isLoadingMessages}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh message history"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => dispatch(toggleSound())}
          className={`p-2 rounded-xl transition-colors ${
            soundEnabled
              ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={soundEnabled ? 'Mute message chime' : 'Enable message chime'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Group Details */}
        {isGroup && (
          <button
            onClick={onOpenGroupDetails}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Group Information and Settings"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
