
import { MainLayout } from './components/layout/MainLayout';
import { ChatArea } from './components/chat/ChatArea';
import { BottomInput } from './components/chat/BottomInput';
import { useAppStore } from './store/useAppStore';

function App() {
  const { activeTab } = useAppStore();

  return (
    <MainLayout>
      {activeTab === 'chat' ? (
        <>
          <ChatArea />
          <BottomInput />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p className="text-xl font-light tracking-wider capitalize">{activeTab} View</p>
        </div>
      )}
    </MainLayout>
  );
}

export default App;
