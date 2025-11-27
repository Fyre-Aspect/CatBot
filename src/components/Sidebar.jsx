import React from 'react';
import useStore from '../store/useStore';
import SystemPromptEditor from './SystemPromptEditor';
import { Plus, MessageSquare, Trash2, Settings, Moon, Sun, X, Search } from 'lucide-react';
import { createNewChat, deleteChat } from '../services/firebaseService';

const Sidebar = ({ isOpen, onClose, className = "" }) => {
  const { 
    chats, 
    currentChatId, 
    setCurrentChatId, 
    addChat, 
    deleteChatFromList,
    theme, 
    setTheme, // Changed from toggleTheme to setTheme to match store
    user
  } = useStore();

  const handleNewChat = async () => {
    if (!user) return; // Or handle local only
    try {
      // For now, just local state update or firebase call
      // If using firebase, we'd await createNewChat
      // const newId = await createNewChat(user.uid);
      // For this demo, let's assume we just switch to a "new" state or create a placeholder
      // But to be robust, let's actually create it if we have a user, or just clear currentChatId
      setCurrentChatId(null);
      if (window.innerWidth < 768) onClose();
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId);
        deleteChatFromList(chatId);
        if (currentChatId === chatId) setCurrentChatId(null);
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'} ${className}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center gap-2 font-bold text-xl" style={{ color: 'var(--primary-color)' }}>
          <span>CatBot</span>
        </div>
        <button onClick={onClose} className="md-hidden btn-ghost btn-icon">
          <X size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={handleNewChat}
          className="btn btn-primary w-full gap-2"
          style={{ padding: '0.75rem 1rem' }}
        >
          <Plus size={20} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat History List */}
      <div className="sidebar-content">
        <div className="text-xs font-semibold px-3 mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-fg)' }}>
          Recent Chats
        </div>
        
        {chats.length === 0 ? (
          <div className="text-center text-sm py-8" style={{ color: 'var(--muted-fg)' }}>
            No chats yet. Start a new one!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                if (window.innerWidth < 768) onClose();
              }}
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate text-sm font-medium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title || 'New Conversation'}</span>
              </div>
              
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className="btn-ghost btn-icon"
                style={{ padding: '0.25rem' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Settings & Profile */}
      <div className="sidebar-footer">
        <SystemPromptEditor />
        
        <div className="flex items-center justify-between" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: 'linear-gradient(to bottom right, var(--primary-color), #a855f7)' }}>
              {user ? user.email[0].toUpperCase() : 'G'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[120px]" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user ? user.email : 'Guest User'}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>Free Plan</span>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="btn-ghost btn-icon"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
