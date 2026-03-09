# Repository Guidelines

## Project Structure & Module Organization
`server.js` is the entry point for the HTTP API and static dashboard. Runtime integrations live in `adapters/` (`pm2.js`, `tmux.js`, `logs.js`, `tokens.js`, `system.js`), each exporting a single data-source function. The frontend is a no-build dashboard in `public/index.html`. Operational docs live in `docs/`, and PM2 deployment settings are in `ecosystem.config.js`.

## Build, Test, and Development Commands
Use Node 18+.

- `npm install`: install runtime dependencies before first run.
- `npm run dev`: start the server with `node --watch server.js` for local iteration.
- `npm start`: run the production server locally.
- `npm run pm2:start`: launch the dashboard under PM2 using `ecosystem.config.js`.
- `npm run pm2:stop`: stop the PM2 app named `mission-control`.
- `npm run pm2:logs`: stream PM2 logs for the deployed dashboard.

There is no frontend build step; the UI is served directly from `public/index.html`.

## Coding Style & Naming Conventions
Follow the existing CommonJS style: `"use strict"`, `require(...)`, and `module.exports`. Use 2-space indentation and semicolons. Prefer small adapter modules with one clear responsibility. Use descriptive camelCase for functions (`getPM2Status`) and UPPER_SNAKE_CASE for environment-backed constants (`DASHBOARD_PORT`, `LOG_FILE`). Keep route handlers and adapter return shapes straightforward JSON.

## Testing Guidelines
No automated test suite is configured yet. Validate changes by running `npm run dev`, opening `/api/health`, `/api/status`, and `/api/logs`, and confirming the dashboard renders in a browser. When changing an adapter, test both the happy path and missing-data behavior; current modules generally fall back to empty arrays or safe defaults instead of throwing.

## Commit & Pull Request Guidelines
The current history uses Conventional Commit style, for example: `feat: initial release`. Continue with prefixes such as `feat:`, `fix:`, and `docs:`. Keep commits focused and scoped to one change. PRs should include a short description, any config or environment variable changes, manual verification steps, and screenshots when `public/index.html` changes.

## Security & Configuration Tips
Do not commit real `.env` values or machine-specific paths. If exposing the dashboard outside localhost, configure `DASHBOARD_USER` and `DASHBOARD_PASS` or restrict access at the firewall or reverse proxy layer.
