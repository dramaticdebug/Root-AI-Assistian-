import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const ChatArea: React.FC = () => {
  const { messages, isTyping } = useAppStore();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto overflow-hidden relative">
      
      {/* Cinematic Header Overlay (Optional) */}
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="flex flex-col gap-8 pb-10">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 30, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "flex flex-col w-full max-w-[80%]",
                    isUser ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-6 py-4 rounded-[2rem] relative group backdrop-blur-2xl transition-all duration-300",
                    isUser 
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-white rounded-br-lg shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:border-cyan-400/50" 
                      : "bg-white/5 border border-white/10 text-slate-100 rounded-bl-lg hover:border-white/20"
                  )}>
                    {/* Role Label */}
                    <div className={cn(
                      "text-[9px] uppercase tracking-widest font-black mb-1 opacity-50",
                      isUser ? "text-cyan-400" : "text-white"
                    )}>
                      {isUser ? "Authorized User" : "Core Intelligence"}
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base font-medium">
                      {msg.content}
                    </p>
                    
                    {/* Reflection effect for messages */}
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Timestamp */}
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className={cn(
                      "text-[9px] font-mono tracking-tighter mt-1.5",
                      isUser ? "mr-2 text-cyan-400" : "ml-2 text-slate-400"
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </motion.span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Streaming/Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="mr-auto items-start max-w-[80%]"
            >
              <div className="px-6 py-5 rounded-[2rem] rounded-bl-lg bg-white/5 border border-white/10 backdrop-blur-md flex gap-2 items-center">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest ml-2">Processing</span>
              </div>
            </motion.div>
          )}
          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />
    </div>
  );
};
