import { User as FirebaseUser } from 'firebase/auth';

export interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isError?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string;
  url?: string;
  data?: string;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  messages?: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type User = FirebaseUser;

export interface StoreState {
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
