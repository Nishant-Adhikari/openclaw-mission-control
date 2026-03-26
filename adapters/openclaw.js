"use strict";

const fs = require("fs");
const path = require("path");
const { shell, shellJson } = require("./utils");

function parseVersion(raw) {
  const match = raw.match(/OpenClaw\s+([^\s]+)\s+\(([^)]+)\)/);
  return {
    raw,
    version: match ? match[1] : raw || "unknown",
    commit: match ? match[2] : null,
  };
}

function todayFile(memoryDir) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return path.join(memoryDir, `${yyyy}-${mm}-${dd}.md`);
}

module.exports = function getOpenClawStatus(configPath, memoryDir) {
  const version = parseVersion(shell("openclaw --version", "unknown"));
  const serviceActive = shell("systemctl is-active openclaw-gateway", "unknown");
  const serviceEnabled = shell("systemctl is-enabled openclaw-gateway", "unknown");
  const cronStatus = shellJson("openclaw cron list --json", { jobs: [] });
  const tailscale = shell("tailscale ip -4 2>/dev/null | head -1", "");

  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    config = {};
  }

  const discordAccount = config?.channels?.discord?.accounts?.default || null;
  const discordConfigured = Boolean(discordAccount?.enabled && discordAccount?.token);
  const channelStatus = {
    channels: {
      discord: {
        configured: discordConfigured,
        running: serviceActive === "active",
      },
    },
    channelAccounts: {
      discord: discordAccount ? [{
        accountId: "default",
        enabled: Boolean(discordAccount.enabled),
        configured: discordConfigured,
        running: serviceActive === "active",
        connected: serviceActive === "active" && discordConfigured,
        bot: {
          username: "Jarvis",
        },
        probe: {
          ok: serviceActive === "active" && discordConfigured,
        },
      }] : [],
    },
  };

  const dailyPath = todayFile(memoryDir);
  const dailyNoteExists = fs.existsSync(dailyPath);

  return {
    version,
    service: {
      active: serviceActive,
      enabled: serviceEnabled,
      healthy: serviceActive === "active",
    },
    tailscale: {
      ip: tailscale || null,
      enabled: Boolean(tailscale),
    },
    channels: channelStatus,
    cron: {
      jobs: cronStatus.jobs || [],
      total: (cronStatus.jobs || []).length,
      unhealthy: (cronStatus.jobs || []).filter((job) => job.state?.lastStatus && job.state.lastStatus !== "ok").length,
    },
    config: {
      primaryModel: config?.agents?.defaults?.model?.primary || null,
      fallbackModels: config?.agents?.defaults?.model?.fallbacks || [],
      aliases: config?.agents?.defaults?.models || {},
      heartbeatEvery: config?.agents?.defaults?.heartbeat?.every || null,
      heartbeatModel: config?.agents?.defaults?.heartbeat?.model || null,
      workspace: config?.agents?.defaults?.workspace || null,
    },
    dailyNote: {
      path: dailyPath,
      exists: dailyNoteExists,
      size: dailyNoteExists ? fs.statSync(dailyPath).size : 0,
    },
    ts: new Date().toISOString(),
  };
};
