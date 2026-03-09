"use strict";
const fs          = require("fs");
const getTmux     = require("./tmux");

module.exports = function getSessions(sessionsFile, tmuxSocket) {
  try {
    const stored = sessionsFile && fs.existsSync(sessionsFile)
      ? JSON.parse(fs.readFileSync(sessionsFile, "utf8"))
      : {};
    const active = getTmux(tmuxSocket);
    return Object.entries(stored).map(([name, info]) => ({
      name,
      alive:   active.includes(name),
      task:    info.task || info.prd || "unknown",
      agent:   info.agent || "codex",
      started: info.started || null,
      status:  active.includes(name) ? "running" : (info.status || "stopped"),
    }));
  } catch { return []; }
};
