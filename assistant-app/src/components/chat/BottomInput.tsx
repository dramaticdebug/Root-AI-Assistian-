import React, { useState } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useMicrophone } from '../../hooks/useMicrophone';
import { VoiceVisualizer } from '../voice/VoiceVisualizer';
import { MicControl } from '../voice/MicControl';

export const BottomInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { addMessage, isConnected, liveTranscription } = useAppStore();
  const { status: micStatus } = useVoiceStore();
  const { send } = useWebSocket();
  const { analyser } = useMicrophone();

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    addMessage({ role: 'user', content: input });
    send("user_message", { message: input });
    setInput('');
  };

  return (
    <div className="p-6 pt-0 relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Voice Visualizer Area */}
      <div className="h-16 flex flex-col items-center justify-center gap-2">
        <AnimatePresence>
          {micStatus === 'listening' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium text-cyan-400/80 italic animate-pulse"
              >
                {liveTranscription || "Listening..."}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full"
              >
                <VoiceVisualizer analyser={analyser} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-end gap-4">
        {/* Main Microphone Control */}
        <MicControl />

        {/* Text Input Console */}
        <div className={cn(
          "flex-1 relative glass-panel rounded-[2rem] p-2 flex items-center gap-2 transition-all duration-500",
          "border-white/10 hover:border-cyan-500/20",
          micStatus === 'listening' && "opacity-50 pointer-events-none"
        )}>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <Paperclip className="w-5 h-5" />
          </button>

          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={micStatus === 'listening' ? "Neural link active. Speak now..." : "Neural command input..."}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 px-4 py-2 font-medium"
          />

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || !isConnected || micStatus === 'listening'}
            className={cn(
              "h-10 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full transition-all flex items-center justify-center gap-2",
              "disabled:opacity-10 disabled:grayscale shadow-lg shadow-cyan-500/20 font-black text-[10px] uppercase tracking-[0.2em]"
            )}
          >
            <span>Transmit</span>
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/5 blur-[80px] -z-10" />
    </div>
  );
};
