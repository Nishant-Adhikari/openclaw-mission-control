"use strict";
const { execSync } = require("child_process");

module.exports = function getPM2Status() {
  try {
    const raw = execSync("pm2 jlist", { encoding: "utf8", timeout: 5000 }).trim();
    if (!raw) return [];
    return JSON.parse(raw).map(p => ({
      name:     p.name,
      status:   p.pm2_env?.status || "unknown",
      cpu:      p.monit?.cpu || 0,
      memory:   Math.round((p.monit?.memory || 0) / 1024 / 1024),
      uptime:   p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : 0,
      restarts: p.pm2_env?.restart_time || 0,
      pid:      p.pid || null,
    }));
  } catch { return []; }
};
