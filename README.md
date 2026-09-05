# Secure API Gateway with Role-Based Access Control (RBAC) & Security Monitoring

A production-style cybersecurity reference implementation featuring an **API Gateway**, **Role-Based Access Control (RBAC)**, **JWT Authentication**, **Granular Authorization**, **Rate Limiting**, **Audit Logging**, and a **Real-Time Security Dashboard**.

---

## 🏛️ System Architecture

```
[ Client: React Dashboard ]
            |
            v  (Port 5173)
[ API Gateway Service ]  <--- (Port 5000: JWT Validation, RBAC Authz, Rate Limiting, Audit Log)
            |
            v  (Proxied Internal HTTP)
[ Backend REST Microservice ] <--- (Port 5001: Controllers & Business Logic)
            |
            v
[ MongoDB Database ] (Models: Users, Roles, Permissions, AuditLogs, SecurityEvents, ApiRequests)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` OR MongoDB Atlas URI.

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd "Role based access control"

# Install all workspace dependencies (root, gateway, backend, frontend)
npm run install:all
```

### 3. Environment Setup
Copy `.env.example` to `.env` in the root (and child directories if configuring separately):
```bash
cp .env.example .env
```

### 4. Database Seeder
Seed initial permissions (`user:read`, `user:create`, `role:update`, etc.), default roles (`Admin`, `Manager`, `Employee`, `Guest`), and default admin account:
```bash
npm run seed
```

### 5. Running the Application
Start all microservices concurrently (Backend, Gateway, Frontend):
```bash
npm run dev
```

### 6. Static Frontend Build
The React dashboard can be deployed as static files after the API services are configured:
```bash
npm run build:frontend
npm run preview:frontend
```
The generated files are in `frontend/dist/`. Configure the static host to rewrite application routes to `index.html` so links such as `/incident-map` work on refresh.

---

## 🔐 Default Credentials (Post-Seeding)

| Role | Username / Email | Password | Access Capabilities |
|------|------------------|----------|---------------------|
| **Admin** | `admin@security.local` | `Admin@123456` | Full administrative access, audit logs, security monitoring, user/role management. |
| **Manager** | `manager@security.local` | `Manager@123456` | Team reports, read permissions, update authorized records. |
| **Employee** | `employee@security.local` | `Employee@123456` | View self-profile, update permitted profile details. |
| **Guest** | `guest@security.local` | `Guest@123456` | Read-only public resource preview. |

---

## 📂 Project Structure

```
secure-rbac-api-gateway/
├── api-gateway/       # Port 5000: Auth, RBAC, Rate Limiter, Reverse Proxy
├── backend/           # Port 5001: REST API controllers, Mongoose DB Models, RBAC Seeders
├── frontend/          # Port 5173: React + Vite + Tailwind CSS Security Dashboard
├── docs/              # Academic documentation & diagrams
├── .env.example       # Template environment variable configuration
└── package.json       # Monorepo root script runner
```
