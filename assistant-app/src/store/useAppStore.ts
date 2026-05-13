import { create } from 'zustand';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'offline';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

export type CommandLog = {
  id: string;
  command: string;
  status: 'success' | 'error';
  message: string;
  timestamp: number;
};

interface AppState {
  orbState: OrbState;
  isConnected: boolean;
  activeTab: string;
  messages: Message[];
  commandHistory: CommandLog[];
  liveTranscription: string;
  isTyping: boolean;
  
  setOrbState: (state: OrbState) => void;
  setConnected: (connected: boolean) => void;
  setActiveTab: (tab: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addCommandLog: (log: Omit<CommandLog, 'id' | 'timestamp'>) => void;
  setLiveTranscription: (text: string) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  orbState: 'offline',
  isConnected: false,
  activeTab: 'chat',
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Neural link initializing...',
      timestamp: Date.now(),
    }
  ],
  commandHistory: [],
  liveTranscription: '',
  isTyping: false,

  setOrbState: (state) => set({ orbState: state }),
  setConnected: (connected) => set({ 
    isConnected: connected,
    orbState: connected ? 'idle' : 'offline'
  }),
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
  addCommandLog: (log) => set((state) => ({
    commandHistory: [
      {
        ...log,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
      ...state.commandHistory
    ].slice(0, 50) // Keep last 50
  })),
  setLiveTranscription: (text) => set({ liveTranscription: text }),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [] }),
}));
