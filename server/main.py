from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
import psutil
import socket
import time

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

HISTORY_SIZE = 5

cpu_history = deque(maxlen=HISTORY_SIZE)
ram_history = deque(maxlen=HISTORY_SIZE)
disk_history = deque(maxlen=HISTORY_SIZE)

download_history = deque(maxlen=HISTORY_SIZE)
upload_history = deque(maxlen=HISTORY_SIZE)
ping_history = deque(maxlen=HISTORY_SIZE)

last_net = psutil.net_io_counters()
last_time = time.time()


def format_value(value: float) -> float:
    return round(value, 2)


def format_network_value(value: float) -> float:
    return round(min(value, 99.99), 2)


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


def get_network_speed():
    global last_net, last_time

    current_net = psutil.net_io_counters()
    current_time = time.time()

    elapsed = current_time - last_time

    if elapsed < 0.1:
        return 0, 0

    download_bytes = current_net.bytes_recv - last_net.bytes_recv
    upload_bytes = current_net.bytes_sent - last_net.bytes_sent

    download_kb = (download_bytes / 1024) / elapsed
    upload_kb = (upload_bytes / 1024) / elapsed

    last_net = current_net
    last_time = current_time

    return round(download_kb, 2), round(upload_kb, 2)


def get_ping():
    try:
        start = time.time()
        sock = socket.create_connection(("8.8.8.8", 53), timeout=2)
        ping = (time.time() - start) * 1000
        sock.close()
        return round(ping, 2)
    except Exception:
        return 0


def chart_history(history):
    return [
        {"index": i, "value": format_network_value(value)}
        for i, value in enumerate(history)
    ]


@app.get("/metrics")
def get_metrics():
    cpu = normalize(psutil.cpu_percent(interval=None))
    ram = normalize(psutil.virtual_memory().percent)
    disk = normalize(get_disk_usage())

    download, upload = get_network_speed()
    ping = get_ping()

    cpu_history.append(cpu)
    ram_history.append(ram)
    disk_history.append(disk)

    download_history.append(format_network_value(download))
    upload_history.append(format_network_value(upload))
    ping_history.append(format_network_value(ping))

    cpu_avg = sum(cpu_history) / len(cpu_history)
    ram_avg = sum(ram_history) / len(ram_history)
    disk_avg = sum(disk_history) / len(disk_history)

    download_avg = sum(download_history) / len(download_history)
    upload_avg = sum(upload_history) / len(upload_history)
    ping_avg = sum(ping_history) / len(ping_history)

    cpu_change = cpu_history[-1] - cpu_history[-2] if len(cpu_history) > 1 else 0
    ram_change = ram_history[-1] - ram_history[-2] if len(ram_history) > 1 else 0
    disk_change = disk_history[-1] - disk_history[-2] if len(disk_history) > 1 else 0

    download_change = download_history[-1] - download_history[-2] if len(download_history) > 1 else 0
    upload_change = upload_history[-1] - upload_history[-2] if len(upload_history) > 1 else 0
    ping_change = ping_history[-1] - ping_history[-2] if len(ping_history) > 1 else 0

    return {
        "cpu": {
            "current": format_value(cpu),
            "average": format_value(cpu_avg),
            "change": format_change(cpu_change),
            "status": get_change_status(cpu_change),
            "history": chart_history(cpu_history)
        },
        "ram": {
            "current": format_value(ram),
            "average": format_value(ram_avg),
            "change": format_change(ram_change),
            "status": get_change_status(ram_change),
            "history": chart_history(ram_history)
        },
        "disk": {
            "current": format_value(disk),
            "average": format_value(disk_avg),
            "change": format_change(disk_change),
            "status": get_change_status(disk_change),
            "history": chart_history(disk_history)
        },
        "network": {
            "download": {
                "current": format_network_value(download),
                "average": format_network_value(download_avg),
                "change": format_change(download_change),
                "status": get_change_status(download_change),
                "history": chart_history(download_history),
                "unit": "KB/s"
            },
            "upload": {
                "current": format_network_value(upload),
                "average": format_network_value(upload_avg),
                "change": format_change(upload_change),
                "status": get_change_status(upload_change),
                "history": chart_history(upload_history),
                "unit": "KB/s"
            },
            "ping": {
                "current": format_network_value(ping),
                "average": format_network_value(ping_avg),
                "change": format_change(ping_change),
                "status": get_change_status(-ping_change),
                "history": chart_history(ping_history),
                "unit": "ms"
            }
        },
        "chart": {
            "cpu_average": format_value(cpu_avg),
            "ram_average": format_value(ram_avg),
            "disk_average": format_value(disk_avg),
            "download_average": format_network_value(download_avg),
            "upload_average": format_network_value(upload_avg),
            "ping_average": format_network_value(ping_avg)
        },
        "timestamp": time.time()
    }