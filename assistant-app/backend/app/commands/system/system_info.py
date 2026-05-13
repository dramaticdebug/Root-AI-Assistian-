import psutil
import platform
import time
from typing import Dict, Any
from ..base.command import BaseCommand, CommandResult

class SystemInfoCommand(BaseCommand):
    name = "get_system_info"
    description = "Retrieves CPU, RAM, and OS information"
    category = "system"

    async def execute(self, params: Dict[str, Any]) -> CommandResult:
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            
            data = {
                "cpu_usage": f"{cpu_percent}%",
                "ram_usage": f"{memory.percent}%",
                "platform": platform.system(),
                "platform_release": platform.release(),
                "architecture": platform.machine(),
                "boot_time": time.ctime(psutil.boot_time())
            }
            
            return CommandResult(
                status="success",
                message="System information retrieved successfully",
                data=data
            )
        except Exception as e:
            return CommandResult(status="error", message=str(e))
