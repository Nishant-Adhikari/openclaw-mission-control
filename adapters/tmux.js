"use strict";
const { execSync } = require("child_process");

module.exports = function getTmuxSessions(socketPath) {
  const sock = socketPath || `${process.env.HOME}/.tmux/sock`;
  try {
    const raw = execSync(`tmux -S ${sock} list-sessions -F '#{session_name}'`, {
      encoding: "utf8", timeout: 3000,
    }).trim();
    return raw ? raw.split("\n").filter(Boolean) : [];
  } catch { return []; }
};
