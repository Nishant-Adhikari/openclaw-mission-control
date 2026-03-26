"use strict";

const { shell } = require("./utils");

module.exports = function getSystemHealth() {
  const memFree = parseInt(shell("free -m | grep Mem | awk '{print $4}'", "0"), 10);
  const memTotal = parseInt(shell("free -m | grep Mem | awk '{print $2}'", "1"), 10);
  const memUsed = Math.max(memTotal - memFree, 0);

  return {
    uptime: shell("uptime -p", "unknown"),
    disk: shell("df -h / | tail -1 | awk '{print $5}'", "?"),
    memUsed,
    memTotal,
    memPct: memTotal ? Math.round((memUsed / memTotal) * 100) : 0,
    loadAvg: shell("cat /proc/loadavg | awk '{print $1, $2, $3}'", "0 0 0"),
    ports: shell("ss -lntp 2>/dev/null | grep LISTEN | awk '{print $4}' | rev | cut -d: -f1 | rev | sort -n | uniq", "")
      .split("\n")
      .filter(Boolean),
    tailscaleIp: shell("tailscale ip -4 2>/dev/null | head -1", ""),
  };
};
