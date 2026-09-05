# System Architecture & Technical Specification

## 1. Overview
This project implements a multi-tier cybersecurity defense system comprising an API Gateway, Role-Based Access Control (RBAC) authorization engine, JWT authentication server, multi-tiered rate limiter, and a real-time security dashboard.

---

## 2. Microservice Layer Responsibilities

```
+------------------+         +---------------------+         +---------------------+
|  React Dashboard |  ---->  |     API Gateway     |  ---->  |   Backend Service   |
|   (Port 5173)    |         |     (Port 5000)     |         |     (Port 5001)     |
+------------------+         +---------------------+         +---------------------+
                                 - Rate Limiting                 - Business Logic
                                 - JWT Validation                - Database Operations
                                 - RBAC Engine                   - Data Validation
                                 - CORS & Headers
                                 - Request Logging
```

---

## 3. Data Models (Mongoose)
1. **User**: Authentication credentials, password hash, role linkage, account locking metadata.
2. **Role**: Name, description, system flags, array of permission ObjectIds.
3. **Permission**: Granular resource actions (`user:read`, `user:create`, `role:update`, etc.).
4. **AuditLog**: Comprehensive log of all critical API actions, user context, status, and IP address.
5. **SecurityEvent**: Tracked security alerts (auth failures, authorization denials, rate limit violations).
6. **ApiRequest**: Request telemetry metrics for dashboard visualization.
