import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, User, Chat, Message } from '../types';

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user: User | null) => set({ user }),

      // Theme
      theme: 'dark',
      setTheme: (theme: 'dark' | 'light') => set({ theme }),

      // Chats
      chats: [],
      setChats: (chats: Chat[]) => set({ chats }),
      addChat: (chat: Chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChatInList: (chatId: string, updates: Partial<Chat>) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, ...updates } : c
          ),
        })),
      deleteChatFromList: (chatId: string) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
        })),

      // Current Chat
      currentChatId: null,
      setCurrentChatId: (id: string | null) => set({ currentChatId: id }),

      // Messages
      messages: [],
      setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) =>
        set((state) => ({
          messages:
            typeof messages === 'function' ? messages(state.messages) : messages,
        })),
      addMessage: (message: Message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),

      // System Prompt
      systemPrompt:
        'You are a helpful assistant that summarizes documents and images clearly and concisely. Adapt your responses to be personalized and easy to understand.',
      setSystemPrompt: (prompt: string) => set({ systemPrompt: prompt }),

      // Sidebar
      isSidebarOpen: true,
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
    }),
    {
      name: 'catbot-storage',
      partialize: (state) => ({
        systemPrompt: state.systemPrompt,
        theme: state.theme,
      }),
    }
  )
);

export default useStore;
