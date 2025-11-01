# Auto-Generated CRUD + RBAC Platform

## Overview
This project contains a backend (Express + TypeScript + Prisma) and a minimal Next.js frontend for an admin UI.

## Quick start (backend)
1. Install dependencies:
   ```
   cd backend
   npm install
   ```
2. Set up your Postgres and .env (copy .env.example -> .env)
3. Run Prisma migrate:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start the backend:
   ```
   npm run dev
   ```
Backend default: http://localhost:4000

## Quick start (frontend)
1. Install dependencies:
   ```
   cd frontend
   npm install
   npm run dev
   ```
2. Open http://localhost:3000

## Seeded users
- admin@example.com / pass  (Admin)
- manager@example.com / pass (Manager)
- viewer@example.com / pass (Viewer)

## Notes
- Models created via the admin UI are written to `/models/<Model>.json` when published.
- Dynamic CRUD endpoints are registered at `/api/<modelname>`.
- RBAC is enforced per-model using the `rbac` object in model JSON.
