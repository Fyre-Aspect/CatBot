import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from 'lucide-react';
import { deleteChat, getUserChats } from '../services/firebaseService';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const Sidebar = () => {
  const {
    chats,
    setChats,
    currentChatId,
    setCurrentChatId,
    user,
    isSidebarOpen,
    setSidebarOpen,
    clearMessages,
  } = useStore();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        try {
          const userChats = await getUserChats(user.uid);
          setChats(userChats);
        } catch (error) {
          console.error('Error loading chats:', error);
        }
      }
    };
    loadChats();
  }, [user, setChats]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    clearMessages();
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      try {
        await deleteChat(chatId);
        setChats(chats.filter((c) => c.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          clearMessages();
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:relative z-50 h-full w-[260px] flex flex-col transition-transform duration-200 ease-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}
        style={{ backgroundColor: 'var(--color-gpt-dark-sidebar)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="btn-icon hover:text-white"
            style={{ color: 'var(--color-gpt-gray-light)' }}
            title="Toggle sidebar"
          >
            <PanelLeftClose size={20} />
          </button>

          <button
            onClick={handleNewChat}
            className="btn-icon hover:text-white"
            style={{ color: 'var(--color-gpt-gray-light)' }}
            title="New chat"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center text-sm py-8" style={{ color: 'var(--color-gpt-gray)' }}>
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`sidebar-item group ${currentChatId === chat.id ? 'active' : ''}`}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="flex-1 truncate">{chat.title || 'New chat'}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 space-y-1" style={{ borderTop: '1px solid var(--color-gpt-dark-border)' }}>
          {/* User */}
          <div className="sidebar-item">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-medium text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="flex-1 truncate text-sm">
              {user?.email || 'Guest'}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="sidebar-item w-full hover:text-white"
            style={{ color: 'var(--color-gpt-gray)' }}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Toggle button when sidebar is closed (desktop) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex fixed top-3 left-3 z-30 btn-icon hover:text-white rounded-lg"
          style={{ 
            color: 'var(--color-gpt-gray-light)', 
            backgroundColor: 'var(--color-gpt-dark-sidebar)' 
          }}
          title="Open sidebar"
        >
          <PanelLeft size={20} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
