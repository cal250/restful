# Docker Deployment Guide

PostgreSQL is exposed on host port `5435`, never `5432`.

1. Copy `.env.example` to `.env`.
2. Replace `POSTGRES_PASSWORD` and `JWT_SECRET`.
3. Run `docker compose up -d postgres`.
4. Run `docker compose run --rm backend npm run prisma:deploy --workspace backend`.
5. Run `docker compose run --rm backend npm run prisma:seed --workspace backend`.
6. Run `docker compose up -d`.

The frontend is available at `http://localhost:5173`, the backend at
`http://localhost:3000`, and Swagger UI at `http://localhost:3000/api/docs`.
