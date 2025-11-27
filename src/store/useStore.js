import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      
      currentChatId: null,
      setCurrentChatId: (id) => set({ currentChatId: id }),
      
      chats: [],
      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChatInList: (updatedChat) => set((state) => ({
        chats: state.chats.map(c => c.id === updatedChat.id ? { ...c, ...updatedChat } : c)
      })),
      deleteChatFromList: (chatId) => set((state) => ({
        chats: state.chats.filter(c => c.id !== chatId)
      })),
      
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      
      systemPrompt: "You are a helpful assistant that summarizes documents and images clearly and concisely. Adapt your responses to be personalized and easy to understand.",
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'catbot-storage',
      partialize: (state) => ({ systemPrompt: state.systemPrompt, theme: state.theme }), // Only persist these
    }
  )
);

export default useStore;
