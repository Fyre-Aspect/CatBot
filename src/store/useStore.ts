import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message } from '../types';
import type { User } from 'firebase/auth';

interface StoreState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Chats
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChatInList: (chatId: string, updates: Partial<Chat>) => void;
  deleteChatFromList: (chatId: string) => void;

  // Current Chat
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // System Prompt
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;

  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

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
