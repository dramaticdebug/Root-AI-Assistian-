import React, { useState } from 'react';
import { Mic, Send, Paperclip } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { addMessage, setOrbState, setTyping, orbState } = useAppStore();

  const handleSend = () => {
    if (!input.trim()) return;

    // User sends message
    addMessage({ role: 'user', content: input });
    setInput('');
    
    // Simulate AI thinking and responding
    setOrbState('thinking');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setOrbState('speaking');
      addMessage({ 
        role: 'assistant', 
        content: 'I understand your request. Processing the data now through the local pipeline.' 
      });

      // Return to idle after speaking
      setTimeout(() => {
        setOrbState('idle');
      }, 3000);
    }, 2000);
  };

  const handleVoiceToggle = () => {
    if (orbState === 'listening') {
      setOrbState('thinking');
      setTimeout(() => {
        setOrbState('idle');
      }, 1000);
    } else {
      setOrbState('listening');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-4 shrink-0">
      <div className="relative group flex items-center bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-lg transition-all focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        
        {/* Attachment Button */}
        <button className="p-3 text-slate-400 hover:text-cyan-400 transition-colors rounded-xl hover:bg-white/5">
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything or type a command..."
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 px-2 font-medium"
        />

        {/* Actions */}
        <div className="flex items-center gap-1 pr-1">
          <button 
            onClick={handleVoiceToggle}
            className={`p-3 transition-colors rounded-xl hover:bg-white/5 ${orbState === 'listening' ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400 shadow-md shadow-cyan-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
