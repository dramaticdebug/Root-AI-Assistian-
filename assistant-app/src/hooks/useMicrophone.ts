import { useRef, useCallback, useEffect } from 'react';
import { useVoiceStore } from '../store/useVoiceStore';
import { useAppStore } from '../store/useAppStore';
import { micService } from '../services/MicrophoneService';

const AUDIO_WS_URL = 'ws://localhost:8000/ws/audio';
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useMicrophone = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const isRecordingRef = useRef(false);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStatus, setAudioLevel, setStreamStatus, setPermission, setCurrentStream, status } =
    useVoiceStore();
  const { setOrbState } = useAppStore();

  // ─── Cleanup reconnect timer ────────────────────────────────────────────────
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ─── Send a chunk safely ────────────────────────────────────────────────────
  const sendChunk = useCallback((chunk: Int16Array) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      // ✅ slice(0) creates a fresh ArrayBuffer copy — prevents detached-buffer errors
      ws.send(chunk.buffer.slice(0));
    } catch (err) {
      console.error('[WS] Failed to send chunk:', err);
    }
  }, []);

  // ─── Connect WebSocket ──────────────────────────────────────────────────────
  const connectWS = useCallback(
    (onReady: () => void) => {
      if (
        socketRef.current?.readyState === WebSocket.OPEN ||
        socketRef.current?.readyState === WebSocket.CONNECTING
      ) {
        console.log('[WS] Already connected/connecting, skipping');
        return;
      }

      console.log(`[WS] Connecting to ${AUDIO_WS_URL}...`);
      const ws = new WebSocket(AUDIO_WS_URL);
      ws.binaryType = 'arraybuffer';
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Audio WebSocket connected ✅');
        setStreamStatus('connected');
        reconnectCountRef.current = 0;
        clearReconnectTimer();
        // ✅ Mic starts ONLY after WS is confirmed open — no race condition
        onReady();
      };

      ws.onmessage = (event) => {
        // Audio WS may receive JSON events (model_status etc.)
        if (typeof event.data === 'string') {
          try {
            const payload = JSON.parse(event.data);
            console.log('[WS] Received event:', payload?.event, payload?.data);
          } catch {
            // ignore
          }
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] WebSocket error:', err);
        // onclose will always fire after onerror — recovery handled there
      };

      ws.onclose = (evt) => {
        console.log(`[WS] Audio WebSocket closed (code: ${evt.code})`);
        setStreamStatus('disconnected');

        // ✅ If mic never started (connection failed before onReady ran),
        // reset to idle immediately — prevents the spinner from freezing forever
        if (!isRecordingRef.current) {
          console.warn('[WS] Connection closed before mic started — resetting to idle');
          setStatus('idle');
          setOrbState('idle');
          socketRef.current = null;
          return;
        }

        // Auto-reconnect only if mic is actively recording
        if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectCountRef.current++;
          console.log(
            `[WS] Reconnecting... attempt ${reconnectCountRef.current}/${MAX_RECONNECT_ATTEMPTS}`
          );
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connectWS(() => {
              console.log('[WS] Reconnected ✅ — mic stream continuing');
            });
          }, RECONNECT_DELAY_MS);
        } else {
          console.error('[WS] Max reconnect attempts reached. Stopping.');
          setStatus('error');
          setOrbState('idle');
        }
      };
    },
    [setStreamStatus, clearReconnectTimer, setStatus, setOrbState]
  );

  // ─── Start Listening ────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (isRecordingRef.current) {
      console.warn('[MIC] Already recording, ignoring startListening call');
      return;
    }

    try {
      setStatus('requesting_permission');
      console.log('[MIC] Requesting microphone permission...');

      // ✅ Connect WS first, then start mic in the onReady callback
      connectWS(async () => {
        try {
          const stream = await micService.start(
            sendChunk,
            (level) => setAudioLevel(level)
          );

          isRecordingRef.current = true;
          setCurrentStream(stream);
          setPermission('granted');
          setStatus('listening');
          setOrbState('listening');
          console.log('[MIC] Recording active 🎙️');
        } catch (micErr) {
          console.error('[MIC] Failed to start microphone after WS connected:', micErr);
          setPermission('denied');
          setStatus('error');
          socketRef.current?.close();
        }
      });

    } catch (err) {
      console.error('[MIC] startListening error:', err);
      setPermission('denied');
      setStatus('error');
    }
  }, [connectWS, sendChunk, setStatus, setAudioLevel, setPermission, setOrbState, setCurrentStream]);

  // ─── Stop Listening ─────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    console.log('[MIC] Stopping recording...');
    isRecordingRef.current = false;
    clearReconnectTimer();

    micService.stop();

    if (socketRef.current) {
      socketRef.current.close(1000, 'User stopped recording');
      socketRef.current = null;
    }

    setStatus('idle');
    setOrbState('idle');
    setAudioLevel(0);
    setCurrentStream(null);
    setStreamStatus('disconnected');
    console.log('[MIC] Recording stopped & cleaned 🛑');
  }, [clearReconnectTimer, setStatus, setOrbState, setAudioLevel, setCurrentStream, setStreamStatus]);

  // ─── Toggle ─────────────────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        stopListening();
      }
    };
  }, [stopListening]);

  return {
    startListening,
    stopListening,
    toggleRecording,
    analyser: micService.getAnalyser(),
  };
};
