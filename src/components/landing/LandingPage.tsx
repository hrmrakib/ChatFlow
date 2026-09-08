import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Users,
  Radio,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Send,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  Database,
  Globe,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onEnterChat: () => void;
  onViewDocs: () => void;
  onViewWriteup: () => void;
}

type NetworkState = 'optimal' | 'latency' | 'offline';

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterChat,
}) => {
  // Interactive mini preview state
  const [demoInput, setDemoInput] = useState('');
  const [networkState, setNetworkState] = useState<NetworkState>('optimal');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [demoMessages, setDemoMessages] = useState([
    { id: 1, sender: 'Alex Rivera', text: 'Hey team, did you check the real-time websocket latency?', isMe: false, time: '10:42 AM', status: 'sent' },
    { id: 2, sender: 'You', text: 'Sub-15ms on Render nodes! Plus optimistic updates are buttery smooth.', isMe: true, time: '10:43 AM', status: 'sent' },
    { id: 3, sender: 'Sarah Chen', text: 'Love the auto-scroll lock when reading history 👍', isMe: false, time: '10:44 AM', status: 'sent' },
  ]);

  // Auto-scroll demo chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [demoMessages, isTyping]);

  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    
    const msgId = Date.now();
    const newMsg = {
      id: msgId,
      sender: 'You',
      text: demoInput.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: networkState === 'offline' ? 'queued' : 'sending',
    };
    
    setDemoMessages((prev) => [...prev, newMsg]);
    setDemoInput('');

    // Simulate Network Behavior
    if (networkState === 'offline') {
       // Message stays queued
       return;
    }

    const latencyDelay = networkState === 'latency' ? 2500 : 300;

    // Confirm message sent
    setTimeout(() => {
      setDemoMessages((prev) => 
        prev.map(m => m.id === msgId ? { ...m, status: 'sent' } : m)
      );
      
      // Simulate reply
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setDemoMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'Pulse Bot',
              text: `⚡ Message received in ${networkState === 'latency' ? 'high-latency' : 'optimal'} mode.`,
              isMe: false,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'sent'
            },
          ]);
        }, 1200);
      }, 500);

    }, latencyDelay);
  };

  // Reconnect logic when coming back online
  useEffect(() => {
    if (networkState !== 'offline') {
      const queuedMsgs = demoMessages.filter(m => m.status === 'queued');
      if (queuedMsgs.length > 0) {
        setDemoMessages(prev => prev.map(m => m.status === 'queued' ? { ...m, status: 'sending' } : m));
        setTimeout(() => {
           setDemoMessages(prev => prev.map(m => m.status === 'sending' ? { ...m, status: 'sent' } : m));
        }, networkState === 'latency' ? 1500 : 400);
      }
    }
  }, [networkState]);

  return (
    <div id="landing-page-root" className="min-h-full bg-[#030712] text-slate-100 overflow-y-auto selection:bg-cyan-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Header Tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md mb-8 group hover:border-cyan-500/30 transition-all cursor-default">
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all" />
          <span className="text-xs font-semibold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
            ChatFlow • Enterprise Chat Architecture
          </span>
        </div>

        {/* Main Hero Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[1.05]">
            Real-time messaging.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm">
              Zero compromises.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Experience instantaneous Socket.io duplex streaming combined with Redux Toolkit state reconciliation, engineered for production resilience.
          </p>
        </div>

        {/* Interactive Hero Widget (Bonus Feature) */}
        <div className="w-full max-w-3xl relative">
          
          {/* Glow Behind Widget */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-[2rem] blur opacity-20"></div>
          
          <div className="relative bg-[#0A0F1C]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
            
            {/* Widget Header - Network Controls */}
            <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1.5" /> Live Sandbox
                </span>
              </div>
              
              {/* The "Thoughtful Extra Element": Network Simulator */}
              <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => setNetworkState('optimal')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center transition-all ${networkState === 'optimal' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Wifi className="w-3 h-3 mr-1" /> Optimal
                </button>
                <button 
                  onClick={() => setNetworkState('latency')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center transition-all ${networkState === 'latency' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Activity className="w-3 h-3 mr-1" /> 3G (Slow)
                </button>
                <button 
                  onClick={() => setNetworkState('offline')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center transition-all ${networkState === 'offline' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </button>
              </div>
            </div>

            {/* Offline Banner */}
            <div className={`overflow-hidden transition-all duration-300 ${networkState === 'offline' ? 'h-8 opacity-100' : 'h-0 opacity-0'}`}>
              <div className="bg-rose-500/20 border-b border-rose-500/20 flex items-center justify-center h-full">
                <AlertCircle className="w-3 h-3 text-rose-400 mr-2" />
                <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-widest">Network disconnected. Messages will be queued.</span>
              </div>
            </div>
            
            {/* High Latency Banner */}
            <div className={`overflow-hidden transition-all duration-300 ${networkState === 'latency' ? 'h-8 opacity-100' : 'h-0 opacity-0'}`}>
              <div className="bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center h-full">
                <Activity className="w-3 h-3 text-amber-400 mr-2 animate-pulse" />
                <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-widest">Simulating High Latency (3G). Optimistic updates active.</span>
              </div>
            </div>

            {/* Simulated message stream */}
            <div ref={scrollRef} className="p-6 space-y-4 h-64 overflow-y-auto bg-black/20 scroll-smooth">
              {demoMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                >
                  {!msg.isMe && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 mb-1 ml-2">
                      {msg.sender}
                    </span>
                  )}
                  <div className="flex items-end space-x-2">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                        msg.isMe
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-sm'
                          : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm backdrop-blur-sm'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 mr-1">
                    <span className={`text-[9px] font-medium ${msg.isMe ? 'text-cyan-400/60' : 'text-slate-500'}`}>
                      {msg.time}
                    </span>
                    {msg.isMe && (
                      <span className="text-[10px] ml-1">
                        {msg.status === 'queued' && <span className="text-slate-500">Queued...</span>}
                        {msg.status === 'sending' && <span className="text-cyan-300/50 italic">Sending...</span>}
                        {msg.status === 'sent' && <CheckCircle2 className="w-3 h-3 text-cyan-400 inline" />}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start animate-in fade-in duration-200">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive demo input */}
            <form onSubmit={handleSendDemoMessage} className="p-4 bg-white/5 border-t border-white/10 flex space-x-3">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Experience optimistic updates live..."
                className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!demoInput.trim()}
                className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white rounded-xl text-sm font-bold flex items-center space-x-2 transition-all"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Launch CTA */}
        <div className="mt-12">
          <button
            onClick={onEnterChat}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-2xl text-lg shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 hover:shadow-indigo-500/40 flex items-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Enter Full Chat App</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Bento Grid Feature Matrix */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Engineered for <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Scale.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Robust architecture designed to handle edge cases effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
            
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-white/5 p-8 flex flex-col justify-between group hover:border-cyan-500/30 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-all" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Duplex WebSocket Engine</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Native Socket.io connection authenticated via JWT handshake. Features automatic reconnection backoff and seamless HTTP polling fallback when WebSockets are blocked.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>Instant \`message:new\` dispatch</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>Idempotent state reconciliation</span>
                </div>
              </div>
            </div>

            {/* Feature 2 - Small */}
            <div className="md:col-span-2 rounded-3xl bg-slate-900/60 border border-white/5 p-8 flex flex-col justify-center group hover:border-fuchsia-500/30 transition-all relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[60px]" />
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Smart Auto-Scroll</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Maintains scroll lock to newest messages natively, intelligently pausing when users scroll up to inspect conversation backlog.
              </p>
            </div>

            {/* Feature 3 - Small */}
            <div className="md:col-span-1 rounded-3xl bg-slate-900/60 border border-white/5 p-6 flex flex-col justify-center group hover:border-emerald-500/30 transition-all text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Group Dynamics</h3>
              <p className="text-slate-400 text-xs">Rich channels with RBAC admin rights.</p>
            </div>

             {/* Feature 4 - Small */}
             <div className="md:col-span-1 rounded-3xl bg-slate-900/60 border border-white/5 p-6 flex flex-col justify-center group hover:border-indigo-500/30 transition-all text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
              <p className="text-slate-400 text-xs">JWT-based authentication flows.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 relative z-10 border-t border-white/5 text-center flex flex-col items-center">
        <div className="flex space-x-6 mb-6">
          <Database className="w-5 h-5 text-slate-600" />
          <Globe className="w-5 h-5 text-slate-600" />
          <Activity className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
          ChatFlow Architecture
        </p>
      </footer>
    </div>
  );
};
