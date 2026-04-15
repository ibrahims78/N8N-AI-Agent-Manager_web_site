# N8N AI Agent Manager — Workspace

## Project Overview

N8N AI Agent Manager هو تطبيق ويب احترافي لإدارة سير عمل n8n عبر محادثة ذكاء اصطناعي بالعربية/الإنجليزية.
يستخدم GPT-4o + Gemini 2.5 Pro في خط أنابيب تحسين تسلسلي من 4 مراحل.

## Architecture

```
/
├── artifacts/
│   ├── api-server/          — Express 5 API (port 8080)
│   ├── n8n-manager/         — React + Vite frontend (port 18898)
│   └── mockup-sandbox/      — Component preview server
├── lib/
│   ├── db/                  — Drizzle ORM schema + migrations
│   ├── api-spec/            — OpenAPI spec + codegen
│   └── api-client-react/    — Auto-generated React Query hooks
└── attached_assets/BUILD_PLAN.md — Master spec (8 phases)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: v24
- **Language**: TypeScript 5.9
- **API**: Express 5 + JWT auth (HS256)
- **DB**: PostgreSQL + Drizzle ORM
- **Frontend**: React 18 + Vite 7 + Tailwind CSS
- **i18n**: i18next (Arabic RTL + English LTR)
- **State**: Zustand + React Query v5
- **Encryption**: AES-256-CBC for API keys
- **Security**: Helmet.js, rate limiting (express-rate-limit), bcryptjs
- **Fonts**: IBM Plex Arabic (Google Fonts)
- **AI**: GPT-4o (OpenAI) + Gemini 2.5 Pro (Google)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Key Commands

```bash
# DB push
pnpm --filter @workspace/db run push

# API Server (dev)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Frontend (dev)
PORT=18898 BASE_PATH=/ pnpm --filter @workspace/n8n-manager run dev

# Codegen
pnpm --filter @workspace/api-spec run codegen

# Full build
pnpm run build
```

## Default Credentials

- **Username**: `admin`
- **Password**: `123456`
- **Note**: Admin user is auto-created on startup if no admin role exists in the database

## Key Implementation Notes

- JWT Access Token stored in `localStorage` as `accessToken`; refresh token in HttpOnly cookie
- Admin role bypasses ALL permission checks
- n8n API keys encrypted with AES-256-CBC; encryption key from `ENCRYPTION_KEY` env var
- Workflows list now uses real n8n execution data (not Math.random placeholders)
- Workflow import auto-saves version 1 to `workflow_versions` table
- History page supports JSON export (download) and PDF export (window.print())
- Chat page supports replay from history (via sessionStorage key `chatReplay`)
- Sequential engine: 4 phases → GPT-4o build → Gemini review → GPT-4o refine → Gemini validate
- SSE streaming endpoint: `POST /api/chat/conversations/:id/generate`
- Rate limits: login 10/min, chat 30/min, settings 20/min

## API Endpoints (Key)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (db status) |
| POST | `/api/auth/login` | Login → accessToken |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/workflows` | List n8n workflows (real execution stats) |
| GET | `/api/workflows/:id` | Get workflow detail (real stats) |
| GET | `/api/workflows/:id/executions` | Execution history |
| GET | `/api/workflows/:id/versions` | Version history |
| POST | `/api/workflows/:id/restore/:versionId` | Restore a version |
| POST | `/api/workflows/:id/activate` | Activate workflow |
| POST | `/api/workflows/:id/deactivate` | Deactivate workflow |
| POST | `/api/workflows/bulk-action` | Bulk activate/deactivate/delete |
| POST | `/api/workflows/import` | Import AI-generated workflow (auto-saves v1) |
| GET | `/api/templates` | List templates (filter by category/search) |
| POST | `/api/templates` | Create new template (requires manage_workflows) |
| POST | `/api/templates/:id/rate` | Rate a template 1-5 (updates avgRating + ratingCount) |
| POST | `/api/templates/:id/use` | Use template → opens chat |
| DELETE | `/api/templates/:id` | Delete template (admin only) |
| GET | `/api/users` | List users (admin only) |
| POST | `/api/users` | Create user (admin only) |
| PUT | `/api/users/:id/permissions` | Update 10 permissions |
| POST | `/api/users/:id/reset-password` | Reset user password |
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/chat/conversations` | New conversation |
| POST | `/api/chat/conversations/:id/generate` | SSE stream AI generation |
| POST | `/api/chat/conversations/:id/analyze-workflow` | SSE stream workflow analysis (3-phase) |
| POST | `/api/workflows/:id/apply-fix` | Apply AI-generated fix JSON to n8n |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |
| GET | `/api/settings/n8n` | Get n8n config |
| PUT | `/api/settings/n8n` | Save n8n config (encrypted) |
| POST | `/api/settings/n8n/test` | Test n8n connection |
| POST | `/api/settings/openai/test` | Test OpenAI key |
| POST | `/api/settings/gemini/test` | Test Gemini key |
| DELETE | `/api/settings/danger/conversations` | Delete all conversations |
| DELETE | `/api/settings/danger/versions` | Delete all versions |
| POST | `/api/settings/danger/factory-reset` | Factory reset |

## Frontend Routes

| Path | Page |
|------|------|
| `/login` | Login page |
| `/change-password` | Force password change |
| `/onboarding` | Setup wizard (n8n + AI keys) |
| `/` | Dashboard (KPI + charts + heatmap + live feed) |
| `/dashboard` | Dashboard (alias) |
| `/workflows` | Workflow list (card/list view, bulk actions) |
| `/workflows/:id` | Workflow detail (executions + versions tabs) |
| `/chat` | AI chat with 4-phase SSE streaming |
| `/templates` | Templates library with preview |
| `/history` | Chat history (JSON/PDF export, replay) |
| `/users` | User management (admin only) |
| `/settings` | App settings + API keys + danger zone |

## Build Plan Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project bootstrap + health | ✅ Complete |
| 1 | Auth + Permissions + Onboarding | ✅ Complete |
| 2 | n8n Adapter + Workflows CRUD | ✅ Complete |
| 3 | 4-phase AI pipeline + Chat SSE | ✅ Complete |
| 4 | Dashboard (KPI, charts, heatmap, AI insight) | ✅ Complete |
| 5 | Templates + History | ✅ Complete |
| 6 | Users (10 permissions) + Settings (danger zone) | ✅ Complete |
| 7 | Security (Helmet, rate limiting, AES-256) + i18n | ✅ Complete |
| 8 | Real execution stats + PDF export + version auto-save | ✅ Complete |
| 9 | Template rating (⭐ interactive stars) + Save workflow as template + code audit fixes | ✅ Complete |
| 10 | Workflow Analysis feature (3-phase AI pipeline: analyze → validate → fix) | ✅ Complete |

## Code Fixes (v9 Audit)

- **templates.routes.ts**: Added try-catch to all routes, added POST `/templates` (create) + POST `/:id/rate` + DELETE `/:id` endpoints
- **workflows.routes.ts**: Fixed dynamic `import()` → static import for `importWorkflow`
- **templates.ts (schema)**: Added `ratingCount: integer` column (DB migration applied)
- **templates.tsx**: Added interactive 5-star rating UI, null-safe `(avgRating ?? 0).toFixed(1)`, AnimatePresence on modals, "New Template" button
- **workflows.tsx**: Added `BookmarkPlus` "Save as Template" button with confirmation modal on all views
- **chat.tsx**: Removed dead code (duplicate `message !== undefined` branch), added proper error handling for SSE error events

## Code Fixes (v10 Comprehensive Audit — 16 Issues)

### Critical Fixes
- **vite.config.ts**: Removed broken `@assets` alias pointing to deleted `attached_assets/` folder
- **layout/ directory**: Deleted 3 dead layout components (`AppLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx`) — never used by App.tsx
- **auth.routes.ts**: Removed unused `sql` import from drizzle-orm; added try-catch around DB query in login endpoint
- **chat.routes.ts**: Added `isNaN()` guards for `convId` in GET, DELETE, POST `/generate`, POST `/messages` endpoints

### Medium Fixes
- **lib/auditLog.ts**: Extracted shared `logAudit()` helper — was duplicated identically in `auth.routes.ts` and `users.routes.ts`
- **auth.routes.ts + users.routes.ts**: Both now import from `lib/auditLog.ts`
- **routes/index.ts**: Removed duplicate `dashboardRouter` registered on both `/dashboard` AND `/v1/dashboard`
- **chat.routes.ts**: Fixed `tokensUsed: undefined` → `tokensUsed: number | null = null` (explicit `?? null` on all assignments)
- **dashboard.routes.ts**: Removed unused `_period` variable from `top-workflows` endpoint
- **app.ts**: Added global Express error handler middleware (catches uncaught route errors → returns JSON)
- **auth.middleware.ts**: Added `.limit(50)` to `requirePermission` DB query (bounded fetch instead of unbounded)
