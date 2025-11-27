import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import useStore from './store/useStore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './config/firebase';
import { getUserChats } from './services/firebaseService';
import { Loader2 } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { setUser, setChats, theme } = useStore();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Initialize Auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const chats = await getUserChats(user.uid);
          setChats(chats);
        } catch (error) {
          console.error("Error loading chats:", error);
        }
      } else {
        // Auto sign-in anonymously for demo purposes
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in:", error);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setChats]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (isAuthLoading) {
    return (
      <div className="app-container justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--muted-fg)' }}>Initializing CatBot...</p>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="chat-interface">
        <ChatInterface 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </main>
    </div>
  );
}

export default App;
