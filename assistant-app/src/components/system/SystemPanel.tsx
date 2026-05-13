import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Database, 
  Wifi, 
  Mic, 
  Activity, 
  Layers
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const SystemPanel: React.FC = () => {
  const { orbState, commandHistory } = useAppStore();
  const [stats, setStats] = useState({
    cpu: 12,
    ram: 45,
    latency: 24,
    temp: 42
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(20, Math.min(80, prev.ram + (Math.random() * 2 - 1))),
        latency: Math.max(10, Math.min(100, prev.latency + (Math.random() * 10 - 5))),
        temp: Math.max(30, Math.min(65, prev.temp + (Math.random() * 4 - 2)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ icon: Icon, label, value, colorClass, progress }: any) => (
    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
        </div>
        <span className={cn("text-xs font-mono font-bold", colorClass)}>{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full rounded-full", colorClass.replace('text-', 'bg-'))}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );

  return (
    <aside className="w-72 h-full py-4 pl-2 pr-4 z-20 hidden lg:flex flex-col">
      <div className="flex-1 glass-panel-strong rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl relative border-white/10">
        
        {/* Status Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Telemetry</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>

        {/* AI Model Info */}
        <div className="p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col gap-1">
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Current Model</span>
          <span className="text-sm font-bold text-white">GPT-4o Vision</span>
          <div className="flex items-center gap-2 mt-2">
            <Layers className="w-3 h-3 text-cyan-500/50" />
            <span className="text-[10px] text-slate-500">Multimodal Core Active</span>
          </div>
        </div>

        {/* System Grid */}
        <div className="grid grid-cols-1 gap-3">
          <MetricCard 
            icon={Cpu} 
            label="Processor" 
            value={`${stats.cpu.toFixed(0)}%`} 
            colorClass="text-cyan-400"
            progress={stats.cpu}
          />
          <MetricCard 
            icon={Database} 
            label="Memory" 
            value={`${stats.ram.toFixed(0)}%`} 
            colorClass="text-blue-400"
            progress={stats.ram}
          />
          <MetricCard 
            icon={Wifi} 
            label="AI Latency" 
            value={`${stats.latency.toFixed(0)}ms`} 
            colorClass="text-emerald-400"
          />
        </div>

        {/* Mic Status */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              orbState === 'listening' ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-500"
            )}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Microphone</span>
              <span className="text-[10px] text-slate-500 capitalize">{orbState === 'listening' ? 'Active' : 'Standby'}</span>
            </div>
          </div>
          {orbState === 'listening' && (
            <div className="flex gap-0.5 items-end h-3">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Task Log / Terminal */}
        <div className="glass-panel-strong p-4 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Execution Log</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Live</span>
          </div>
          
          <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 custom-scrollbar pr-2">
            {commandHistory.length === 0 ? (
              <div className="text-slate-600 italic">Awaiting neural commands...</div>
            ) : (
              commandHistory.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 p-2 rounded bg-white/5 border-l-2 border-cyan-500/30">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "uppercase font-bold",
                      log.status === 'success' ? "text-cyan-400" : "text-rose-400"
                    )}>
                      [{log.status}] {log.command}
                    </span>
                    <span className="text-slate-600">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-400 leading-tight">
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};
