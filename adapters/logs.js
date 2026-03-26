"use strict";

const fs = require("fs");

function parseLine(line) {
  try {
    const parsed = JSON.parse(line);
    const first = parsed[0];
    return {
      ts: parsed.time || new Date().toISOString(),
      level: parsed?._meta?.logLevelName || "INFO",
      subsystem: first && typeof first === "string" && first.includes("subsystem") ? first : null,
      msg: [parsed[0], parsed[1], parsed[2]].filter(Boolean).map((v) => {
        if (typeof v === "string") return v;
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      }).join(" "),
    };
  } catch {
    const match = line.match(/^\[(.+?)\]\s+(.*)$/);
    return match
      ? { ts: match[1], level: "INFO", subsystem: null, msg: match[2] }
      : { ts: new Date().toISOString(), level: "INFO", subsystem: null, msg: line };
  }
}

module.exports = function getLogs(logFile, lines = 100) {
  try {
    if (!fs.existsSync(logFile)) return [];
    const content = fs.readFileSync(logFile, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .slice(-lines)
      .map(parseLine)
      .reverse();
  } catch {
    return [];
  }
};
