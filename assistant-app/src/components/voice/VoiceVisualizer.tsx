import React, { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../store/useVoiceStore';

interface VoiceVisualizerProps {
  analyser: AnalyserNode | null;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status } = useVoiceStore();
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Create neon gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 1)');

        ctx.fillStyle = gradient;
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';

        // Draw mirrored bars for a central effect
        const centerY = canvas.height / 2;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser]);

  if (status !== 'listening') return null;

  return (
    <div className="w-full h-12 flex items-center justify-center mb-4">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={48} 
        className="opacity-80"
      />
    </div>
  );
};
