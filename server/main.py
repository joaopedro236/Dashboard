from fastapi import FastAPI
import psutil
from collections import deque
import time
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HISTORY_SIZE = 20

cpu_history = deque(maxlen=HISTORY_SIZE)
ram_history = deque(maxlen=HISTORY_SIZE)
disk_history = deque(maxlen=HISTORY_SIZE)


def format_value(value: float) -> float:
    return round(value, 2)


def normalize(value: float) -> float:
    return value * 100 if value <= 1 else value


def get_disk_usage():
    return psutil.disk_usage("/").percent


def get_change_status(change: float) -> str:
    return "high" if change > 0 else "low"


def format_change(value: float) -> str:
    value = round(value, 2)

    if value > 0:
        return f"+{value}"

    if value < 0:
        return str(value)

    return "0"


@app.get("/metrics")
def get_metrics():
    cpu = normalize(psutil.cpu_percent(interval=1))
    ram = normalize(psutil.virtual_memory().percent)
    disk = normalize(get_disk_usage())

    cpu_history.append(cpu)
    ram_history.append(ram)
    disk_history.append(disk)

    cpu_avg = sum(cpu_history) / len(cpu_history)
    ram_avg = sum(ram_history) / len(ram_history)
    disk_avg = sum(disk_history) / len(disk_history)

    cpu_change = cpu_history[-1] - cpu_history[-2] if len(cpu_history) > 1 else 0
    ram_change = ram_history[-1] - ram_history[-2] if len(ram_history) > 1 else 0
    disk_change = disk_history[-1] - disk_history[-2] if len(disk_history) > 1 else 0

    return {
        "cpu": {
            "current": format_value(cpu),
            "average": format_value(cpu_avg),
            "change": format_change(cpu_change),
            "status": get_change_status(cpu_change)
        },
        "ram": {
            "current": format_value(ram),
            "average": format_value(ram_avg),
            "change": format_change(ram_change),
            "status": get_change_status(ram_change)
        },
        "disk": {
            "current": format_value(disk),
            "average": format_value(disk_avg),
            "change": format_change(disk_change),
            "status": get_change_status(disk_change)
        },
        "chart": {
            "cpu_average": format_value(cpu_avg),
            "ram_average": format_value(ram_avg),
            "disk_average": format_value(disk_avg)
        },
        "timestamp": time.time()
    }