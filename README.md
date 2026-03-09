# OpenClaw Mission Control

A real-time dashboard for monitoring AI agent systems running on OpenClaw + PM2.

Surfaces live data from PM2 process manager, tmux agent sessions, token usage (Claude API + Codex), logs, and system health — all in a single browser tab.

![Mission Control Dashboard](./docs/preview.png)

---

## What it monitors

| Panel | Data |
|-------|------|
| **Agents** | PM2 process status, CPU, memory, uptime, restart count |
| **Sessions** | Active Ralph loop tmux sessions — which agent, which task, alive/dead |
| **Token Usage** | Claude API quota %, Codex quota %, per-request cost estimate |
| **Logs** | Live activity log from all agents, auto-refreshes every 5s |
| **System** | Droplet CPU load, memory %, disk usage, open ports |

---

## Stack

- **Backend:** Node.js + built-in `http` module (zero dependencies beyond what OpenClaw already has)
- **Frontend:** Vanilla React (loaded from CDN) — single HTML file, no build step
- **Process manager:** PM2 (sits alongside your existing agents)
- **Data sources:** `pm2 jlist`, tmux socket, log files, `memory/tokens.json`

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Nishant-Adhikari/openclaw-mission-control.git
cd openclaw-mission-control

# 2. Install deps
npm install

# 3. Add to PM2 alongside your existing agents
pm2 start ecosystem.config.js
pm2 save

# 4. Open in browser
open http://YOUR_DROPLET_IP:3457
```

---

## Configuration

All config is via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_PORT` | `3457` | Port the dashboard serves on |
| `TMUX_SOCKET` | `~/.tmux/sock` | Path to stable tmux socket |
| `LOG_FILE` | `../logs/activity.log` | Path to agent activity log |
| `SESSIONS_FILE` | `../memory/sessions.json` | Path to agent sessions JSON |
| `TOKENS_FILE` | `../memory/tokens.json` | Path to token usage JSON |
| `DASHBOARD_USER` | _(none)_ | Basic auth username (optional) |
| `DASHBOARD_PASS` | _(none)_ | Basic auth password (optional) |

---

## Token tracking

The dashboard reads from `memory/tokens.json`. Your agent bot should write to this file after each API call:

```json
{
  "claude": { "used": 14820, "limit": 100000, "reqs": 23, "cost": 0.0037 },
  "codex":  { "used": 47300, "limit": 200000, "reqs": 61 }
}
```

See `docs/token-tracking.md` for how to wire this into your bot.

---

## Security

By default the dashboard is open on the port — **don't expose it publicly without auth.**

Set `DASHBOARD_USER` and `DASHBOARD_PASS` in `.env` to enable HTTP Basic Auth.

Or restrict access with a firewall rule:
```bash
ufw allow from YOUR_IP_ADDRESS to any port 3457
```

---

## Modular adapters

The backend uses an adapter pattern so you can swap out data sources:

```
adapters/
  pm2.js        ← reads from pm2 jlist
  tmux.js       ← reads from tmux socket
  logs.js       ← reads from log files
  tokens.js     ← reads from memory/tokens.json
  system.js     ← reads from /proc and shell commands
```

To add a new data source, create a new adapter and register it in `server.js`.

---

## ClawMart

This is available as a skill on [ClawMart](https://shopclawmart.com). Buy it there for a pre-configured bundle with setup instructions, or clone and self-host for free.

---

## License

MIT
