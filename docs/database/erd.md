# TZW Fire Extinguisher Management — Architecture Diagrams

Mermaid diagrams for deployment, application layers, API, frontend, auth, and the database.
Field definitions and constraints live in `backend/prisma/schema.prisma`.

---

## 1. Deployment & system context

```mermaid
flowchart TB
  User["Browser: Admin / Inspector / User"]

  subgraph Docker["Docker Compose"]
    FE["Frontend :5173 → nginx :80<br/>React + Vite SPA"]
    BE["Backend :3000<br/>Express REST API"]
    PG[(PostgreSQL 17<br/>host :5435)]
  end

  SMTP["Gmail SMTP<br/>OTP & password reset"]

  User --> FE
  FE -->|"REST JSON + Bearer JWT<br/>/api/v1"| BE
  User -->|optional| SW["Swagger /api/docs"]
  BE --> SW
  BE -->|Prisma| PG
  BE -->|email.service| SMTP
```

---

## 2. Monorepo layout

```mermaid
flowchart TB
  Root["tzw-fire-extinguisher-management-system<br/>npm workspaces"]

  Root --> FE["frontend/<br/>React, TypeScript, Vite, Tailwind"]
  Root --> BE["backend/<br/>Express, TypeScript, Prisma"]
  Root --> Docs["docs/ API, database, deployment"]
  Root --> DC["docker-compose.yml"]

  FE --> ApiLib["src/lib/api.ts"]
  FE --> Pages["src/pages/"]
  FE --> Comp["src/components/"]
  FE --> AuthCtx["src/auth/AuthContext.tsx"]

  BE --> App["src/app.ts"]
  BE --> Mod["src/modules/"]
  BE --> Common["src/common/"]
  BE --> Prisma["prisma/schema.prisma"]

  ApiLib -->|"HTTP"| App
  Prisma --> PG[(PostgreSQL)]
  DC --> FE & BE & PG
```

---

## 3. Backend request flow (modular monolith)

```mermaid
flowchart LR
  Client["HTTP Client / SPA"]

  subgraph Express["Express app.ts"]
    CORS["cors"]
    JSON["express.json"]
    Routes["/api/v1/* routes"]
    EH["error-handler"]
    NF["not-found"]
  end

  subgraph Module["Domain module"]
    Val["Zod validation"]
    Auth["authenticate + authorize"]
    Ctrl["controller"]
    Svc["service"]
    Repo["repository"]
  end

  Prisma["Prisma Client"]
  DB[(PostgreSQL)]

  Client --> CORS --> JSON --> Routes
  Routes --> Val --> Auth --> Ctrl --> Svc --> Repo --> Prisma --> DB
  Routes -.-> EH & NF
```

---

## 4. API modules & routes

```mermaid
flowchart TB
  API["Express Application"]

  API --> A1["/api/v1/auth<br/>register, verify-otp, resend-otp,<br/>login, logout, forgot/reset password"]
  API --> A2["/api/v1/users"]
  API --> A3["/api/v1/extinguishers"]
  API --> A4["/api/v1/inspections"]
  API --> A5["/api/v1/maintenance"]
  API --> A6["/api/v1/reports<br/>dashboard, export.csv, export.pdf"]
  API --> A7["/api/v1/notifications"]
  API --> DOC["/api/docs OpenAPI + Swagger UI"]
  API --> H["/health"]

  subgraph Protected["JWT + role on most routes"]
    A2 & A3 & A4 & A5 & A6 & A7
  end
```

---

## 5. Backend folder structure

```mermaid
flowchart TB
  subgraph backend["backend/src"]
    config["config/<br/>env.ts, prisma.ts"]
    common["common/<br/>middleware, errors, http, email"]
    docs["docs/openapi.ts"]
    server["server.ts"]

    subgraph modules["modules/"]
      auth["auth/ routes, controller, service,<br/>repository, middleware, validation"]
      users["users/"]
      ext["extinguishers/"]
      insp["inspections/"]
      maint["maintenance/"]
      rep["reports/ + csv/pdf export"]
      notif["notifications/"]
    end

    app["app.ts"]
  end

  subgraph prisma["backend/prisma"]
    schema["schema.prisma"]
    mig["migrations/"]
    seed["seed.ts"]
  end

  app --> modules
  modules --> config
  modules --> common
  config --> prisma
```

---

## 6. Entity relationship diagram (database)

```mermaid
erDiagram
  USER ||--o{ SESSION : has
  USER ||--o{ PASSWORD_RESET_TOKEN : has
  USER ||--o{ FIRE_EXTINGUISHER : registers
  USER ||--o{ INSPECTION : schedules
  USER ||--o{ MAINTENANCE_RECORD : records
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ AUDIT_LOG : creates
  FIRE_EXTINGUISHER ||--o{ INSPECTION : receives
  FIRE_EXTINGUISHER ||--o{ MAINTENANCE_RECORD : receives

  USER {
    uuid id PK
    string email UK
    string passwordHash
    enum role
    boolean isActive
  }
  SESSION {
    uuid id PK
    string tokenId UK
    datetime expiresAt
    datetime revokedAt
  }
  PASSWORD_RESET_TOKEN {
    uuid id PK
    string tokenHash UK
    datetime expiresAt
  }
  REGISTRATION_OTP {
    uuid id PK
    string email UK
    string otp
    datetime expiresAt
  }
  FIRE_EXTINGUISHER {
    uuid id PK
    string serialNumber UK
    enum type
    enum status
    datetime expiryDate
  }
  INSPECTION {
    uuid id PK
    enum status
    datetime inspectionDate
  }
  MAINTENANCE_RECORD {
    uuid id PK
    string actionTaken
    datetime maintenanceDate
  }
  NOTIFICATION {
    uuid id PK
    string title
    datetime readAt
  }
  AUDIT_LOG {
    uuid id PK
    string action
    json metadata
  }
```

`RegistrationOtp` is a standalone pending-signup table (no FK to `User` until verification completes).

---

## 7. Auth sequence

```mermaid
sequenceDiagram
  participant SPA as React SPA
  participant API as Auth API
  participant JWT as token.service
  participant DB as Prisma / PostgreSQL
  participant Mail as email.service

  SPA->>API: POST /auth/register
  API->>DB: RegistrationOtp
  API->>Mail: send OTP
  SPA->>API: POST /auth/verify-registration-otp
  API->>DB: User + Session
  API->>JWT: sign token (jti)
  API-->>SPA: user + Bearer token

  SPA->>API: POST /auth/login
  API->>DB: Session
  API-->>SPA: user + token

  SPA->>API: GET /api/v1/* (Authorization Bearer)
  API->>JWT: verify jti
  API->>DB: active Session
  API-->>SPA: JSON data envelope

  SPA->>API: POST /auth/logout
  API->>DB: revoke Session
```

---

## 8. Frontend routes & structure

```mermaid
flowchart TB
  main["main.tsx<br/>BrowserRouter + QueryClient + AuthProvider"]

  subgraph Public["No user"]
    login["/login"]
    reg["/register"]
    regv["/register/verify"]
    forgot["/forgot-password"]
    reset["/reset-password"]
  end

  subgraph AppShell["Authenticated AppShell"]
    dash["/ Dashboard"]
    ext["/extinguishers"]
    insp["/inspections"]
    maint["/maintenance<br/>not USER"]
    reports["/reports"]
    users["/users<br/>ADMIN only"]
    notif["/notifications"]
    profile["/profile"]
  end

  lib["lib/api.ts → localhost:3000/api/v1"]

  main --> Public
  main --> AppShell
  Public --> lib
  AppShell --> lib
```

---

## 9. Role-based access

```mermaid
flowchart LR
  subgraph Roles
    ADMIN
    INSPECTOR
    USER
  end

  ADMIN --> U1[Manage users]
  ADMIN --> E1[CRUD extinguishers]
  ADMIN --> I1[Inspections full]
  ADMIN --> M1[Maintenance]
  ADMIN --> R1[Reports & exports]

  INSPECTOR --> I2[Schedule & complete inspections]
  INSPECTOR --> M2[Maintenance]
  INSPECTOR --> D2[Dashboard]

  USER --> I3[Schedule inspections]
  USER --> D3[Dashboard view]

  BE["Backend: authorize(Role)"]
  FE["Frontend: App.tsx + AppShell nav"]

  Roles --> BE & FE
```

---

## 10. End-to-end data flow

```mermaid
flowchart LR
  A[React Pages] --> B[lib/api.ts]
  B --> C["/api/v1 routes"]
  C --> D[Controller]
  D --> E[Service]
  E --> F[Repository]
  F --> G[Prisma]
  G --> H[(PostgreSQL)]
```
