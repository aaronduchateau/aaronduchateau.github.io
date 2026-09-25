---
name: preview-static-portfolio
description: >-
  Build and serve this Next.js static-export portfolio locally via npm run
  preview:static. Use when the user asks to run, serve, preview, or open the
  site locally; when localhost is not loading; after UI or public/ changes; or
  to match GitHub Pages static hosting. Do not use next start (output export).
---

# Preview static portfolio

This repo (`aaron_portfolio_2026`) is a **static export** (`output: "export"`). Production preview serves the `out/` folder, not `next start`.

## Quick serve (preferred)

From the **project root** (`aaron_portfolio_2026/`):

```bash
./.cursor/skills/preview-static-portfolio/scripts/preview.sh
```

The script: uses nvm (`.nvmrc` → Node 20), frees port 3000, runs `npm run build`, then `npm run preview:static` in the background, and curls until HTTP 200.

Tell the user: **http://localhost:3000**

## Manual steps (if script unavailable)

1. **Node**: Require **≥ 18.17** (project uses **20** via `.nvmrc`):

   ```bash
   export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
   cd aaron_portfolio_2026   # repo root
   nvm use
   ```

2. **Stop stale servers** on port 3000 (and 53937 if a prior `serve` picked a random port):

   ```bash
   kill $(lsof -i :3000 -t 2>/dev/null) 2>/dev/null
   ```

3. **Build** (required after source / `public/` / config changes):

   ```bash
   npm run build
   ```

4. **Serve** — use the npm script, not raw `npx serve` unless pinning a port:

   ```bash
   npm run preview:static
   ```

   Equivalent: `npx serve out` (default port 3000).

5. **Run in background** when the agent starts the server; keep the process alive for the user.

6. **Verify**:

   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   ```

   Expect `200`. If the browser shows a stale page, suggest hard refresh (Cmd+Shift+R).

## Do not use

| Command | Why |
|---------|-----|
| `npm run start` / `next start` | Fails: `output: export` — use static preview instead |
| `npm run dev` only | Dev server; fine for hot reload, but user asked for **built** preview → build + `preview:static` |

Use `npm run dev` only when the user explicitly wants live editing without a static export check.

## Dependencies

If `node_modules` is missing: `npm install` (after `nvm use`).

## Troubleshooting

- **Node too old** (e.g. 18.12): `nvm install` / `nvm use` per `.nvmrc`.
- **Port in use**: kill listeners on 3000, then rerun preview.
- **Blank or old UI**: rebuild, restart preview, hard-refresh browser.
- **Multiple serve processes**: kill all `serve` / port 3000 listeners before starting one preview.

## Relation to other project rules

After UI changes, still satisfy `.cursor/rules/verify-build-before-resting.mdc` (build + preview before resting). This skill is the canonical **how** for the preview step.
