# OpenClaw Mission Control

A real-time dashboard for monitoring an OpenClaw system running under `systemd`.

Surfaces live data from OpenClaw itself: gateway health, Discord connectivity, cron jobs, session store, daily note status, logs, and host health — all in a single browser tab.

![Mission Control Dashboard](./docs/preview.png)

---

## What it monitors

| Panel | Data |
|-------|------|
| **Overview** | OpenClaw version, service health, Discord probe, model policy, daily note status |
| **Cron** | Active cron jobs, next/last run, status, consecutive errors |
| **Sessions** | OpenClaw session store activity |
| **Logs** | OpenClaw log tail with parsed JSON log lines |
| **System** | Uptime, memory, disk, open ports, Tailscale IP |

---

## Stack

- **Backend:** Node.js + built-in `http` module (zero dependencies beyond what OpenClaw already has)
- **Frontend:** Vanilla React (loaded from CDN) — single HTML file, no build step
- **Runtime target:** OpenClaw on `systemd`
- **Data sources:** `openclaw --version`, `openclaw channels status --probe --json`, `openclaw cron list --json`, session store JSON, OpenClaw log files, host shell commands

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Nishant-Adhikari/openclaw-mission-control.git
cd openclaw-mission-control

# 2. Install deps
npm install

# 3. Configure paths
cp .env.example .env

# 4. Start
npm start

# 5. Open in browser
open http://YOUR_DROPLET_IP:3457
```

---

## Configuration

All config is via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_PORT` | `3457` | Port the dashboard serves on |
| `LOG_FILE` | `/tmp/openclaw/openclaw-YYYY-MM-DD.log` | Path to OpenClaw log file |
| `SESSIONS_FILE` | `/root/.openclaw/agents/main/sessions/sessions.json` | OpenClaw session store |
| `OPENCLAW_CONFIG` | `/root/.openclaw/openclaw.json` | OpenClaw config path |
| `MEMORY_DIR` | `/root/.openclaw/workspaces/main/memory` | Daily notes directory |
| `DASHBOARD_USER` | _(none)_ | Basic auth username (optional) |
| `DASHBOARD_PASS` | _(none)_ | Basic auth password (optional) |

---

## Budget policy

The dashboard currently shows static budget guardrails from your OpenClaw operating policy:
- daily target
- monthly target
- routine output target
- complex output target

If you want live provider spend, add a new adapter that reads provider usage APIs or a local spend ledger.

---

## Security

By default the dashboard is open on the port — **don't expose it publicly without auth.**

Set `DASHBOARD_USER` and `DASHBOARD_PASS` in `.env` to enable HTTP Basic Auth.

Or expose it only on Tailscale / behind a firewall:
```bash
ufw allow from YOUR_IP_ADDRESS to any port 3457
```

---

## Modular adapters

The backend uses an adapter pattern so you can swap out data sources:

```
adapters/
  openclaw.js   ← reads version, channels, cron, config, daily note state
  sessions.js   ← reads OpenClaw session store
  logs.js       ← reads and parses OpenClaw logs
  tokens.js     ← serves budget policy defaults
  system.js     ← reads /proc, ports, Tailscale, shell commands
```

To add a new data source, create a new adapter and register it in `server.js`.

---

## ClawMart

This is available as a skill on [ClawMart](https://shopclawmart.com). Buy it there for a pre-configured bundle with setup instructions, or clone and self-host for free.

---

## License

MIT
