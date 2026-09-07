import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { ActiveTab } from '../../types';
import {
  MessageSquare,
  Sparkles,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { connectionStatus } = useAppSelector((state) => state.chat);

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'landing', label: 'Showcase', icon: Sparkles },
  ];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 select-none flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <Link href={'/'}>
          <span className="font-bold text-sm tracking-tight text-white">ChatFlow</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-3">
        {/* Socket live dot indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-400">
          {connectionStatus === 'connected' ? (
            <span className="inline-flex items-center space-x-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px]">SOCKET ON</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="font-mono text-[10px]">STANDBY</span>
            </span>
          )}
        </div>

        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 leading-none">{user.phone}</p>
            </div>
            <button
              id="logout-btn"
              onClick={() => { dispatch(logout()); onSelectTab('chat'); }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Logout / Switch Account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('chat')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};
