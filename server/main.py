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

psutil.cpu_percent(interval=None)


def format_value(value: float) -> float:
    return round(value, 2)


def format_network_value(value: float) -> float:
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


def get_average(history):
    return sum(history) / len(history) if history else 0


def get_change(history):
    return history[-1] - history[-2] if len(history) > 1 else 0


def get_network_speed():
    global last_net, last_time

    current_net = psutil.net_io_counters()
    current_time = time.time()

    elapsed = current_time - last_time

    if elapsed <= 0:
        return 0, 0

    download_bytes = current_net.bytes_recv - last_net.bytes_recv
    upload_bytes = current_net.bytes_sent - last_net.bytes_sent

    download_mbps = (download_bytes * 8) / (1024 * 1024) / elapsed
    upload_mbps = (upload_bytes * 8) / (1024 * 1024) / elapsed

    last_net = current_net
    last_time = current_time

    return (
        format_network_value(download_mbps),
        format_network_value(upload_mbps),
    )


def get_ping():
    try:
        start = time.perf_counter()

        with socket.create_connection(("8.8.8.8", 53), timeout=2):
            pass

        ping = (time.perf_counter() - start) * 1000

        return round(ping, 2)

    except Exception:
        return 0


def chart_history(history):
    return [
        {
            "index": i,
            "value": round(value, 2)
        }
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

    download_history.append(download)
    upload_history.append(upload)
    ping_history.append(ping)

    cpu_avg = get_average(cpu_history)
    ram_avg = get_average(ram_history)
    disk_avg = get_average(disk_history)

    download_avg = get_average(download_history)
    upload_avg = get_average(upload_history)
    ping_avg = get_average(ping_history)

    cpu_change = get_change(cpu_history)
    ram_change = get_change(ram_history)
    disk_change = get_change(disk_history)

    download_change = get_change(download_history)
    upload_change = get_change(upload_history)
    ping_change = get_change(ping_history)

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
            "Download": {
                "current": format_network_value(download),
                "average": format_network_value(download_avg),
                "change": format_change(download_change),
                "status": get_change_status(download_change),
                "history": chart_history(download_history),
                "unit": "Mbps"
            },
            "Upload": {
                "current": format_network_value(upload),
                "average": format_network_value(upload_avg),
                "change": format_change(upload_change),
                "status": get_change_status(upload_change),
                "history": chart_history(upload_history),
                "unit": "Mbps"
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