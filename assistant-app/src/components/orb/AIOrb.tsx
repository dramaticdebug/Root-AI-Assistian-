import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const stateVariants = {
  idle: {
    scale: [1, 1.05, 1],
    rotate: [0, 360],
    boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)',
    transition: {
      scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 20, ease: "linear" }
    }
  },
  listening: {
    scale: [1, 1.15, 1],
    rotate: [0, -360],
    boxShadow: ['0 0 40px rgba(6, 182, 212, 0.5)', '0 0 80px rgba(6, 182, 212, 0.8)', '0 0 40px rgba(6, 182, 212, 0.5)'],
    transition: {
      scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 10, ease: "linear" },
      boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    }
  },
  thinking: {
    scale: [1, 0.95, 1.05, 1],
    rotate: [0, 360],
    boxShadow: '0 0 60px rgba(168, 85, 247, 0.6)',
    transition: {
      scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 5, ease: "linear" }
    }
  },
  speaking: {
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
    boxShadow: ['0 0 40px rgba(59, 130, 246, 0.5)', '0 0 100px rgba(59, 130, 246, 0.9)', '0 0 40px rgba(59, 130, 246, 0.5)'],
    transition: {
      scale: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 15, ease: "linear" },
      boxShadow: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
    }
  }
};

const innerVariants = {
  idle: { opacity: 0.5, scale: 0.8 },
  listening: { opacity: 0.8, scale: 0.9 },
  thinking: { opacity: 0.9, scale: 0.5 },
  speaking: { opacity: 1, scale: 1.1 }
};

export const AIOrb: React.FC = () => {
  const { orbState } = useAppStore();

  const getGradient = () => {
    switch(orbState) {
      case 'thinking': return 'from-purple-500 to-fuchsia-500';
      case 'speaking': return 'from-blue-400 to-cyan-300';
      case 'listening': return 'from-cyan-400 to-teal-400';
      default: return 'from-cyan-600 to-blue-600';
    }
  };

  return (
    <div className="w-full h-64 flex items-center justify-center relative">
      {/* Background glow behind orb */}
      <motion.div 
        animate={orbState}
        variants={{
          idle: { opacity: 0.2, scale: 1 },
          listening: { opacity: 0.4, scale: 1.2 },
          thinking: { opacity: 0.3, scale: 1.5 },
          speaking: { opacity: 0.5, scale: 1.3 },
        }}
        className={`absolute w-64 h-64 rounded-full blur-3xl bg-gradient-to-tr ${getGradient()} opacity-20`}
      />

      <motion.div
        animate={orbState}
        variants={stateVariants as any}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-tr ${getGradient()} backdrop-blur-xl border border-white/20`}
      >
        <motion.div 
          animate={orbState}
          variants={innerVariants}
          className="w-full h-full rounded-full bg-white blur-md mix-blend-overlay absolute inset-0"
        />
        
        {/* Core center dot */}
        <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] z-10" />
      </motion.div>
    </div>
  );
};
