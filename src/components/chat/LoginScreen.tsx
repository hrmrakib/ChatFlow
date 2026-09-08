import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearAuthError, setMockUser } from '../../store/slices/authSlice';
import { MessageSquare, Phone, User as UserIcon, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface DemoUserPreset {
  name: string;
  phone: string;
  role: string;
}

const DEMO_USERS: DemoUserPreset[] = [
  { name: 'Alex Rivera', phone: '+15551234567', role: 'Engineering Lead' },
  { name: 'Sarah Chen', phone: '+15559876543', role: 'Product Designer' },
];

export const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim() || isLoading) return;
    dispatch(loginUser({ phone: phone.trim(), name: name.trim() }));
  };

  const handleSelectDemo = (preset: DemoUserPreset) => {
    setPhone(preset.phone);
    setName(preset.name);
    dispatch(clearAuthError());
    dispatch(loginUser({ phone: preset.phone, name: preset.name }));
  };

  return (
    <div id="login-screen" className="h-full w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-inner">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to ChatFlow</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Real-time chat platform built for the challenge. Instant registration on first login.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-2">
            <span className="font-semibold text-rose-400">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Include country code or arbitrary test number</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading || !phone.trim() || !name.trim()}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Render API...</span>
              </>
            ) : (
              <>
                <span>Enter Chat Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Presets */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Reviewer Test Accounts:</span>
          </div>

          <div className="space-y-2">
            {DEMO_USERS.map((preset) => (
              <button
                key={preset.phone}
                id={`demo-user-${preset.phone.replace(/[^0-9]/g, '')}`}
                type="button"
                onClick={() => handleSelectDemo(preset)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    {preset.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{preset.phone} • {preset.role}</p>
                </div>
                <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Select &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>No passwords required • Automatic JWT handshake</span>
        </div>
      </div>
    </div>
  );
};
