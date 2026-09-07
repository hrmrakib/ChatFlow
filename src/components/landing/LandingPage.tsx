import React, { useState } from 'react';
import {
  Zap,
  Users,
  Radio,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Send,
} from 'lucide-react';

interface LandingPageProps {
  onEnterChat: () => void;
  onViewDocs: () => void;
  onViewWriteup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterChat,
  onViewDocs,
  onViewWriteup,
}) => {
  // Interactive mini preview state
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState([
    { id: 1, sender: 'Alex Rivera', text: 'Hey team, did you check the real-time websocket latency?', isMe: false, time: '10:42 AM' },
    { id: 2, sender: 'You', text: 'Sub-15ms on Render nodes! Plus optimistic updates are buttery smooth.', isMe: true, time: '10:43 AM' },
    { id: 3, sender: 'Sarah Chen', text: 'Love the auto-scroll lock when reading history 👍', isMe: false, time: '10:44 AM' },
  ]);

  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: demoInput.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDemoMessages((prev) => [...prev, newMsg]);
    setDemoInput('');

    // Simulate instant teammate response
    setTimeout(() => {
      setDemoMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'Pulse Bot',
          text: '⚡ Instant message acknowledged via duplex socket stream.',
          isMe: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 900);
  };

  return (
    <div id="landing-page-root" className="min-h-full bg-slate-950 text-slate-100 overflow-y-auto selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-48 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Tag */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Production-Grade Chat Architecture • Take-Home Challenge</span>
            </div>
          </div>

          {/* Main Hero Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Real-time messaging engineered for <span className="text-indigo-400">zero compromise</span>.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              ChatFlow couples instantaneous Socket.io duplex streaming with Redux Toolkit state reconciliation, smart auto-scroll ergonomics, and seamless group dynamics.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              id="hero-launch-chat-btn"
              onClick={onEnterChat}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>Launch Live Chat App</span>
              <ArrowRight className="w-4 h-4" />
            </button>    
          </div>

          {/* Interactive Live Hero Widget (Bonus Feature) */}
          <div className="mt-14 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Widget top bar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">live-simulator // websocket-duplex</span>
              </div>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Link</span>
              </span>
            </div>

            {/* Simulated message stream */}
            <div className="p-4 space-y-3 h-52 overflow-y-auto bg-slate-950/50">
              {demoMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  {!msg.isMe && (
                    <span className="text-[10px] font-medium text-indigo-400 mb-0.5 ml-2">
                      {msg.sender}
                    </span>
                  )}
                  <div
                    className={`px-3.5 py-2 rounded-xl text-xs max-w-[80%] ${
                      msg.isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        msg.isMe ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive demo input */}
            <form onSubmit={handleSendDemoMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex space-x-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Test sending a live simulator message..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!demoInput.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Pillar Matrix */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Architected for Real-World Scalability
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Every design decision balances immediate responsiveness with strict production resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real-Time Duplex Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Native Socket.io WebSocket connection authenticated via JWT handshake with automatic reconnection backoff and seamless HTTP polling fallback.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Instant `message:new` dispatch</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Idempotent state reconciliation</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Smart Auto-Scroll Ergonomics</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Maintains scroll lock to newest messages by default, but intelligently pauses auto-scrolling when users scroll up to inspect conversation backlog.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Scroll position preservation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Interactive &quot;New messages below&quot; pill</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Role Group Chats</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Rich collaborative channels supporting creator admin rights, dynamic member invitations, group renaming, and voluntary exit workflows.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>RBAC Admin designation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Live participant roster updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <footer className="py-12 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>ChatFlow Candidate Deliverable • Built with Next.js, TypeScript, TailwindCSS &amp; Redux Toolkit</p>
      </footer>
    </div>
  );
};
