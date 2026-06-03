# User API

Base path: `/api/v1/users`. All routes require a bearer JWT.

| Method | URL | Role | Purpose |
|---|---|---|---|
| GET | `/profile` | Any | View own safe profile |
| PATCH | `/profile` | Any | Update own first or last name |
| POST | `/profile/change-password` | Any | Change password after current-password verification |
| GET | `/` | ADMIN | List safe user profiles |
| GET | `/:id` | ADMIN | View a safe user profile |
| PATCH | `/:id` | ADMIN | Update name, role, or active status |
| DELETE | `/:id` | ADMIN | Delete another user |

Profile names must be 1-50 characters. User IDs must be UUIDs. Passwords must be
8-72 characters and include uppercase, lowercase, and numeric characters.

Errors use the standard `{ success, message, code }` response and include
`USER_NOT_FOUND`, `INVALID_CURRENT_PASSWORD`, `SELF_DELETE_FORBIDDEN`,
`VALIDATION_ERROR`, and `FORBIDDEN`.
