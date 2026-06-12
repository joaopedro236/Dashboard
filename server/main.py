from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
import psutil
import socket
import time
import multiprocessing
import threading
import os
import tempfile
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hardware-monitoring-dashboard.vercel.app",
        "https://hardware-monitoring-dashboard-1y8hfbqpa-joao-pedro4.vercel.app"
    ],
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
def chart_network_history(download_history, upload_history):
    return [
        {
            "index": i,
            "value": round(download, 2),
            "valueUpload": round(upload, 2)
        }
        for i, (download, upload) in enumerate(
            zip(download_history, upload_history)
        )
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
            "DownloadOrUpload": {
                "current": mbps(download),
                "average": mbps(download_avg),
                "change": f"{format_change(download_change)} Mbps",
                "status": get_change_status(download_change),

                "currentUpload": mbps(upload),
                "averageUpload": mbps(upload_avg),
                "changeUpload": f"{format_change(upload_change)} Mbps",
                "statusUpload": get_change_status(upload_change),

                "history": chart_network_history(
                    download_history,
                    upload_history
                )
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
        "Infrastructure": {
            "currentCpu": percent(cpu),
            "currentRam": percent(ram),
            "currentDisk": percent(disk),
            "currentNetwork": mbps(download),

        },
        "timestamp": time.time()
    }
def cpu_worker():
    x = 0
    while True:
        for i in range(350000):
            x += i * i

def ram_worker(limit_mb: int):
    block = bytearray(5 * 1054 * 1054)
    data = []
    total = 0
    while total < limit_mb:
        data.append(block)
        total += 5
        time.sleep(0.05)

def disk_worker(duration: int):
    end = time.time() + duration
    path = tempfile.mktemp()

    while time.time() < end:
        with open(path, "wb") as f:
            f.write(os.urandom(2 * 1054 * 1054))
        with open(path, "rb") as f:
            _ = f.read()

    try:
        os.remove(path)
    except:
        pass

def runner(duration: int, ram_mb: int):
    procs = []

    for _ in range(max(1, multiprocessing.cpu_count() // 2)):
        p = multiprocessing.Process(target=cpu_worker)
        p.start()
        procs.append(p)

    r = multiprocessing.Process(target=ram_worker, args=(ram_mb,))
    r.start()
    procs.append(r)

    d = multiprocessing.Process(target=disk_worker, args=(duration,))
    d.start()
    procs.append(d)

    time.sleep(duration)

    for p in procs:
        p.terminate()
        p.join()

@app.get("/processes")
def processes(duration: int = 30, ram_mb: int = 300):
    t = threading.Thread(target=runner, args=(duration, ram_mb), daemon=True)
    t.start()
    return {"status": "running"}
    groups = {}

    for proc in psutil.process_iter():
        try:
            name = proc.name() or "Unknown"

            cpu = proc.cpu_percent(interval=None)
            memory_gb = proc.memory_info().rss / (1024 ** 3)

            if name not in groups:
                groups[name] = {
                    "cpu": 0,
                    "memory_gb": 0,
                    "threads": 0,
                    "process_count": 0,
                    "connections": 0,
                    "disk_read_mb": 0,
                    "disk_write_mb": 0,
                }

            groups[name]["cpu"] += cpu
            groups[name]["memory_gb"] += memory_gb
            groups[name]["threads"] += proc.num_threads()
            groups[name]["process_count"] += 1

            try:
                groups[name]["connections"] += len(
                    proc.net_connections()
                )
            except:
                pass

            try:
                io = proc.io_counters()

                groups[name]["disk_read_mb"] += (
                    io.read_bytes / 1024 / 1024
                )

                groups[name]["disk_write_mb"] += (
                    io.write_bytes / 1024 / 1024
                )
            except:
                pass

        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied,
            psutil.ZombieProcess,
        ):
            continue

    apps = []

    for name, data in groups.items():
        apps.append({
            "name": name,
            "process_count": data["process_count"],
            "cpu_percent": round(data["cpu"], 2),
            "memory_gb": round(data["memory_gb"], 2),
            "threads": data["threads"],
            "connections": data["connections"],
            "disk_read_mb": round(
                data["disk_read_mb"], 2
            ),
            "disk_write_mb": round(
                data["disk_write_mb"], 2
            ),
        })

    apps.sort(
        key=lambda x: x["memory_gb"],
        reverse=True
    )

    vm = psutil.virtual_memory()

    return {
        "cpu_total_percent": psutil.cpu_percent(),
        "ram_total_gb": round(
            vm.total / (1024 ** 3), 2
        ),
        "ram_used_gb": round(
            vm.used / (1024 ** 3), 2
        ),
        "ram_percent": vm.percent,
        "apps": apps,
        "timestamp": time.time()
    }
