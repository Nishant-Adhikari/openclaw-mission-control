"use strict";

const { execSync } = require("child_process");

function shell(command, fallback = "") {
  try {
    return execSync(command, {
      encoding: "utf8",
      timeout: 12000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function shellJson(command, fallback) {
  const raw = shell(command, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

module.exports = {
  shell,
  shellJson,
};
