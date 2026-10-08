# Agency Management System — Frontend (React)

Vite + React + TypeScript + MUI. Technical foundation only (Sprint 0).

## Setup

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Vite dev server with HMR       |
| `npm run build`   | Type-check + production build  |
| `npm run preview` | Preview the production build   |
| `npm test`        | Unit tests (Vitest)            |

## Architecture

```text
Pages → Components → Feature Services / Redux → Core API → Backend REST API
```

- `src/app/` — store, router, providers (global wiring)
- `src/core/` — API client, theme, hooks, utils, types (shared infra)
- `src/features/*/` — one folder per business domain (auth, users, …)
- `src/shared/` — reusable components/layouts
