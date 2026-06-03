# AGENT.md — Fire Extinguisher Management System

> Rules for the AI/developer building this project.
> Read this file before writing or changing any code.

---

## 1. Project Mindset

Build this project like a real company system, not a simple school CRUD app.

The system must be:

- Easy to understand
- Easy to maintain
- Secure
- Well documented
- Split into clean services
- Tested before handover

Always choose clear code over clever code.

---

## 2. Main Rule

Before implementing any feature:

1. Read `AGENT.md`
2. Read `DESIGN.md`
3. Understand the feature
4. Check the correct service
5. Write clean code
6. Add validation
7. Add tests
8. Update API documentation

Do not start coding without checking the design rules first.

---

## 3. Code Style Rules

Keep code small and readable.

| Item | Rule |
|---|---|
| Function | Maximum 20 lines |
| File | Target below 80 lines, maximum 200 lines |
| Parameters | Maximum 3 parameters |
| Nesting | Maximum 3 levels |
| Comments | Explain why, not obvious code |

Every file must have one clear responsibility.

Bad:

```text
user-helper-service-manager.java
```

Good:

```text
user-service.java
password-hasher.java
jwt-token-provider.java
```

---

## 4. Architecture Rules

Use layered architecture inside every microservice.

```text
controller -> service -> repository -> database
```

### Controller

Responsible for:

- Receiving HTTP requests
- Calling the service
- Returning responses

Must not:

- Contain business logic
- Query the database directly
- Handle password hashing directly

### Service

Responsible for:

- Business logic
- Validation decisions
- Calling repositories
- Calling other services when needed

Must not:

- Know about HTTP request/response objects

### Repository

Responsible for:

- Database operations only

Must not:

- Contain business rules

---

## 5. Microservice Rules

Each service owns its own responsibility.

Do not put everything inside one service.

Services:

1. Auth Service
2. User Service
3. Fire Extinguisher Service
4. Inspection Service
5. Maintenance Service
6. Reporting Service
7. Notification Service

Each service must have its own:

- Controllers
- Services
- Repositories
- DTOs
- Entities
- Validation
- Swagger documentation
- Tests

---

## 6. Security Rules

Security is required from the beginning.

Always:

- Hash passwords before saving
- Use JWT for authentication
- Use role-based authorization
- Validate all input
- Hide internal errors from users
- Store secrets in environment variables
- Never hardcode database passwords or JWT secrets

Roles:

```text
ADMIN
INSPECTOR
USER
```

Authorization examples:

| Feature | Allowed Role |
|---|---|
| Manage users | ADMIN |
| Register extinguishers | ADMIN |
| Schedule inspection | ADMIN, INSPECTOR, USER |
| Complete inspection | INSPECTOR |
| View reports | ADMIN |
| View own profile | ADMIN, INSPECTOR, USER |

---

## 7. API Documentation Rules

Every API must be documented using Swagger/OpenAPI.

For every endpoint include:

- Purpose
- URL
- HTTP method
- Required role
- Request body example
- Success response example
- Error response example
- Validation rules

Do not put all documentation in one huge page.

Use this structure:

```text
docs/
  api/
    auth-api.md
    user-api.md
    extinguisher-api.md
    inspection-api.md
    maintenance-api.md
    reporting-api.md
  database/
    erd.md
    schema.md
  deployment/
    docker-guide.md
  testing/
    postman-guide.md
```

---

## 8. Error Handling Rules

Use clear error responses.

Example:

```json
{
  "success": false,
  "message": "Email already exists",
  "code": "USER_EMAIL_EXISTS"
}
```

Do not expose stack traces to users.

Bad:

```text
org.postgresql.util.PSQLException...
```

Good:

```text
Could not create user. Email already exists.
```

---

## 9. Testing Rules

Every important feature needs tests.

Required tests:

- Unit tests for services
- Integration tests for APIs
- Repository/database tests
- Authentication and authorization tests

Minimum target: 80% coverage.

Test these especially:

- User registration
- Duplicate email prevention
- Login
- JWT validation
- Role permissions
- Fire extinguisher CRUD
- Inspection scheduling
- Maintenance logging
- Report generation

---

## 10. Documentation Before Handover

Before finishing, provide:

- Source code
- Swagger documentation
- ERD
- Database export
- Postman collection
- Test results
- Deployment guide
- User manual
- README file

---

## 11. Final Checklist

Before saying the project is complete, check:

- [ ] `AGENT.md` was followed
- [ ] `DESIGN.md` was followed
- [ ] No large messy files
- [ ] No business logic in controllers
- [ ] Passwords are hashed
- [ ] JWT authentication works
- [ ] RBAC works
- [ ] APIs are documented
- [ ] Database has constraints and indexes
- [ ] Tests are included
- [ ] Docker setup works
- [ ] Reports can export PDF and CSV

---

## One Rule to Remember

Write the project as if another developer must understand it quickly tomorrow.
