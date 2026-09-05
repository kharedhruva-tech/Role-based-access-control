# Comprehensive API Security Testing Strategy & Test Matrix

This document provides a systematic test execution plan to verify the security mechanisms implemented in the **Secure API Gateway with RBAC**.

---

## 1. Authentication Security Verification (401 Unauthorized)

### Test 1.1: Request Without Authorization Header
- **Request**: `GET http://localhost:5000/api/v1/users`
- **Expected Status**: `401 Unauthorized`
- **Expected Payload**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or malformed"
  }
}
```

### Test 1.2: Invalid JWT Signature
- **Request**: `GET http://localhost:5000/api/v1/users`
- **Header**: `Authorization: Bearer invalid.tampered.jwt.signature`
- **Expected Status**: `401 Unauthorized`
- **Expected Payload**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Access token is invalid or expired"
  }
}
```

---

## 2. Authorization Security Verification (403 Forbidden vs 200 Success)

### Test 2.1: Admin Deleting User Account (Permitted)
- **Role**: `Admin` (has `user:delete` permission)
- **Request**: `DELETE http://localhost:5000/api/v1/users/<USER_ID>`
- **Expected Status**: `200 OK`

### Test 2.2: Employee Attempting User Deletion (Forbidden)
- **Role**: `Employee` (lacks `user:delete` permission)
- **Request**: `DELETE http://localhost:5000/api/v1/users/<USER_ID>`
- **Expected Status**: `403 Forbidden`
- **Expected Payload**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access Denied: Insufficient Role Permissions",
    "details": "Role 'Employee' lacks required permission(s): [user:delete]"
  }
}
```
- **Automated Security Log**: Generates `AUTHORIZATION_DENIED` entry in `SecurityEvent` collection.

---

## 3. Rate Limiting Verification (429 Too Many Requests)

### Test 3.1: Exceeding Authentication Endpoint Limit
- **Endpoint**: `POST http://localhost:5000/api/v1/auth/login`
- **Execution**: Send 11 rapid login attempts from the same IP within 15 minutes.
- **Expected Status on 11th Request**: `429 Too Many Requests`
- **Expected Payload**:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_RATE_LIMIT_EXCEEDED",
    "message": "Too many authentication attempts. Please try again after 15 minutes."
  }
}
```
- **Automated Security Log**: Generates `RATE_LIMIT_EXCEEDED` entry in `SecurityEvent` collection.

---

## 4. cURL Test Scripts

```bash
# 1. Login as Admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@security.local","password":"Admin@123456"}'

# 2. Login as Employee
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@security.local","password":"Employee@123456"}'

# 3. Test 403 Forbidden (Employee trying to view Audit Logs)
curl -X GET http://localhost:5000/api/v1/audit-logs \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"

# 4. Test 200 Success (Admin viewing Audit Logs)
curl -X GET http://localhost:5000/api/v1/audit-logs \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
