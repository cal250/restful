# Fire Extinguisher API

Base path: `/api/v1/extinguishers`. All routes require a bearer JWT.

| Method | URL | Role | Purpose |
|---|---|---|---|
| GET | `/` | Any | Search and filter inventory |
| GET | `/:id` | Any | View extinguisher details |
| POST | `/` | ADMIN | Register an extinguisher |
| PATCH | `/:id` | ADMIN | Update an extinguisher |
| DELETE | `/:id` | ADMIN | Delete an extinguisher |

List filters: `search`, `status`, and `type`. Serial number, location, type, size,
installation date, expiry date, and status are required when creating a record.
Expiry date must be after installation date and serial numbers must be unique.

Errors include `EXTINGUISHER_NOT_FOUND`, `SERIAL_NUMBER_EXISTS`,
`INVALID_DATE_RANGE`, `VALIDATION_ERROR`, and `FORBIDDEN`.
