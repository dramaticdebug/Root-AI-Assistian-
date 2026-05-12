import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Wifi, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const SystemPanel: React.FC = () => {
  const { orbState } = useAppStore();
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(45);

  // Mock system stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(5, Math.min(95, prev + (Math.random() * 20 - 10))));
      setRamUsage(prev => Math.max(20, Math.min(80, prev + (Math.random() * 5 - 2.5))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 h-full py-6 pr-4 pl-2 flex flex-col z-20">
      <div className="flex-1 glass-panel rounded-3xl p-5 flex flex-col gap-6 shadow-lg relative overflow-hidden">
        
        {/* Status Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold text-slate-200">System Status</h2>
        </div>

        {/* AI State Tracker */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Core State</span>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              orbState === 'idle' && "bg-slate-400",
              orbState === 'listening' && "bg-cyan-400 shadow-[0_0_10px_#22d3ee]",
              orbState === 'thinking' && "bg-purple-500 shadow-[0_0_10px_#a855f7]",
              orbState === 'speaking' && "bg-blue-400 shadow-[0_0_10px_#60a5fa]"
            )} />
            <span className="text-sm font-medium capitalize text-slate-300">{orbState}</span>
          </div>
        </div>

        {/* System Metrics */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Resources</span>
          
          {/* CPU Widget */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4" />
                <span>CPU</span>
              </div>
              <span className="text-cyan-400 font-mono">{cpuUsage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
          </div>

          {/* RAM Widget */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-4 h-4" />
                <span>Memory</span>
              </div>
              <span className="text-blue-400 font-mono">{ramUsage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${ramUsage}%` }}
              />
            </div>
          </div>

          {/* Network Widget */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Wifi className="w-4 h-4" />
                <span>Network</span>
              </div>
              <span className="text-emerald-400 font-mono">12ms</span>
            </div>
          </div>
        </div>

        {/* Mock Tasks */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 block">Active Tasks</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 p-2 rounded-lg">
              <span>Voice Recognition</span>
              <span className="text-cyan-400">Ready</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 p-2 rounded-lg">
              <span>Local LLM Engine</span>
              <span className="text-slate-500">Standby</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};
