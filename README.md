# EduSphere – School ERP + CRM

## Overview

EduSphere is a modern, secure, responsive School ERP + CRM built with a **React + Vite + TypeScript** frontend and a **Node.js + Express + TypeScript** backend. It uses MongoDB Atlas for data persistence and follows a monorepo structure powered by npm workspaces.

## Development Setup

```powershell
# Install dependencies for the whole monorepo
npm install

# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Starts both frontend and backend in parallel |
| `dev:web` | Starts only the frontend |
| `dev:api` | Starts only the backend |
| `build` | Builds both apps for production |
| `lint` | Runs ESLint for both apps |
| `type-check` | Runs TypeScript type‑checking |
| `test` | Runs tests for both apps |

## Project Structure

```
edusphere/
├─ apps/
│  ├─ web/       # React + Vite frontend
│  └─ api/       # Express backend
├─ packages/
│  └─ shared/    # Shared TypeScript types & utilities
├─ .gitignore
├─ .env.example
├─ README.md
└─ package.json  # Workspace root
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Follow the lint, type‑check and test scripts before opening a PR

---

*Generated with Claude Code*