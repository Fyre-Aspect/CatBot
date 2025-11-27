import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import useStore from './store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { getUserChats } from './services/firebaseService';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, setUser, setChats, theme } = useStore();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Initialize Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const chats = await getUserChats(currentUser.uid);
          setChats(chats);
        } catch (error) {
          console.error('Error loading chats:', error);
        }
      } else {
        setUser(null);
        setChats([]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setChats]);

  // Apply theme (always dark for ChatGPT style)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, [theme]);

  if (isAuthLoading) {
    return (
      <div 
        className="flex h-screen w-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-gpt-dark)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-gpt-gray-light)' }} />
          <p style={{ color: 'var(--color-gpt-gray)' }}>Initializing CatBot...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden text-white"
      style={{ backgroundColor: 'var(--color-gpt-dark)' }}
    >
      <Sidebar />
      <ChatInterface />
    </div>
  );
}

export default App;
