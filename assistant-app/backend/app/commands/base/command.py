from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pydantic import BaseModel
from loguru import logger
import time

class CommandResult(BaseModel):
    status: str # "success" or "error"
    message: str
    data: Optional[Dict[str, Any]] = None
    execution_time: float = 0.0

class BaseCommand(ABC):
    name: str
    description: str
    category: str
    parameters_schema: Optional[Dict[str, Any]] = None

    def __init__(self):
        self.logger = logger.bind(command=self.name)

    @abstractmethod
    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        """Execute the command logic."""
        pass

    def validate(self, params: Dict[str, Any]) -> bool:
        """Validate parameters before execution."""
        # Standard validation logic can go here
        return True

    async def run(self, params: Dict[str, Any]) -> CommandResult:
        """Standard entry point for running a command with logging and timing."""
        start_time = time.time()
        self.logger.info(f"Executing command with params: {params}")

        try:
            if not self.validate(params):
                return CommandResult(status="error", message="Parameter validation failed")

            result = await self.execute(params)
            result.execution_time = time.time() - start_time
            
            if result.status == "success":
                self.logger.info(f"Command executed successfully in {result.execution_time:.4f}s")
            else:
                self.logger.error(f"Command failed: {result.message}")
            
            return result

        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.exception(f"Fatal error during command execution: {e}")
            return CommandResult(
                status="error",
                message=f"Internal execution error: {str(e)}",
                execution_time=execution_time
            )
