"use client"

import React, { useEffect, useState } from 'react';
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

  const [mounted, setMounted] = useState(false);
  useEffect (() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 flex items-center justify-between z-30 select-none flex-shrink-0 sticky top-0">
      {/* Brand */}
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <Link href={'/'}>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">ChatFlow</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center space-x-1 bg-black/20 ring-1 ring-white/5 backdrop-blur-md p-1 rounded-2xl shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/10 scale-100'
                  : 'text-slate-400 hover:text-white bg-white/5 scale-95 hover:scale-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {/* Socket live dot indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-medium tracking-widest uppercase">
          {connectionStatus === 'connected' ? (
            <span className="inline-flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full ring-1 ring-emerald-400/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-2 text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full ring-1 ring-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Standby</span>
            </span>
          )}
        </div>

        {mounted && user ? (
          <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <p className="text-xs font-bold text-slate-100 leading-tight tracking-wide">{user.name}</p>
              <p className="text-[10px] text-indigo-300/80 leading-none mt-0.5">{user.phone}</p>
            </div>
            <button
              id="logout-btn"
              onClick={() => { dispatch(logout()); onSelectTab('chat'); }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 ml-1 hover:scale-110 active:scale-95"
              title="Logout / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('chat')}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 tracking-wide"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};
