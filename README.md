# TZW Fire Extinguisher Management System

A modular monolith for managing fire extinguishers, inspections, maintenance,
compliance, reports, and notifications.

## Phase 1

Phase 1 provides:

- Node.js, Express, TypeScript backend foundation
- PostgreSQL in Docker on host port `5435`
- Prisma schema and seed data
- JWT authentication and role-based authorization
- Register, login, logout, forgot-password, and reset-password endpoints
- Swagger/OpenAPI documentation
- Unit and integration test foundations

## Quick Start

1. Copy `.env.example` to `.env` and replace the secrets.
2. Start PostgreSQL: `docker compose up -d postgres`
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run prisma:generate --workspace backend`
5. Apply migrations: `npm run prisma:migrate --workspace backend`
6. Seed the database: `npm run prisma:seed --workspace backend`
7. Start the API: `npm run dev:backend`

Swagger UI is available at `http://localhost:3000/api/docs`.

The seed creates `admin@tzwltd.com` with password `ChangeMe123!`. Change this
password immediately outside local development.

## Prisma Studio

Run Studio locally with:

```text
npm run prisma:studio --workspace backend
```

Local tools connect to PostgreSQL through `localhost:5435`. Containers connect
to the same database through `postgres:5432`. If port `5555` is already in use,
pass another port, for example `-- --port 5556`.
