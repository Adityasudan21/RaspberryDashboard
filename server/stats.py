#!/usr/bin/env python3
"""Raspberry Pi stats API. Stdlib only. Serves GET /api/stats and the built frontend."""
import json
import mimetypes
import os
import shutil
import socket
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", 1998))
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")
DISK_PATH = os.environ.get("DISK_PATH", "/")
TEMP_FILE = "/sys/class/thermal/thermal_zone0/temp"


def read_cpu_times():
    """Return {name: (idle, total)} for 'cpu' and each 'cpuN' line of /proc/stat."""
    times = {}
    with open("/proc/stat") as f:
        for line in f:
            if not line.startswith("cpu"):
                break
            name, *vals = line.split()
            vals = list(map(int, vals))
            idle = vals[3] + vals[4]  # idle + iowait
            times[name] = (idle, sum(vals[:8]))
    return times


class CpuSampler(threading.Thread):
    """Samples /proc/stat in the background so requests never block."""

    def __init__(self, interval=1.0):
        super().__init__(daemon=True)
        self.interval = interval
        self.total = 0.0
        self.per_core = []
        self.lock = threading.Lock()

    def run(self):
        prev = read_cpu_times()
        while True:
            time.sleep(self.interval)
            cur = read_cpu_times()
            usage = {}
            for name, (idle, total) in cur.items():
                p_idle, p_total = prev.get(name, (idle, total))
                d_total = total - p_total
                usage[name] = round(100 * (1 - (idle - p_idle) / d_total), 1) if d_total else 0.0
            with self.lock:
                self.total = usage.get("cpu", 0.0)
                cores = sorted((k for k in usage if k != "cpu"), key=lambda k: int(k[3:]))
                self.per_core = [usage[k] for k in cores]
            prev = cur

    def snapshot(self):
        with self.lock:
            return self.total, list(self.per_core)


sampler = CpuSampler()


def read_temp():
    try:
        with open(TEMP_FILE) as f:
            return round(int(f.read()) / 1000, 1)
    except (OSError, ValueError):
        return None


def read_memory():
    info = {}
    with open("/proc/meminfo") as f:
        for line in f:
            key, val = line.split(":", 1)
            info[key] = int(val.split()[0]) * 1024
    total = info["MemTotal"]
    available = info.get("MemAvailable", info["MemFree"])
    used = total - available
    return {"total": total, "used": used, "available": available,
            "percent": round(100 * used / total, 1)}


def collect():
    usage, per_core = sampler.snapshot()
    with open("/proc/uptime") as f:
        uptime = float(f.read().split()[0])
    disk = shutil.disk_usage(DISK_PATH)
    return {
        "hostname": socket.gethostname(),
        "cpu": {"usage": usage, "perCore": per_core, "cores": os.cpu_count(), "temp": read_temp()},
        "load": [round(x, 2) for x in os.getloadavg()],
        "uptime": uptime,
        "memory": read_memory(),
        "disk": {"total": disk.total, "used": disk.used, "free": disk.free,
                 "percent": round(100 * disk.used / disk.total, 1)},
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST, **kwargs)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/stats":
            body = json.dumps(collect()).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        elif os.path.isdir(DIST):
            super().do_GET()
        else:
            self.send_error(404, "Frontend not built. Run `npm run build` in frontend/.")

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    mimetypes.add_type("text/javascript", ".js")
    sampler.start()
    print(f"Serving on http://0.0.0.0:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
