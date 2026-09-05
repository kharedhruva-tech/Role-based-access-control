# Academic Project Defense Presentation

## Title: Secure API Gateway with Role-Based Access Control (RBAC), Authentication, Authorization, Rate Limiting, and Security Monitoring

---

### Slide 1: Introduction & Title
- **Project Title**: Secure API Gateway with RBAC & Security Monitoring
- **Domain**: Advanced API Security, Identity & Access Management (IAM), DevSecOps Architecture
- **Tech Stack**: React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, JWT, bcryptjs

---

### Slide 2: Problem Statement
- **Vulnerabilities in Modern APIs**:
  1. Monolithic endpoints directly exposing database services without centralized policy enforcement.
  2. OWASP API Security Top 10 vulnerabilities (API1: Broken Object Level Authorization, API2: Broken Authentication, API4: Unrestricted Resource Consumption).
  3. Absence of granular RBAC and inability to track security threats in real-time.

---

### Slide 3: Existing vs. Proposed Architecture

| Component | Legacy API Architecture | Proposed Secure API Gateway Architecture |
|-----------|-------------------------|------------------------------------------|
| **Entrypoint** | Direct client connection to microservices | Centralized API Gateway (Port 5000) |
| **Authentication** | Decentralized in each endpoint | Centralized JWT validation & refresh tokens |
| **Authorization** | Coarse role checks in UI layer | Granular server-side permission engine (`user:delete`, `role:update`) |
| **Rate Limiting** | None or basic global limit | Multi-tier rate limiting (Auth vs General API) |
| **Monitoring** | Static server logs | Real-time Operations Center Dashboard |

---

### Slide 4: System Architecture & Request Flow

```
[ Client Layer ] ---> [ API Gateway (Port 5000) ] ---> [ Backend Service (Port 5001) ] ---> [ MongoDB ]
                       | - Helmet Headers
                       | - Multi-tier Rate Limiter
                       | - JWT Token Authenticator
                       | - Granular RBAC Engine
                       | - Audit Telemetry Dispatcher
```

---

### Slide 5: Role-Based Access Control (RBAC) Design Matrix

- **Admin**: All permissions (`user:*`, `role:*`, `audit:read`, `security:read`).
- **Manager**: Team oversight (`user:read`, `user:update`, `report:read`).
- **Employee**: Self-service user details (`user:read`, `report:read`).
- **Guest**: Read-only public preview (`report:read`).

---

### Slide 6: Centralized Security Gateway Middleware Chain
1. **Security Headers (Helmet)**: Mitigation against XSS, Clickjacking, MIME sniffing.
2. **CORS Lockdown**: Origin validation restricting unauthorized web callers.
3. **Multi-tier Rate Limiting**: Throttling login brute-force attempts (`429 Too Many Requests`).
4. **Audit & Telemetry Middleware**: Generation of correlation IDs (`X-Correlation-ID`) and recording of response times.

---

### Slide 7: Security Monitoring Operations Center
- Live widgets tracking **Total Requests, 2xx Success, 401 Auth Failures, 403 Forbidden Denials, 429 Rate Limit Violations**.
- Recharts visualization for 24-hour traffic throughput and role distribution.
- Real-time audit log stream and active threat alerts.

---

### Slide 8: Testing & Validation Results
- Verified clean distinction between `401 Unauthorized` (unauthenticated) and `403 Forbidden` (lack of permission).
- Automated recording of rate-limiting violations in `SecurityEvent` model.

---

### Slide 9: Future Scope & Enhancements
- Integration of Redis for distributed rate-limiting across multi-node gateway clusters.
- Implementation of OAuth2 / OpenID Connect (OIDC) SSO provider integration.
- Automated IP blocking and Web Application Firewall (WAF) rule generation.

---

### Slide 10: Conclusion
- Successfully built a production-grade, multi-tier Secure API Gateway with RBAC and security monitoring.
- Reconfigured backend infrastructure to enforce zero-trust authorization principles across all endpoints.
