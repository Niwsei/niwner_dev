# User Service

A minimal Express.js service written in TypeScript. Uses **Prisma** for database access and **Zod** for request validation.

## Scripts

- `npm run dev` – start the service with auto-reload
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run the compiled service
- `npm run prisma` – generate Prisma client
- `npm test` – run placeholder tests

## Endpoints

- `GET /health` – health check
- `POST /users` – create a user (expects `{ email, password }`)

### Auth (Demo-ready, secure primitives)

- `POST /auth/register` – register with email+password (bcrypt-hashed)
- `POST /auth/login` – login and receive JWT (signed with `JWT_SECRET`)
  - Supports MFA enforcement by role. If `ENFORCE_MFA_ROLES` includes any of the user's roles, provide `mfaCode` (TOTP) or `backupCode` in the request body. Otherwise returns `401 { error: "mfa_required" }`.
- `POST /auth/verify-email` – mark email as verified
- `POST /auth/password/request` – request password reset (returns demo token)
- `POST /auth/password/reset` – reset password with token (re-hash with bcrypt)
- `POST /auth/mfa/setup` – create a demo MFA secret (mock)
- `POST /auth/mfa/verify` – verify TOTP code (Google Authenticator/Authy compatible)
- `POST /auth/mfa/backup/generate` – generate backup codes (return once; stored hashed)
- `POST /auth/mfa/backup/consume` – consume a backup code (one-time use)
- `POST /auth/phone/code` – request SMS OTP (demo; logs only)
- `POST /auth/phone/verify` – verify SMS OTP

### RBAC

- `GET /rbac/roles` – list supported roles
- `POST /rbac/assign` – assign a role to a user
- `POST /rbac/revoke` – revoke a persistent role from a user
- `POST /rbac/assign-temp` – assign a temporary role with expiry (body: `{ userId, role, durationSeconds? , expiresAt? }`)
- `POST /rbac/revoke-temp` – revoke a temporary role
- `GET /rbac/temp/:userId` – list active temporary roles
- `GET /rbac/permissions` – list permissions, mapping to roles, and permission groups
- `POST /rbac/check` – check if current JWT roles grant a permission (body: `{ permission }`)
- `GET /rbac/hierarchy` – role hierarchy definition (inheritance)
- `GET /rbac/validate` – validate permission matrix and groups (reports issues)
- `GET /me` – requires `Authorization: Bearer` JWT, returns token claims (demo)
- `GET /admin/health` – requires role `admin`
- `GET /admin/orders` – requires permission `orders.manage.any`
- `POST /auth/logout` – stateless logout (audit only)
- `GET /audit/logs` – view recent audit logs (demo; protect in production)

## Environment

Set environment variables:

- `DATABASE_URL` – PostgreSQL connection string (for Prisma models)
- `JWT_SECRET` – secret for signing JWT (required in production)
- `JWT_EXPIRES` – token lifetime (e.g. `8h`, `30d`)
- `ENFORCE_MFA_ROLES` – comma-separated roles to require MFA on login (e.g. `admin,instructor`)
- `MFA_SECRET_ENC_KEY` – base64-encoded 32-byte key for AES‑256‑GCM encryption of TOTP secrets. If unset, a key is derived from `JWT_SECRET` (dev only).
- `MFA_TOTP_WINDOW` – allowed time-window drift (default `1`, equals ±1 window)
- `MFA_TOTP_STEP` – TOTP time step in seconds (default `30`)

Security notes:
- TOTP secrets are stored encrypted at rest (AES‑256‑GCM). Backup codes are stored as bcrypt hashes.

Permission groups (demo):

- `student-default` → `course.read`, `analytics.view.own`
- `instructor-default` → `course.read`, `course.manage.own`, `builder.access`, `community.moderate.own`, `analytics.view.own`
- `admin-ops` → `course.manage.any`, `orders.manage.any`, `community.moderate.any`, `analytics.view.global`, `admin.panel`
- `superadmin-core` → `rbac.manage`

Role hierarchy (default):

- student
- instructor (inherits student)
- admin (inherits instructor, student)
- superadmin (inherits admin, instructor, student)

Rate limiting: built-in fixed-window limiter protects key auth routes.

Audit log: logs login/register/reset/verify/mfa/logout events in memory; replace with DB sink in production.
Role changes (assign/revoke, temp assign/revoke) are also audited.

## Docker

```
docker build -t user-service .
docker run -p 3000:3000 -e DATABASE_URL=postgres://... user-service
```
