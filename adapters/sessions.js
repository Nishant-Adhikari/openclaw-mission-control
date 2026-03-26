"use strict";

const fs = require("fs");

module.exports = function getSessions(sessionsFile) {
  try {
    if (!fs.existsSync(sessionsFile)) return [];
    const stored = JSON.parse(fs.readFileSync(sessionsFile, "utf8"));
    return Object.entries(stored)
      .map(([key, info]) => ({
        key,
        displayName: info.displayName || key,
        chatType: info.chatType || "unknown",
        sessionId: info.sessionId || null,
        updatedAt: info.updatedAt || null,
        abortedLastRun: Boolean(info.abortedLastRun),
        lastChannel: info.lastChannel || null,
        lastTo: info.lastTo || null,
        systemSent: Boolean(info.systemSent),
      }))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
};
