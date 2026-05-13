import React from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Mic, 
  Users, 
  Zap, 
  BrainCircuit, 
  Settings 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'voice', icon: Mic, label: 'Voice' },
  { id: 'agents', icon: Users, label: 'Agents' },
  { id: 'automation', icon: Zap, label: 'Automation' },
  { id: 'memory', icon: BrainCircuit, label: 'Memory' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-20 h-full flex flex-col items-center py-4 z-20">
      <div className="flex-1 w-full glass-panel-strong rounded-[2.5rem] flex flex-col items-center py-8 gap-6 shadow-2xl relative border-white/10 group">
        
        {/* Core Icon / Branding */}
        <div className="relative mb-4">
          <motion.div 
            animate={{ 
              rotate: 360,
              boxShadow: ["0 0 10px rgba(6,182,212,0.3)", "0 0 20px rgba(6,182,212,0.6)", "0 0 10px rgba(6,182,212,0.3)"]
            }}
            transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 3, repeat: Infinity } }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          </motion.div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-4 flex-1 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group/item">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden",
                    isActive ? "text-cyan-400" : "text-slate-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={cn(
                    "w-6 h-6 relative z-10 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-110",
                    "group-hover/item:scale-110"
                  )} />
                </button>

                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-medium text-white opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-white/10" />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
