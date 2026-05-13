from typing import Dict, Type, List, Any, Optional
from loguru import logger
from ..base.command import BaseCommand, CommandResult
from ..system.system_info import SystemInfoCommand
from ..system.launcher import (
    OpenChromeCommand, 
    OpenSpotifyCommand, 
    OpenDiscordCommand, 
    OpenFolderCommand
)

class CommandRegistry:
    def __init__(self):
        self._commands: Dict[str, BaseCommand] = {}
        self._register_defaults()

    def register(self, command: BaseCommand):
        self._commands[command.name] = command
        logger.info(f"Registered command: {command.name}")

    def _register_defaults(self):
        # Register initial commands
        self.register(SystemInfoCommand())
        self.register(OpenChromeCommand())
        self.register(OpenSpotifyCommand())
        self.register(OpenDiscordCommand())
        self.register(OpenFolderCommand())

    def get_command(self, name: str) -> Optional[BaseCommand]:
        return self._commands.get(name)

    def list_commands(self) -> List[Dict[str, str]]:
        return [
            {"name": cmd.name, "description": cmd.description, "category": cmd.category}
            for cmd in self._commands.values()
        ]

    async def execute(self, name: str, params: Dict[str, Any] = None) -> CommandResult:
        command = self.get_command(name)
        if not command:
            return CommandResult(status="error", message=f"Command '{name}' not found")
        
        return await command.run(params or {})

# Singleton instance
registry = CommandRegistry()
