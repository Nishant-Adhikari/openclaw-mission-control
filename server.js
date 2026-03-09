/**
 * OpenClaw Mission Control — Server
 * Thin HTTP server wiring modular adapters to JSON API + static dashboard
 *
 * Routes:
 *   GET /             → dashboard UI (public/index.html)
 *   GET /api/status   → PM2, sessions, system, tokens
 *   GET /api/logs     → recent agent log lines
 *   GET /api/health   → uptime check
 */

"use strict";

require("dotenv").config();

const http = require("http");
const fs   = require("fs");
const path = require("path");

// ── Adapters (swap any of these out for your own data source) ─────────────────
const getPM2      = require("./adapters/pm2");
const getSessions = require("./adapters/sessions");
const getLogs     = require("./adapters/logs");
const getSystem   = require("./adapters/system");
const getTokens   = require("./adapters/tokens");

// ── Config ────────────────────────────────────────────────────────────────────
const PORT          = parseInt(process.env.DASHBOARD_PORT   || "3457");
const TMUX_SOCK     = process.env.TMUX_SOCKET               || `${process.env.HOME}/.tmux/sock`;
const LOG_FILE      = process.env.LOG_FILE                  || path.join(__dirname, "../logs/activity.log");
const SESSIONS_FILE = process.env.SESSIONS_FILE             || path.join(__dirname, "../memory/sessions.json");
const TOKENS_FILE   = process.env.TOKENS_FILE               || path.join(__dirname, "../memory/tokens.json");
const AUTH_USER     = process.env.DASHBOARD_USER            || "";
const AUTH_PASS     = process.env.DASHBOARD_PASS            || "";

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
    return json(res, {
      pm2:      getPM2(),
      sessions: getSessions(SESSIONS_FILE, TMUX_SOCK),
      system:   getSystem(),
      tokens:   getTokens(TOKENS_FILE),
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
  console.log(`[Mission Control] Tokens file:   ${TOKENS_FILE}`);
  if (AUTH_USER) console.log(`[Mission Control] Basic auth enabled for user: ${AUTH_USER}`);
});

server.on("error", e => console.error("[Mission Control] Server error:", e.message));
