import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { SystemPanel } from '../system/SystemPanel';
import { Background } from './Background';
import { AICore } from '../core/AICore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-slate-100 selection:bg-cyan-500/30">
      {/* Cinematic Background Layer */}
      <Background />

      {/* Central AI Core Layer (Behind panels but above background) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <div className="opacity-40 scale-150 blur-sm md:opacity-80 md:scale-100 md:blur-0">
          <AICore />
        </div>
      </div>

      {/* Main UI Layer */}
      <div className="relative z-10 flex h-full w-full p-4 gap-4">
        {/* Floating Sidebar - Left */}
        <Sidebar />

        {/* Main Content Area - Center */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-500">
          <div className="flex-1 glass-panel rounded-[2rem] overflow-hidden flex flex-col border-white/10 shadow-2xl">
            {children}
          </div>
        </main>

        {/* Floating System Panel - Right */}
        <SystemPanel />
      </div>
    </div>
  );
};
