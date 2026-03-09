"use strict";
const { execSync } = require("child_process");

function shell(cmd) {
  try { return execSync(cmd, { encoding: "utf8", timeout: 3000 }).trim(); }
  catch { return ""; }
}

module.exports = function getSystemHealth() {
  const memFree  = parseInt(shell("free -m | grep Mem | awk '{print $4}'") || "0");
  const memTotal = parseInt(shell("free -m | grep Mem | awk '{print $2}'") || "1");
  const memUsed  = memTotal - memFree;

  return {
    uptime:   shell("uptime -p") || "unknown",
    disk:     shell("df -h / | tail -1 | awk '{print $5}'") || "?",
    memUsed,
    memTotal,
    memPct:   Math.round((memUsed / memTotal) * 100),
    loadAvg:  shell("cat /proc/loadavg | awk '{print $1, $2, $3}'") || "0 0 0",
    ports:    shell("ss -lntp 2>/dev/null | grep LISTEN | awk '{print $4}' | cut -d: -f2 | sort -n | uniq")
                .split("\n").filter(Boolean),
  };
};
