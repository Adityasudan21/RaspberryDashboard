# Raspberry Pi Dashboard

React frontend + a tiny stdlib-only Python API (~20 MB RAM) showing CPU usage, CPU temperature, uptime, cores, memory and disk usage.

## Setup
Node is required to build the frontend:

    sudo apt install nodejs npm
    cd frontend && npm install

## Run (production, single process)
    cd frontend && npm run build
    python3 server/stats.py        # http://<pi-ip>:1998

## Develop
    python3 server/stats.py        # API on :1998
    cd frontend && npm run dev     # Vite on :1999, proxies /api

## Config (env vars)
- `PORT` (default 1998)
- `DISK_PATH` (default `/`), the mount point reported as SSD usage

## API
`GET /api/stats` returns JSON with `cpu`, `load`, `uptime`, `memory`, `disk`.
