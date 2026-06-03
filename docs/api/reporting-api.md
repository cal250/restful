# Reporting API

Base path: `/api/v1/reports`. All routes require an ADMIN bearer JWT.

| Method | URL | Purpose |
|---|---|---|
| GET | `/` | Return live inventory, inspection, compliance, and maintenance metrics |
| GET | `/export.csv` | Download report metrics as CSV |
| GET | `/export.pdf` | Download report metrics as PDF |

Inventory includes total, daily, monthly, and yearly registration counts.
Compliance includes expired, upcoming 30-day expirations, compliant count, and
compliance percentage. Maintenance includes total frequency and recent records.
