# ClawMart Listing — OpenClaw Mission Control

## Title
OpenClaw Mission Control — Real-Time Agent Dashboard

## Tagline
See exactly what your AI agents are doing, right now.

## Price
$9 one-time

## Description

Stop flying blind. Mission Control gives you a live window into your entire OpenClaw agent system — which processes are running, which Ralph loop sessions are active, how much of your Claude and Codex quota you've burned, and a live tail of everything that happened.

**What's included:**
- Real-time PM2 process monitor — CPU, memory, uptime, restart count per agent
- Active Ralph loop session tracker — which agent is working on what task, alive/dead
- Token quota gauges for Claude API and Codex Pro — with amber/red alerts before you hit limits
- Live activity log feed — auto-refreshes every 5 seconds
- System health panel — droplet load, memory, disk, open ports
- Optional HTTP Basic Auth to lock the dashboard behind a password
- Zero new dependencies — uses Node built-ins only
- Single `pm2 start` command to deploy alongside your existing agents

**Works with any OpenClaw setup.** Modular adapter pattern means you can swap in your own data sources without touching the frontend.

## Setup time
Under 5 minutes.

## Requirements
- OpenClaw installed on a Linux server
- PM2 process manager
- Node.js 18+
- Port 3457 available (configurable)
