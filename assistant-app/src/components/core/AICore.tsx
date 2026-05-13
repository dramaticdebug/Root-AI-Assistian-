import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const stateConfig = {
  idle: {
    color: 'rgba(6, 182, 212, 0.5)',
    glowColor: 'rgba(6, 182, 212, 0.3)',
    scale: 1,
    pulseSpeed: 4,
    rotationSpeed: 20,
    ringOpacity: 0.2
  },
  listening: {
    color: 'rgba(6, 182, 212, 0.8)',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    scale: 1.1,
    pulseSpeed: 1.5,
    rotationSpeed: 8,
    ringOpacity: 0.5
  },
  thinking: {
    color: 'rgba(168, 85, 247, 0.7)',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    scale: 0.95,
    pulseSpeed: 0.8,
    rotationSpeed: 4,
    ringOpacity: 0.4
  },
  speaking: {
    color: 'rgba(59, 130, 246, 0.8)',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    scale: 1.05,
    pulseSpeed: 0.5,
    rotationSpeed: 15,
    ringOpacity: 0.6
  },
  offline: {
    color: 'rgba(71, 85, 105, 0.3)',
    glowColor: 'rgba(71, 85, 105, 0.1)',
    scale: 0.9,
    pulseSpeed: 8,
    rotationSpeed: 60,
    ringOpacity: 0.1
  }
};

export const AICore: React.FC = () => {
  const { orbState } = useAppStore();
  const config = stateConfig[orbState] || stateConfig.offline;

  return (
    <div className="relative w-96 h-96 flex items-center justify-center pointer-events-none">
      {/* Outer Halo */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: config.pulseSpeed * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-full h-full rounded-full blur-[100px]"
        style={{ backgroundColor: config.glowColor }}
      />

      {/* Rotating Outer Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: config.rotationSpeed, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 rounded-full border border-dashed border-white/10"
        style={{ opacity: config.ringOpacity }}
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: config.rotationSpeed * 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full border border-white/5"
        style={{ opacity: config.ringOpacity * 0.5 }}
      />

      {/* Main Energy Core Container */}
      <motion.div
        animate={{
          scale: config.scale,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative w-48 h-48 flex items-center justify-center"
      >
        {/* Breathing Base */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: config.pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: config.color }}
        />

        {/* Inner Glass Orb */}
        <div className="relative w-32 h-32 rounded-full glass-panel-strong border-white/20 flex items-center justify-center overflow-hidden">
          {/* Energy Swirls */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent blur-sm"
          />

          {/* Liquid Core Effect */}
          <motion.div
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: config.pulseSpeed * 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full blur-xl"
            style={{ backgroundColor: config.color }}
          />

          {/* Reflection */}
          <div className="absolute top-2 left-6 w-20 h-10 bg-white/10 rounded-[100%] blur-sm rotate-[-15deg]" />
          
          {/* Center Singularity */}
          <motion.div 
            animate={{
              scale: orbState === 'listening' ? [1, 1.5, 1] : 1,
              boxShadow: orbState === 'thinking' ? "0 0 30px #fff" : "0 0 15px rgba(255,255,255,0.5)"
            }}
            transition={{ duration: 0.5, repeat: orbState === 'listening' ? Infinity : 0 }}
            className="w-2 h-2 bg-white rounded-full z-10 shadow-[0_0_20px_white]" 
          />
        </div>

        {/* Dynamic Waveforms (when listening or speaking) */}
        <AnimatePresence>
          {(orbState === 'listening' || orbState === 'speaking') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-[-40px] flex items-center justify-center pointer-events-none"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 border border-white/20 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
