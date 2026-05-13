from fastapi import WebSocket
from typing import List, Dict, Any, Optional
from loguru import logger
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # Maps audio session_id → main /ws WebSocket for cross-socket messaging
        self.audio_to_main: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"WebSocket Connected: {websocket.client.host if websocket.client else 'unknown'}. "
            f"Total: {len(self.active_connections)}"
        )
        await self.send_event(
            "system_status",
            {"status": "connected", "message": "Neural link established."},
            websocket,
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        # Clean up any audio→main mappings pointing to this socket
        stale = [sid for sid, ws in self.audio_to_main.items() if ws is websocket]
        for sid in stale:
            del self.audio_to_main[sid]
            logger.debug(f"Cleaned audio→main mapping for session {sid}")
        logger.info(f"WebSocket Disconnected. Total: {len(self.active_connections)}")

    def register_audio_session(self, session_id: str, main_ws: Optional[WebSocket]):
        """Link an audio session to a specific main /ws connection for targeted delivery."""
        if main_ws is not None:
            self.audio_to_main[session_id] = main_ws
            logger.debug(f"Registered audio session {session_id} → main WS")
        else:
            # If no specific main WS, we'll broadcast to all
            logger.debug(f"Audio session {session_id}: no main WS linked, will broadcast")

    def unregister_audio_session(self, session_id: str):
        self.audio_to_main.pop(session_id, None)
        logger.debug(f"Unregistered audio session {session_id}")

    async def send_event(self, event: str, data: Any, websocket: WebSocket):
        """Send a structured event to a specific client."""
        try:
            payload = {"event": event, "data": data}
            await websocket.send_text(json.dumps(payload))
            logger.debug(
                f"Sent Event [{event}] to {websocket.client.host if websocket.client else 'unknown'}"
            )
        except Exception as e:
            logger.error(f"Error sending event [{event}]: {e}")
            self.disconnect(websocket)

    async def broadcast_event(self, event: str, data: Any):
        """Broadcast a structured event to all active /ws connections."""
        if not self.active_connections:
            logger.debug(f"broadcast_event [{event}]: no active main WS connections")
            return
        payload = json.dumps({"event": event, "data": data})
        logger.debug(f"Broadcasting Event [{event}] to {len(self.active_connections)} client(s)")
        dead: List[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.error(f"Failed to broadcast [{event}] to a connection: {e}")
                dead.append(connection)
        for d in dead:
            self.disconnect(d)

    async def send_to_session(self, session_id: str, event: str, data: Any):
        """Send event to the main WS linked to an audio session, or broadcast if none linked."""
        target = self.audio_to_main.get(session_id)
        if target and target in self.active_connections:
            await self.send_event(event, data, target)
        else:
            # Fallback: broadcast to all main connections
            await self.broadcast_event(event, data)

    async def broadcast(self, event: str, data: Any):
        """Alias kept for backward compatibility."""
        await self.broadcast_event(event, data)


manager = ConnectionManager()
