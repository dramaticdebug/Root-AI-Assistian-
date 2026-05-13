import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useVoiceStore } from '../store/useVoiceStore';

const WS_URL = 'ws://localhost:8000/ws';

// Singleton socket outside the hook
let sharedSocket: WebSocket | null = null;
let reconnectDelay = 1000;
let reconnectTimeout: any = null;
let heartbeatInterval: any = null;

export const useWebSocket = () => {
  const { 
    setConnected, 
    setOrbState, 
    addMessage, 
    setTyping,
    addCommandLog,
    setLiveTranscription
  } = useAppStore();

  const connect = useCallback(() => {
    if (sharedSocket?.readyState === WebSocket.OPEN || sharedSocket?.readyState === WebSocket.CONNECTING) return;

    console.log('🔌 Connecting to Neural Link...');
    sharedSocket = new WebSocket(WS_URL);

    sharedSocket.onopen = () => {
      console.log('✅ Neural Link Established');
      setConnected(true);
      reconnectDelay = 1000; // Reset backoff
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      // Start Heartbeat
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (sharedSocket?.readyState === WebSocket.OPEN) {
          sharedSocket.send(JSON.stringify({ event: 'ping', data: {} }));
        }
      }, 30000);
    };

    sharedSocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: eventType, data } = payload;

        switch (eventType) {
          case 'pong':
            // Heartbeat ACK
            break;
            
          case 'ai_message':
            addMessage({ role: 'assistant', content: data.message });
            setTyping(false);
            break;
            
          case 'assistant_state':
            setOrbState(data.state);
            if (data.state === 'thinking') setTyping(true);
            else if (data.state === 'idle') setTyping(false);
            break;

          case 'transcription': {
            // data.text = raw, data.clean_text = cleaned, data.status = 'success'
            const transcriptionText = data?.clean_text || data?.text || '';
            if (transcriptionText) {
              console.log(
                `[WS] Transcription received: "${transcriptionText}" (latency: ${data?.latency_ms ?? '?'}ms)`
              );
              setLiveTranscription(transcriptionText);
            } else {
              console.debug('[WS] Empty transcription event, ignoring');
            }
            break;
          }

          case 'command_executed':
            addCommandLog({
              command: data.command,
              status: data.status,
              message: data.message
            });
            break;
            
          case 'performance_metrics':
            // Could update a debug overlay with this
            // console.debug('🚀 Performance:', data);
            break;

          case 'model_status':
            // This is coming from useVoiceStore, so we need to access it
            break;
        }
      } catch (err) {
        console.error('❌ WebSocket Message Error:', err);
      }
    };

    sharedSocket.onclose = () => {
      console.log('❌ Neural Link Severed');
      setConnected(false);
      setOrbState('offline');
      clearInterval(heartbeatInterval);
      
      // Exponential Backoff Reconnect
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connect();
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }, reconnectDelay);
      }
    };

    sharedSocket.onerror = (error) => {
      console.error('🚨 Neural Link Error:', error);
      sharedSocket?.close();
    };
  }, [setConnected, setOrbState, addMessage, setTyping, setLiveTranscription, addCommandLog]);

  const send = useCallback((event: string, data: any = {}) => {
    if (sharedSocket?.readyState === WebSocket.OPEN) {
      sharedSocket.send(JSON.stringify({ event, data }));
    } else {
      console.error('❌ Neural Link Offline');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      // We don't close the shared socket on unmount because other hooks might be using it
    };
  }, [connect]);

  return { send, isConnected: !!(sharedSocket?.readyState === WebSocket.OPEN) };
};
