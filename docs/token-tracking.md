# Token Tracking Integration

The Mission Control dashboard reads token usage from `memory/tokens.json`.
Your bot needs to write to this file after each API call.

## Schema

```json
{
  "claude": {
    "used": 14820,
    "limit": 100000,
    "reqs": 23,
    "cost": 0.0037,
    "resetAt": "2025-01-15T00:00:00.000Z"
  },
  "codex": {
    "used": 47300,
    "limit": 200000,
    "reqs": 61,
    "resetAt": "2025-01-15T00:00:00.000Z"
  }
}
```

## Example — Node.js helper

Add this to your bot:

```js
const fs   = require("fs");
const path = require("path");

const TOKENS_FILE = path.join(__dirname, "memory/tokens.json");

function readTokens() {
  try { return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8")); }
  catch { return { claude: { used:0, limit:100000, reqs:0, cost:0 }, codex: { used:0, limit:200000, reqs:0 } }; }
}

function trackClaudeUsage(inputTokens, outputTokens) {
  const t = readTokens();
  // Haiku pricing: $0.80/M input, $4/M output
  const cost = (inputTokens * 0.0000008) + (outputTokens * 0.000004);
  t.claude.used  += inputTokens + outputTokens;
  t.claude.reqs  += 1;
  t.claude.cost  = (t.claude.cost || 0) + cost;
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(t, null, 2));
}

function trackCodexUsage(tokens) {
  const t = readTokens();
  t.codex.used += tokens;
  t.codex.reqs += 1;
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(t, null, 2));
}

// Reset daily at midnight — call this from a CRON job
function resetTokenCounts() {
  const reset = {
    claude: { used:0, limit:100000, reqs:0, cost:0, resetAt: new Date().toISOString() },
    codex:  { used:0, limit:200000, reqs:0,          resetAt: new Date().toISOString() },
  };
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(reset, null, 2));
}
```

Wire `trackClaudeUsage` into your Anthropic SDK response handler:

```js
const response = await anthropic.messages.create({ ... });
trackClaudeUsage(
  response.usage.input_tokens,
  response.usage.output_tokens
);
```
