import { MainLayout } from './components/layout/MainLayout';
import { ChatArea } from './components/chat/ChatArea';
import { BottomInput } from './components/chat/BottomInput';
import { useAppStore } from './store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeTab } = useAppStore();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        {activeTab === 'chat' ? (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ChatArea />
            <BottomInput />
          </motion.div>
        ) : (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 animate-pulse flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-white mb-2">{activeTab}</h2>
            <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">Module Initialization in Progress</p>
            
            <div className="mt-8 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-cyan-500/30" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
