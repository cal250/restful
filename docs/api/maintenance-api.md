# Maintenance API

Base path: `/api/v1/maintenance`. All routes require a bearer JWT.

| Method | URL | Role | Purpose |
|---|---|---|---|
| GET | `/` | ADMIN, INSPECTOR | View maintenance history |
| GET | `/:id` | ADMIN, INSPECTOR | View a maintenance record |
| POST | `/` | ADMIN, INSPECTOR | Log maintenance |

Maintenance logging requires an extinguisher UUID, action taken, and maintenance
date. Issues, recommendations, and notes are optional. History can be filtered
by `extinguisherId`.
