# N8N AI Agent Manager — Workspace

## Project Overview

N8N AI Agent Manager هو تطبيق ويب احترافي لإدارة سير عمل n8n عبر محادثة ذكاء اصطناعي بالعربية/الإنجليزية.
يستخدم GPT-4.1 + Gemini 2.5 Pro في خط أنابيب تحسين تسلسلي من 4 مراحل.

## Architecture

```
/
├── artifacts/
│   ├── api-server/          — Express 5 API (port 8080)
│   ├── n8n-manager/         — React + Vite frontend (port 18898)
│   └── mockup-sandbox/      — Component preview server (port 8081)
├── lib/
│   └── db/                  — Drizzle ORM schema + migrations
└── BUILD_PLAN.md            — Master spec (8 phases)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: v24
- **Language**: TypeScript 5.9
- **API**: Express 5 + JWT auth (HS256)
- **DB**: PostgreSQL + Drizzle ORM
- **Frontend**: React 18 + Vite 7 + Tailwind CSS
- **i18n**: i18next (Arabic RTL + English)
- **State**: Zustand + React Query
- **Encryption**: AES-256-CBC for API keys

## Key Commands

```bash
# DB
pnpm --filter @workspace/db run push

# API Server
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/n8n-manager run dev

# Full build
pnpm run build

# Typecheck
pnpm run typecheck
```

## Default Credentials

- **Username**: `مدير`
- **Password**: `123456`
- **Note**: `force_password_change=true` — user must change password on first login

## API Endpoints (Key)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (db + redis status) |
| GET | `/api/v1/health` | Health check (alias) |
| GET | `/api/healthz` | Health check (alias) |
| POST | `/api/auth/login` | Login → returns `accessToken` |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/workflows` | List n8n workflows |
| GET | `/api/workflows/:id` | Get workflow detail |
| GET | `/api/workflows/:id/versions` | Get version history |
| POST | `/api/workflows/:id/restore/:versionId` | Restore a version |
| POST | `/api/workflows/:id/activate` | Activate workflow |
| POST | `/api/workflows/:id/deactivate` | Deactivate workflow |
| POST | `/api/workflows/bulk-action` | Bulk activate/deactivate |
| GET | `/api/templates` | List templates |
| GET | `/api/users` | List users (admin) |
| GET | `/api/chat/conversations` | Chat history |
| POST | `/api/chat/conversations` | New conversation |
| POST | `/api/chat/conversations/:id/messages` | Send message |
| GET | `/api/settings` | Get settings |
| POST | `/api/settings/n8n` | Save n8n config |
| POST | `/api/settings/test-n8n` | Test n8n connection |

## Frontend Routes

| Path | Page |
|------|------|
| `/` | Login |
| `/change-password` | Force password change |
| `/onboarding` | Setup wizard (n8n + AI keys) |
| `/dashboard` | Main dashboard |
| `/workflows` | Workflow list |
| `/workflows/:id` | Workflow detail (executions + versions) |
| `/chat` | AI chat |
| `/templates` | Templates library |
| `/history` | Chat history |
| `/users` | User management |
| `/settings` | App settings |

## Build Plan Progress

See `progress_tracker.md` for detailed status.

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project bootstrap + health | ✅ Complete |
| 1 | Auth + Onboarding | ✅ Complete |
| 2 | Workflows CRUD + AI pipeline | ✅ ~85% |
| 3 | Templates | 🔄 Partial |
| 4 | Analytics + History | 🔄 Partial |
| 5 | User management | 🔄 Partial |
| 6 | Settings + encryption | 🔄 Partial |
| 7 | Polish + i18n | 🔄 Partial |
| 8 | Tests + deployment | ⏳ Pending |
