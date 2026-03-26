/**
 * OpenClaw Mission Control — Server
 * Thin HTTP server wiring modular adapters to JSON API + static dashboard
 *
 * Routes:
 *   GET /             → dashboard UI (public/index.html)
 *   GET /api/status   → OpenClaw, cron, sessions, system, budget policy
 *   GET /api/logs     → recent agent log lines
 *   GET /api/health   → uptime check
 */

"use strict";

require("dotenv").config();

const http = require("http");
const fs   = require("fs");
const path = require("path");

function defaultOpenClawLogFile() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `/tmp/openclaw/openclaw-${yyyy}-${mm}-${dd}.log`;
}

// ── Adapters (swap any of these out for your own data source) ─────────────────
const getOpenClaw = require("./adapters/openclaw");
const getTokens   = require("./adapters/tokens");
const getSessions = require("./adapters/sessions");
const getLogs     = require("./adapters/logs");
const getSystem   = require("./adapters/system");

// ── Config ────────────────────────────────────────────────────────────────────
const PORT           = parseInt(process.env.DASHBOARD_PORT || "3457", 10);
const LOG_FILE       = process.env.LOG_FILE || defaultOpenClawLogFile();
const SESSIONS_FILE  = process.env.SESSIONS_FILE || "/root/.openclaw/agents/main/sessions/sessions.json";
const OPENCLAW_JSON  = process.env.OPENCLAW_CONFIG || "/root/.openclaw/openclaw.json";
const MEMORY_DIR     = process.env.MEMORY_DIR || "/root/.openclaw/workspaces/main/memory";
const AUTH_USER      = process.env.DASHBOARD_USER || "";
const AUTH_PASS      = process.env.DASHBOARD_PASS || "";

const INDEX_HTML    = path.join(__dirname, "public/index.html");

// ── Basic auth ────────────────────────────────────────────────────────────────
function checkAuth(req, res) {
  if (!AUTH_USER || !AUTH_PASS) return true; // auth disabled
  const header = req.headers.authorization || "";
  const token  = header.replace(/^Basic\s/, "");
  const [u, p] = Buffer.from(token, "base64").toString().split(":");
  if (u === AUTH_USER && p === AUTH_PASS) return true;
  res.writeHead(401, { "WWW-Authenticate": 'Basic realm="Mission Control"' });
  res.end("Unauthorized");
  return false;
}

// ── Response helpers ──────────────────────────────────────────────────────────
function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (!checkAuth(req, res)) return;

  const url = req.url.split("?")[0];

  // Dashboard UI
  if (url === "/" || url === "/index.html") {
    return serveFile(res, INDEX_HTML, "text/html");
  }

  // API routes
  if (url === "/api/status") {
    const openclaw = getOpenClaw(OPENCLAW_JSON, MEMORY_DIR);
    return json(res, {
      openclaw,
      sessions: getSessions(SESSIONS_FILE),
      system:   getSystem(),
      tokens:   getTokens(),
      ts:       new Date().toISOString(),
    });
  }

  if (url === "/api/logs") {
    return json(res, { logs: getLogs(LOG_FILE, 100) });
  }

  if (url === "/api/health") {
    return json(res, { status: "ok", uptime: process.uptime(), port: PORT });
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`[Mission Control] Dashboard running on http://localhost:${PORT}`);
  console.log(`[Mission Control] Log file:      ${LOG_FILE}`);
  console.log(`[Mission Control] Sessions file: ${SESSIONS_FILE}`);
  console.log(`[Mission Control] OpenClaw file: ${OPENCLAW_JSON}`);
  console.log(`[Mission Control] Memory dir:    ${MEMORY_DIR}`);
  if (AUTH_USER) console.log(`[Mission Control] Basic auth enabled for user: ${AUTH_USER}`);
});

server.on("error", e => console.error("[Mission Control] Server error:", e.message));
