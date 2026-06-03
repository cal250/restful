# Database Schema

The canonical database definition is
`backend/prisma/schema.prisma`. SQL migrations are stored in
`backend/prisma/migrations`.

Phase 1 defines:

- `User`: account identity, profile, role, active status, and timestamps
- `Session`: JWT session identifiers, expiry, and revocation
- `PasswordResetToken`: hashed, expiring, single-use reset tokens
- `FireExtinguisher`: inventory identity, location, type, size, dates, and status
- `Inspection`: scheduled date/time, status, result, and notes
- `MaintenanceRecord`: actions, issues, recommendations, notes, and date
- `Notification`: user-facing messages and read status
- `AuditLog`: entity action history and optional metadata

Unique constraints protect user email addresses, extinguisher serial numbers,
session token identifiers, and password reset token hashes. Foreign keys and
query indexes are defined in the Prisma schema and generated migrations.
