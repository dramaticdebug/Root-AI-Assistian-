import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-bg-deep">
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise z-10 opacity-30 mix-blend-overlay"></div>
      
      {/* Dynamic Cinematic Gradient that moves with mouse */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-50"
        animate={{
          background: `
            radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, rgba(6, 182, 212, 0.15) 0%, transparent 40%),
            radial-gradient(circle at ${80 - mousePosition.x * 20}% ${20 - mousePosition.y * 20}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at ${20 - mousePosition.x * 15}% ${80 - mousePosition.y * 15}%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)
          `
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.2 }}
      />

      {/* Floating Particles/Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[100px]"
          style={{
            background: i % 2 === 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            width: Math.random() * 400 + 200 + 'px',
            height: Math.random() * 400 + 200 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, Math.random() * 0.5 + 1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
