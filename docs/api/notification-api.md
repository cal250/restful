# Notification API

Base path: `/api/v1/notifications`. All routes require a bearer JWT.

| Method | URL | Role | Purpose |
|---|---|---|---|
| GET | `/` | Any | List the current user's notifications |
| POST | `/` | ADMIN | Create a notification for a user |
| PATCH | `/:id/read` | Any | Mark the current user's notification as read |

Inspection scheduling automatically creates a confirmation notification for the
scheduling user. Users cannot read or modify another user's notification.
