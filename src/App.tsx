import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './store';
import { restoreSession } from './store/slices/authSlice';
import { useChatSocket } from './hooks/useChatSocket';
import { Navbar } from './components/common/Navbar';
import { ChatLayout } from './components/chat/ChatLayout';
import { LoginScreen } from './components/chat/LoginScreen';
import { LandingPage } from './components/landing/LandingPage';
import { ActiveTab } from './types';

export const AppShell: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  // Initialize socket listeners and backup polling
  useChatSocket();

  useEffect(() => {
    if (token && !user) {
      dispatch(restoreSession());
    }
  }, [token, user, dispatch]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {activeTab === 'chat' && (
          user ? <ChatLayout /> : <LoginScreen />
        )}

        {activeTab === 'landing' && (
          <LandingPage
            onEnterChat={() => setActiveTab('chat')}
            onViewDocs={() => setActiveTab('docs')}
            onViewWriteup={() => setActiveTab('writeup')}
          />
        )}

      </main>
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  );
}
