from loguru import logger
import time

class AudioBuffer:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.buffer = bytearray()
        self.last_update = time.time()
        self.max_buffer_size = 1024 * 1024 * 5 # 5MB limit (~2.5 minutes of 16kHz mono)

    def add_chunk(self, chunk: bytes):
        if len(self.buffer) < self.max_buffer_size:
            self.buffer.extend(chunk)
            self.last_update = time.time()
        else:
            logger.warning(f"Buffer full for session {self.session_id}")

    def get_data(self) -> bytes:
        return bytes(self.buffer)

    def clear(self):
        self.buffer = bytearray()
        self.last_update = time.time()

    def size_kb(self) -> float:
        return len(self.buffer) / 1024
