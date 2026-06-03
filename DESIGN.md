# TZW Fire Extinguisher Management System Design

## Architecture

The application is a modular monolith: one Express backend, one PostgreSQL
database, and one REST API. Domain modules keep their own routes, controllers,
services, repositories, validation, and tests so they can be extracted later
without creating operational complexity today.

```text
frontend -> REST API -> module routes -> controller -> service -> repository -> Prisma -> PostgreSQL
```

Modules:

1. Authentication
2. Users
3. Fire Extinguishers
4. Inspections
5. Maintenance
6. Reports
7. Notifications

## Backend Structure

```text
backend/src/
  config/
  common/
  modules/
    auth/
    users/
    extinguishers/
    inspections/
    maintenance/
    reports/
    notifications/
```

Controllers handle HTTP concerns only. Services contain business rules.
Repositories contain Prisma database access only. Zod schemas validate every
external request. Modules may call another module's public service, but never
another module's repository.

## Database

PostgreSQL runs in Docker. The container listens on `5432`, but the host exposes
it only on `5435`. All application database access uses Prisma.

Key constraints and indexes:

- Unique indexes: `users(email)`, `fire_extinguishers(serial_number)`.
- Foreign keys for user, extinguisher, inspection, and maintenance ownership.
- Enum-backed roles and statuses.
- Query indexes for extinguisher status/expiry and inspection status/date.

## Security

- Passwords are hashed with bcrypt before storage.
- JWT access tokens contain only user identity and role.
- Protected routes validate JWTs and required roles.
- Secrets are supplied through environment variables.
- API errors never expose stack traces or database details.
- Password reset tokens are stored as hashes and expire after use.

## API

The REST API is served under `/api/v1`. Swagger UI is served at `/api/docs`.
Every endpoint documents its purpose, validation, examples, roles, and expected
errors.

## Frontend

The frontend is a React, TypeScript, and Vite single-page application using
TailwindCSS, shadcn/ui patterns, React Query, React Hook Form, and Zod.

Visual direction:

- Primary fire-safety red: `#c5281c`
- Dark navigation: `#17202a`
- Background: `#f5f7fa`
- White cards, subtle borders, restrained shadows, and 12-16px radii
- Status is communicated by both text and color
- Forms use visible labels and keyboard-accessible controls
- Tables scroll horizontally on narrow screens

## Roles

| Capability | ADMIN | INSPECTOR | USER |
|---|---:|---:|---:|
| Manage users | Yes | No | No |
| Manage extinguishers | Yes | No | No |
| Schedule inspections | Yes | Yes | Yes |
| Complete inspections | Yes | Yes | No |
| Log maintenance | Yes | Yes | No |
| View reports | Yes | No | No |

Each role has a distinct dashboard and navigation:

- `ADMIN`: system management, user accounts, inventory, reports, compliance, and data integrity
- `INSPECTOR`: inspection work, result logging, equipment review, and maintenance records
- `USER`: extinguisher status, inspection scheduling, and inspection history

## Delivery Phases

1. Project setup, Docker, PostgreSQL, Prisma, authentication
2. User management
3. Fire extinguisher management
4. Inspections
5. Maintenance
6. Reporting
7. Notifications
8. Testing, documentation, and deployment
