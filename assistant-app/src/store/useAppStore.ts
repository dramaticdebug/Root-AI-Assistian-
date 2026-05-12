import { create } from 'zustand';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

interface AppState {
  orbState: OrbState;
  activeTab: string;
  messages: Message[];
  isTyping: boolean;
  
  setOrbState: (state: OrbState) => void;
  setActiveTab: (tab: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  orbState: 'idle',
  activeTab: 'chat',
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am online and ready.',
      timestamp: Date.now() - 10000,
    }
  ],
  isTyping: false,

  setOrbState: (state) => set({ orbState: state }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...msg,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      }
    ]
  })),
  setTyping: (isTyping) => set({ isTyping }),
}));
