import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { useVoiceStore } from '../../store/useVoiceStore';
import { useMicrophone } from '../../hooks/useMicrophone';
import { cn } from '../../lib/utils';

export const MicControl: React.FC = () => {
  const { status, audioLevel } = useVoiceStore();
  const { toggleRecording } = useMicrophone();

  // Dynamic scale based on audio level when listening
  const activeScale = status === 'listening' ? 1 + audioLevel * 2 : 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Pulse Rings (Only when listening) */}
      <AnimatePresence>
        {status === 'listening' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: activeScale + 0.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-20 h-20 rounded-full border border-cyan-500/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: activeScale + 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              className="absolute w-20 h-20 rounded-full border border-cyan-500/10"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleRecording}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 z-10",
          status === 'idle' && "bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30",
          status === 'listening' && "bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)]",
          status === 'requesting_permission' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          status === 'processing' && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
          status === 'error' && "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
        )}
      >
        {/* Breathing Inner Glow */}
        {status === 'idle' && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-cyan-500/5 blur-md"
          />
        )}

        <AnimatePresence mode="wait">
          {status === 'requesting_permission' || status === 'processing' ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-6 h-6" />
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              key="error"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <AlertCircle className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {status === 'listening' ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Status Tooltip (Simple) */}
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
        >
          {status === 'requesting_permission' && "Connecting to backend..."}
          {status === 'listening' && "Neural stream active"}
          {status === 'processing' && "Analyzing patterns..."}
          {status === 'error' && "Backend offline — start the server"}
        </motion.div>
      )}
    </div>
  );
};
