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


def percent(value):
    return f"{round(value, 2)}%"


def mbps(value):
    return f"{round(value, 2)} Mbps"


def ms(value):
    return f"{round(value, 2)} ms"


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

    return round(download_mbps, 2), round(upload_mbps, 2)


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


@app.get("/")
def root():
    return {"status": "online"}


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
            "current": percent(cpu),
            "average": percent(cpu_avg),
            "change": f"{format_change(cpu_change)}%",
            "status": get_change_status(cpu_change),
            "history": chart_history(cpu_history)
        },
        "ram": {
            "current": percent(ram),
            "average": percent(ram_avg),
            "change": f"{format_change(ram_change)}%",
            "status": get_change_status(ram_change),
            "history": chart_history(ram_history)
        },
        "disk": {
            "current": percent(disk),
            "average": percent(disk_avg),
            "change": f"{format_change(disk_change)}%",
            "status": get_change_status(disk_change),
            "history": chart_history(disk_history)
        },
        "network": {
            "Download": {
                "current": mbps(download),
                "average": mbps(download_avg),
                "change": f"{format_change(download_change)} Mbps",
                "status": get_change_status(download_change),
                "history": chart_history(download_history)
            },
            "Upload": {
                "current": mbps(upload),
                "average": mbps(upload_avg),
                "change": f"{format_change(upload_change)} Mbps",
                "status": get_change_status(upload_change),
                "history": chart_history(upload_history)
            },
            "ping": {
                "current": ms(ping),
                "average": ms(ping_avg),
                "change": f"{format_change(ping_change)} ms",
                "status": get_change_status(-ping_change),
                "history": chart_history(ping_history)
            }
        },
        "chart": {
            "cpu_average": percent(cpu_avg),
            "ram_average": percent(ram_avg),
            "disk_average": percent(disk_avg),
            "download_average": mbps(download_avg),
            "upload_average": mbps(upload_avg),
            "ping_average": ms(ping_avg)
        },
        "timestamp": time.time()
    }


@app.get("/processes")
def get_processes():
    groups = {}

    for proc in psutil.process_iter():
        try:
            name = proc.name() or "Unknown"

            cpu = proc.cpu_percent(interval=None)
            memory_info = proc.memory_info()

            memory_gb = memory_info.rss / (1024 ** 3)
            memory_percent = proc.memory_percent()

            threads = proc.num_threads()

            try:
                handles = proc.num_handles()  # Windows
            except:
                handles = 0

            try:
                io = proc.io_counters()
                read_mb = io.read_bytes / (1024 * 1024)
                write_mb = io.write_bytes / (1024 * 1024)
            except:
                read_mb = 0
                write_mb = 0

            try:
                connections = len(proc.net_connections())
            except:
                connections = 0

            try:
                uptime_hours = (
                    time.time() - proc.create_time()
                ) / 3600
            except:
                uptime_hours = 0

            if name not in groups:
                groups[name] = {
                    "cpu": 0,
                    "memory_gb": 0,
                    "memory_percent": 0,
                    "threads": 0,
                    "handles": 0,
                    "disk_read_mb": 0,
                    "disk_write_mb": 0,
                    "connections": 0,
                    "processes": [],
                    "uptimes": []
                }

            groups[name]["cpu"] += cpu
            groups[name]["memory_gb"] += memory_gb
            groups[name]["memory_percent"] += memory_percent
            groups[name]["threads"] += threads
            groups[name]["handles"] += handles
            groups[name]["disk_read_mb"] += read_mb
            groups[name]["disk_write_mb"] += write_mb
            groups[name]["connections"] += connections
            groups[name]["uptimes"].append(uptime_hours)

            groups[name]["processes"].append({
                "pid": proc.pid,
                "cpu": round(cpu, 2),
                "memory_gb": round(memory_gb, 2),
                "memory_percent": round(memory_percent, 2),
                "threads": threads,
                "handles": handles,
                "disk_read_mb": round(read_mb, 2),
                "disk_write_mb": round(write_mb, 2),
                "connections": connections,
                "uptime_hours": round(uptime_hours, 2),
                "status": proc.status()
            })

        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied,
            psutil.ZombieProcess
        ):
            continue

    apps = []

    for name, data in groups.items():
        avg_uptime = (
            sum(data["uptimes"]) / len(data["uptimes"])
            if data["uptimes"] else 0
        )

        apps.append({
            "name": name,
            "process_count": len(data["processes"]),
            "current": {
                "cpu_percent": round(data["cpu"], 2),
                "memory_gb": round(data["memory_gb"], 2),
                "memory_percent": round(data["memory_percent"], 2),
                "threads": data["threads"],
                "handles": data["handles"],
                "disk_read_mb": round(data["disk_read_mb"], 2),
                "disk_write_mb": round(data["disk_write_mb"], 2),
                "connections": data["connections"],
                "avg_uptime_hours": round(avg_uptime, 2)
            },
            "processes": data["processes"]
        })

    apps.sort(
        key=lambda x: x["current"]["memory_gb"],
        reverse=True
    )

    return {
        "cpu_total": round(psutil.cpu_percent(), 2),
        "ram_total_gb": round(
            psutil.virtual_memory().total / (1024 ** 3),
            2
        ),
        "ram_used_gb": round(
            psutil.virtual_memory().used / (1024 ** 3),
            2
        ),
        "ram_percent": psutil.virtual_memory().percent,
        "apps": apps,
        "timestamp": time.time()
    }