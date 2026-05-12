import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { AIOrb } from '../orb/AIOrb';

export const ChatArea: React.FC = () => {
  const { messages, isTyping } = useAppStore();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden relative">
      
      {/* Orb container at the top center */}
      <div className="flex-shrink-0 pt-4 pb-8 border-b border-white/5">
        <AIOrb />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col w-full max-w-[85%]",
                    isUser ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-3.5 rounded-2xl relative group backdrop-blur-md",
                    isUser 
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-50 rounded-br-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                      : "bg-slate-800/50 border border-white/10 text-slate-200 rounded-bl-sm"
                  )}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Tiny Timestamp */}
                    <span className={cn(
                      "text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5",
                      isUser ? "right-1 text-cyan-500/70" : "left-1 text-slate-500"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto items-start max-w-[85%]"
            >
              <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-slate-800/30 border border-white/5 backdrop-blur-md flex gap-1.5 items-center h-[52px]">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
                />
                <motion.div 
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
          <div ref={endOfMessagesRef} className="h-6" />
        </div>
      </div>
    </div>
  );
};
