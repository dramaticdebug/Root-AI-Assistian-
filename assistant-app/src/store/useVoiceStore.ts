import { create } from 'zustand';

export type MicStatus = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'muted' | 'error';

interface VoiceState {
  status: MicStatus;
  isMuted: boolean;
  audioLevel: number;
  permission: 'granted' | 'denied' | 'prompt';
  streamStatus: 'connected' | 'disconnected' | 'connecting';
  currentStream: MediaStream | null;
  isModelLoading: boolean;
  
  setStatus: (status: MicStatus) => void;
  setMuted: (isMuted: boolean) => void;
  setAudioLevel: (level: number) => void;
  setPermission: (permission: 'granted' | 'denied' | 'prompt') => void;
  setStreamStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setCurrentStream: (stream: MediaStream | null) => void;
  setModelLoading: (loading: boolean) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  status: 'idle',
  isMuted: false,
  audioLevel: 0,
  permission: 'prompt',
  streamStatus: 'disconnected',
  currentStream: null,
  isModelLoading: false,

  setStatus: (status) => set({ status }),
  setMuted: (isMuted) => set({ isMuted }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  setPermission: (permission) => set({ permission }),
  setStreamStatus: (status) => set({ streamStatus: status }),
  setCurrentStream: (stream) => set({ currentStream: stream }),
  setModelLoading: (loading) => set({ isModelLoading: loading }),
}));
