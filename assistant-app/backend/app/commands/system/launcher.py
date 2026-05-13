import os
import subprocess
from typing import Dict, Any
from ..base.command import BaseCommand, CommandResult

class AppLauncherCommand(BaseCommand):
    name = "launcher"
    description = "Opens specific applications or folders"
    category = "system"

    # Map of friendly names to actual executable paths or shell commands
    APP_MAP = {
        "chrome": "chrome.exe",
        "spotify": "spotify.exe",
        "discord": "discord.exe",
        "folder": "explorer.exe"
    }

    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        app_name = params.get("app")
        path = params.get("path", "")

        if not app_name and not path:
            return CommandResult(status="error", message="Missing app name or path")

        try:
            if app_name == "folder" or path:
                # Open specific path or explorer
                target = path if path else "."
                os.startfile(target)
                msg = f"Opened folder: {target}"
            else:
                # Try to launch app by name
                # This assumes the app is in the PATH or can be found by start command
                subprocess.Popen(f"start {app_name}", shell=True)
                msg = f"Launching {app_name}..."

            return CommandResult(status="success", message=msg)
            
        except Exception as e:
            return CommandResult(status="error", message=f"Failed to launch: {str(e)}")

class OpenChromeCommand(BaseCommand):
    name = "open_chrome"
    description = "Open Google Chrome"
    category = "system"
    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        try:
            subprocess.Popen("start chrome", shell=True)
            return CommandResult(status="success", message="Chrome launched")
        except Exception as e: return CommandResult(status="error", message=str(e))

class OpenSpotifyCommand(BaseCommand):
    name = "open_spotify"
    description = "Open Spotify"
    category = "system"
    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        try:
            subprocess.Popen("start spotify", shell=True)
            return CommandResult(status="success", message="Spotify launched")
        except Exception as e: return CommandResult(status="error", message=str(e))

class OpenDiscordCommand(BaseCommand):
    name = "open_discord"
    description = "Open Discord"
    category = "system"
    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        try:
            subprocess.Popen("start discord", shell=True)
            return CommandResult(status="success", message="Discord launched")
        except Exception as e: return CommandResult(status="error", message=str(e))

class OpenFolderCommand(BaseCommand):
    name = "open_folder"
    description = "Open a folder in Explorer"
    category = "system"
    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        try:
            path = params.get("path", ".")
            os.startfile(path)
            return CommandResult(status="success", message=f"Opened folder: {path}")
        except Exception as e: return CommandResult(status="error", message=str(e))
