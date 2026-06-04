from fastapi import FastAPI
import psutil
from collections import deque
import time

app = FastAPI()

# Stores last N samples for average calculation
HISTORY_SIZE = 20

cpu_history = deque(maxlen=HISTORY_SIZE)
ram_history = deque(maxlen=HISTORY_SIZE)
disk_history = deque(maxlen=HISTORY_SIZE)


def format_value(value: float) -> float:
    return round(value, 2)


def get_status(value: float, threshold: float = 70.0) -> str:
    return "high" if value >= threshold else "low"


def get_disk_usage():
    disk = psutil.disk_usage("/")
    return disk.percent


@app.get("/metrics")
def get_metrics():
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    disk = get_disk_usage()

    cpu_history.append(cpu)
    ram_history.append(ram)
    disk_history.append(disk)

    cpu_avg = sum(cpu_history) / len(cpu_history)
    ram_avg = sum(ram_history) / len(ram_history)
    disk_avg = sum(disk_history) / len(disk_history)

    response = {
        "cpu": {
            "current": format_value(cpu),
            "average": format_value(cpu_avg),
            "status": get_status(cpu)
        },
        "ram": {
            "current": format_value(ram),
            "average": format_value(ram_avg),
            "status": get_status(ram)
        },
        "disk": {
            "current": format_value(disk),
            "average": format_value(disk_avg),
            "status": get_status(disk, threshold=80.0)
        },
        "timestamp": time.time()
    }

    return response