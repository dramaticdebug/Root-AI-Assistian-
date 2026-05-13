import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import json
import asyncio
import time

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.api.endpoints import router as api_router
from app.websocket.manager import manager

# ─── Audio Stream Config ─────────────────────────────────────────────────────
# Time-based transcription trigger (replaces broken chunk_count % 150)
TRIGGER_INTERVAL_S = 2.0      # Trigger Whisper every 2 seconds
SESSION_TIMEOUT_S  = 30.0     # Flush & reset if no audio for 30s
MIN_CHUNK_BYTES    = 8        # Skip empty / sub-noise chunks


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        version="0.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    # ── Health Check ────────────────────────────────────────────────────────
    @app.get("/")
    async def root():
        return {"app": settings.APP_NAME, "status": "running"}

    # ── Main Chat WebSocket ─────────────────────────────────────────────────
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    payload    = json.loads(data)
                    event_type = payload.get("event")
                    event_data = payload.get("data", {})

                    logger.debug(f"[WS] Received Event [{event_type}]")

                    if event_type == "ping":
                        await manager.send_event(
                            "pong", {"timestamp": settings.APP_ENV}, websocket
                        )

                    elif event_type == "user_message":
                        message = event_data.get("message", "").lower()

                        from app.commands.registry.processor import processor
                        from app.commands.registry.registry import registry

                        match = processor.process(message)

                        if match:
                            cmd_name, params = match
                            await manager.send_event(
                                "assistant_state", {"state": "thinking"}, websocket
                            )
                            result = await registry.execute(cmd_name, params)
                            await manager.send_event("command_executed", {
                                "command": cmd_name,
                                "status":  result.status,
                                "message": result.message,
                                "data":    result.data,
                            }, websocket)
                            await manager.send_event(
                                "ai_message", {"message": result.message}, websocket
                            )
                            await manager.send_event(
                                "assistant_state", {"state": "idle"}, websocket
                            )

                        elif "hello" in message or "merhaba" in message:
                            await manager.send_event(
                                "assistant_state", {"state": "thinking"}, websocket
                            )
                            await asyncio.sleep(1)
                            await manager.send_event(
                                "ai_message",
                                {"message": "AI systems online. How can I assist you today?"},
                                websocket,
                            )
                            await manager.send_event(
                                "assistant_state", {"state": "idle"}, websocket
                            )
                        else:
                            await manager.send_event(
                                "ai_message", {"message": f"Processed: {message}"}, websocket
                            )

                    elif event_type == "voice_started":
                        await manager.send_event(
                            "assistant_state", {"state": "listening"}, websocket
                        )

                    elif event_type == "voice_stopped":
                        await manager.send_event(
                            "assistant_state", {"state": "thinking"}, websocket
                        )

                except json.JSONDecodeError:
                    logger.error("[WS] Received invalid JSON on WebSocket")
                except Exception as e:
                    logger.error(f"[WS] Error processing event: {e}")

        except WebSocketDisconnect:
            manager.disconnect(websocket)
        except Exception as e:
            logger.error(f"[WS] Fatal WebSocket error: {e}")
            manager.disconnect(websocket)

    # ── Audio Stream WebSocket ──────────────────────────────────────────────
    @app.websocket("/ws/audio")
    async def websocket_audio_endpoint(websocket: WebSocket):
        await websocket.accept()
        session_id = str(id(websocket))
        logger.info(f"[AUDIO] Session connected: {session_id}")

        from app.voice.transcriber import VoiceTranscriber
        from app.voice.worker import transcription_worker
        from app.voice.whisper_service import whisper_service

        # ── Notify frontend: model status ───────────────────────────────────
        if whisper_service._model is None:
            try:
                await websocket.send_text(json.dumps({
                    "event": "model_status",
                    "data": {"status": "loading", "message": "Whisper warming up..."}
                }))
            except Exception:
                pass

        await transcription_worker.start()

        if whisper_service._model is not None:
            try:
                await websocket.send_text(json.dumps({
                    "event": "model_status",
                    "data": {"status": "ready"}
                }))
            except Exception:
                pass

        # Register session (no specific main WS linked by default — broadcasts to all)
        manager.register_audio_session(session_id, None)

        # ── Transcription callback ──────────────────────────────────────────
        async def send_transcription(raw: str, clean: str, inference_time: float, is_final: bool):
            try:
                latency = int(inference_time)
                logger.info(
                    f"[AUDIO] Transcription result | session={session_id} | "
                    f"text='{clean}' | latency={latency}ms | final={is_final}"
                )
                event_data = {
                    "event":      "transcription",
                    "text":       raw,
                    "clean_text": clean,
                    "is_final":   is_final,
                    "latency_ms": latency,
                    "status":     "success",
                    "timestamp":  int(time.time()),
                    "language":   "tr",
                }
                # Send via main WS (or broadcast if none registered)
                await manager.send_to_session(session_id, "transcription", event_data)
            except Exception as e:
                logger.error(f"[AUDIO] Failed to send transcription: {e}")

        transcriber = VoiceTranscriber(session_id, send_transcription)

        # ── Time-based trigger state ────────────────────────────────────────
        last_trigger_time  = time.time()
        last_activity_time = time.time()
        chunk_count        = 0
        total_bytes        = 0

        try:
            while True:
                try:
                    data = await asyncio.wait_for(
                        websocket.receive_bytes(),
                        timeout=SESSION_TIMEOUT_S
                    )
                except asyncio.TimeoutError:
                    # No audio for SESSION_TIMEOUT_S seconds → flush & continue
                    idle_s = time.time() - last_activity_time
                    logger.warning(
                        f"[AUDIO] Session {session_id}: {idle_s:.1f}s silence timeout → flushing buffer"
                    )
                    await transcriber.trigger_transcription(language="tr", is_final=False)
                    last_trigger_time = time.time()
                    continue

                chunk_len = len(data)

                # ── Skip empty / sub-noise chunks ───────────────────────────
                if chunk_len < MIN_CHUNK_BYTES:
                    logger.debug(
                        f"[AUDIO] Session {session_id}: skipping tiny chunk ({chunk_len} bytes)"
                    )
                    continue

                await transcriber.process_chunk(data)
                chunk_count        += 1
                total_bytes        += chunk_len
                last_activity_time  = time.time()

                # Periodic chunk log
                if chunk_count % 50 == 0:
                    logger.debug(
                        f"[AUDIO] Session {session_id} | chunk #{chunk_count} "
                        f"| pkt={chunk_len}B | total={total_bytes/1024:.1f}KB"
                    )

                # ── Time-based trigger (every TRIGGER_INTERVAL_S) ───────────
                now = time.time()
                if now - last_trigger_time >= TRIGGER_INTERVAL_S:
                    logger.info(
                        f"[AUDIO] Session {session_id}: time trigger at chunk #{chunk_count} "
                        f"(buffer={transcriber.buffer.size_kb():.1f}KB)"
                    )
                    await transcriber.trigger_transcription(language="tr")
                    last_trigger_time = now

        except WebSocketDisconnect:
            logger.info(f"[AUDIO] Session {session_id} disconnected after {chunk_count} chunks")
            await transcriber.trigger_transcription(language="tr", is_final=True)

        except Exception as e:
            logger.error(f"[AUDIO] Session {session_id} fatal error: {e}", exc_info=True)

        finally:
            manager.unregister_audio_session(session_id)
            logger.info(f"[AUDIO] Session {session_id} cleaned up")

    return app


app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting {settings.APP_NAME} on port {settings.PORT}...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
