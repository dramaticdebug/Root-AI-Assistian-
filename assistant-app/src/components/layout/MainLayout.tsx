import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { SystemPanel } from '../system/SystemPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Sidebar - Left Panel */}
      <Sidebar />

      {/* Main Content - Center Panel */}
      <main className="flex-1 flex flex-col relative z-10 px-4 py-6">
        <div className="w-full h-full flex flex-col relative rounded-3xl glass-panel p-6 shadow-2xl shadow-cyan-500/10 border border-white/5">
          {children}
        </div>
      </main>

      {/* System Info - Right Panel */}
      <SystemPanel />
    </div>
  );
};
