# Inspection API

Base path: `/api/v1/inspections`. All routes require a bearer JWT.

| Method | URL | Role | Purpose |
|---|---|---|---|
| GET | `/` | Any | List inspections and history |
| GET | `/:id` | Any | View inspection details |
| POST | `/` | Any | Schedule an inspection |
| PATCH | `/:id` | ADMIN, INSPECTOR | Update status, result, and notes |

Scheduling requires an extinguisher UUID, ISO date, and 24-hour `HH:mm` time.
Completing an inspection requires a result. Scheduled inspections with dates in
the past are marked overdue when the list is requested.
