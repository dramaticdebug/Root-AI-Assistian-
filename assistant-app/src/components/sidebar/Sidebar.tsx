import React from 'react';
import { MessageSquare, LayoutDashboard, Mic, CheckSquare, BrainCircuit, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'voice', icon: Mic, label: 'Voice' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'memory', icon: BrainCircuit, label: 'Memory' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-64 h-full py-6 pl-4 pr-2 flex flex-col z-20">
      <div className="flex-1 glass-panel rounded-3xl p-4 flex flex-col gap-2 shadow-lg relative overflow-hidden">
        {/* Logo/Brand Area */}
        <div className="px-4 py-6 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            A.I. CORE
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
                  isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
                <span className="font-medium relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="mt-auto pt-4 border-t border-white/5 px-4 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <span className="text-sm text-slate-400 font-medium">System Online</span>
        </div>
      </div>
    </aside>
  );
};
