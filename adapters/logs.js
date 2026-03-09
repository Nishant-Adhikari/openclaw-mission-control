"use strict";
const fs = require("fs");

module.exports = function getLogs(logFile, lines = 100) {
  try {
    if (!fs.existsSync(logFile)) return [];
    const content = fs.readFileSync(logFile, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .slice(-lines)
      .map(line => {
        const match = line.match(/^\[(.+?)\]\s+(.*)$/);
        return match
          ? { ts: match[1], msg: match[2] }
          : { ts: new Date().toISOString(), msg: line };
      })
      .reverse();
  } catch { return []; }
};
