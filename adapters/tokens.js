"use strict";
const fs = require("fs");

const DEFAULTS = {
  claude: { used: 0, limit: 100000, reqs: 0, cost: 0, resetAt: null },
  codex:  { used: 0, limit: 200000, reqs: 0, resetAt: null },
};

module.exports = function getTokenUsage(tokensFile) {
  try {
    if (!tokensFile || !fs.existsSync(tokensFile)) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(tokensFile, "utf8")) };
  } catch { return DEFAULTS; }
};
