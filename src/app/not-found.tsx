import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans w-screen h-screen">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6 shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back to the application.
        </p>

        <Link 
          href="/"
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
