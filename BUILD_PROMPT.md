# BUILD_PROMPT.md — Prompt to Build the Project

Copy and paste this prompt into your AI coding tool.

---

```text
You are a senior full-stack developer and software architect.

I need you to build a Fire Extinguisher Management System for TZW LTD.

This is not a simple CRUD app. Build it as a clean RESTful microservices-based system.

Before doing anything, read these files:

1. AGENT.md
2. DESIGN.md

You must follow both files during the whole project.

==================================================
PROJECT GOAL
==================================================

Build a system that helps TZW LTD manage fire extinguishers, inspections, maintenance activities, compliance tracking, notifications, and reports.

The system must support:

- User registration
- Login and logout
- JWT authentication
- Role-based access control
- Fire extinguisher registration
- Fire extinguisher listing and details
- Fire extinguisher updates and deletion
- Inspection scheduling
- Inspection completion
- Maintenance logging
- Compliance monitoring
- Real-time reports
- PDF report export
- CSV report export
- Email notifications
- Swagger API documentation
- Docker deployment

==================================================
USER ROLES
==================================================

Use these roles:

ADMIN:
- Manage users
- Manage fire extinguishers
- View reports
- Manage system data

INSPECTOR:
- Conduct inspections
- Complete inspection records
- Log maintenance activities
- View assigned work

USER:
- View extinguisher status
- Schedule inspections
- View inspection history

==================================================
TECH STACK
==================================================

Backend:
- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- Swagger/OpenAPI

Microservices:
- Spring Cloud Gateway
- Eureka Server
- RabbitMQ for async notifications

Frontend:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Hugeicons
- Sonner toasts

Deployment:
- Docker
- Docker Compose

Testing:
- JUnit
- Mockito
- Postman collection

==================================================
MICROSERVICES TO CREATE
==================================================

Create these services:

1. api-gateway
2. eureka-server
3. auth-service
4. user-service
5. extinguisher-service
6. inspection-service
7. maintenance-service
8. reporting-service
9. notification-service
10. frontend-web

Each backend service must have:

- controller layer
- service layer
- repository layer
- dto layer
- entity layer
- exception handling
- validation
- Swagger documentation
- tests

==================================================
IMPORTANT CODING RULES
==================================================

Follow these rules strictly:

- Keep files small and clear
- No function above 20 lines
- No file above 200 lines
- Controllers must not contain business logic
- Services contain business logic
- Repositories only access the database
- Use DTOs, not entities, in API requests and responses
- Validate every request
- Hash passwords before saving
- Use JWT for authentication
- Use RBAC for protected routes
- Use environment variables for secrets
- Add comments only for non-obvious logic
- Add one purpose comment at the top of each file

==================================================
API DOCUMENTATION RULES
==================================================

For every API endpoint, document:

- Purpose
- HTTP method
- URL
- Required role
- Request body example
- Success response example
- Error response example
- Validation rules

Generate Swagger/OpenAPI documentation for every service.

Also create markdown API docs inside:

/docs/api/

Do not put all endpoints in one messy file.

==================================================
DATABASE RULES
==================================================

Create a clean PostgreSQL database design.

Include:

- users
- roles
- user_roles
- fire_extinguishers
- inspections
- maintenance_records
- notifications
- audit_logs

Add:

- primary keys
- foreign keys
- unique constraints
- indexes
- validation constraints

Generate:

- ERD
- schema.sql
- backup/export script

==================================================
FRONTEND RULES
==================================================

Create a modern dashboard UI.

Pages:

- Login
- Register
- Dashboard
- Fire extinguisher list
- Fire extinguisher details
- Add/Edit extinguisher
- Schedule inspection
- Maintenance log
- Reports
- User profile
- Admin users

UI rules:

- Use Poppins font
- Use Tailwind CSS
- Use shadcn/ui components
- Use Hugeicons only
- Use Sonner toasts for success/error actions
- Use skeleton loaders while fetching data
- Use clickable breadcrumbs in dashboard routes
- Make the UI responsive on mobile, tablet, and desktop

==================================================
REPORTING RULES
==================================================

Implement reports for:

Inventory:
- Total extinguishers
- Daily summary
- Monthly summary
- Yearly summary

Inspections:
- Pending inspections
- Completed inspections
- Overdue inspections

Compliance:
- Expired extinguishers
- Upcoming expirations
- Compliance status

Maintenance:
- Maintenance history
- Maintenance frequency
- Recent maintenance activities

Exports:
- PDF
- CSV

==================================================
STEP-BY-STEP BUILD ORDER
==================================================

Build in this order:

1. Create project structure
2. Create AGENT.md and DESIGN.md inside the repo
3. Create Eureka server
4. Create API Gateway
5. Create Auth Service
6. Create User Service
7. Create Fire Extinguisher Service
8. Create Inspection Service
9. Create Maintenance Service
10. Create Reporting Service
11. Create Notification Service
12. Create frontend app
13. Connect frontend to backend
14. Add Swagger docs
15. Add tests
16. Add Docker Compose
17. Add database export
18. Add user manual and deployment guide

Do not skip documentation or tests.

==================================================
FINAL OUTPUT REQUIRED
==================================================

At the end, provide:

- Complete source code
- Swagger links
- ERD
- schema.sql
- database backup/export
- Postman collection
- Docker Compose file
- test results
- deployment guide
- user manual
- README.md

Start by creating the folder structure and explaining what each service will do.
```
