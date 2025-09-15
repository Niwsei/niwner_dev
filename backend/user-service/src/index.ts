import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
// Use require with any typing to avoid missing type deps
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt: any = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt: any = require('bcryptjs');

const prisma = new PrismaClient();
const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cors());

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/users', async (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error.flatten());
  }
  try {
    const user = await prisma.user.create({ data: result.data });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// In-memory auth + RBAC (demo; replace with DB + secure crypto)
type User = { id: number; email: string; passwordHash: string; verified: boolean; roles: string[] };
let nextUserId = 1;
const users: User[] = [];
const resetTokens = new Map<string, { userId: number; expiresAt: number }>();
const phoneCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const mfaSecrets = new Map<number, string>();
const mfaBackupCodes = new Map<number, { hash: string; used: boolean }[]>();
const tempRoles = new Map<number, { role: string; expiresAt: number }[]>();

function token() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

// JWT settings
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';
const ENFORCE_MFA_ROLES = (process.env.ENFORCE_MFA_ROLES || '').split(',').map(s => s.trim()).filter(Boolean);
const MFA_TOTP_WINDOW = Number(process.env.MFA_TOTP_WINDOW ?? '1');
const MFA_TOTP_STEP = Number(process.env.MFA_TOTP_STEP ?? '30');

// Role hierarchy (higher roles inherit lower roles)
const ROLES = ['student', 'instructor', 'admin', 'superadmin'] as const;
type Role = typeof ROLES[number];
const ROLE_INHERITS: Record<Role, Role[]> = {
  student: [],
  instructor: ['student'],
  admin: ['instructor', 'student'],
  superadmin: ['admin', 'instructor', 'student'],
};
function expandRoles(input: string[] | undefined): string[] {
  if (!input || input.length === 0) return [];
  const seen = new Set<string>();
  const stack = [...input];
  while (stack.length) {
    const r = String(stack.pop());
    if (seen.has(r)) continue;
    seen.add(r);
    if ((ROLES as readonly string[]).includes(r)) {
      const inh = (ROLE_INHERITS as any)[r] as string[] | undefined;
      if (inh) stack.push(...inh);
    }
  }
  return Array.from(seen);
}

// Simple in-memory audit log (demo)
type AuditAction = 'register' | 'login_success' | 'login_failure' | 'logout' | 'verify_email' | 'password_reset_request' | 'password_reset_success' | 'mfa_setup' | 'mfa_verify' | 'role_assign' | 'role_revoke' | 'role_assign_temp' | 'role_revoke_temp';
type AuditEntry = { id: number; at: string; ip?: string | string[]; userId?: number; email?: string; action: AuditAction };
let nextAuditId = 1;
const auditLogs: AuditEntry[] = [];
function logAudit(e: Omit<AuditEntry, 'id' | 'at'> & { ip?: string | string[] }) {
  auditLogs.push({ id: nextAuditId++, at: new Date().toISOString(), ...e });
}

// Simple IP rate limiter (fixed window)
function makeRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = (req.ip || 'unknown') + ':' + req.path;
    const now = Date.now();
    const rec = hits.get(key);
    if (!rec || rec.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (rec.count >= max) {
      const retry = Math.ceil((rec.resetAt - now) / 1000);
      return res.status(429).json({ error: 'too_many_requests', retry_after_seconds: retry });
    }
    rec.count += 1;
    return next();
  };
}

const loginLimiter = makeRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 });
const registerLimiter = makeRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 });
const pwdLimiter = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
const mfaLimiter = makeRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 });

app.post('/auth/register', registerLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'email_exists' });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user: User = { id: nextUserId++, email, passwordHash, verified: false, roles: ['student'] };
  users.push(user);
  // pretend we sent verification email with code
  logAudit({ action: 'register', ip: req.ip, userId: user.id, email: user.email });
  res.status(201).json({ id: user.id, email: user.email, requiresVerification: true });
});

app.post('/auth/login', loginLimiter, async (req, res) => {
  const { email, password, mfaCode, backupCode } = req.body || {};
  const user = users.find(u => u.email === email);
  if (!user) {
    logAudit({ action: 'login_failure', ip: req.ip, email });
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!ok) {
    logAudit({ action: 'login_failure', ip: req.ip, userId: user.id, email });
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const requiresMfa = ENFORCE_MFA_ROLES.length > 0 && user.roles.some(r => ENFORCE_MFA_ROLES.includes(r));
  let mfaPassed = false;
  if (requiresMfa) {
    const enc = mfaSecrets.get(user.id);
    let secret: string | undefined;
    if (enc) {
      try { secret = decryptSecret(enc); } catch { /* ignore */ }
    }
    if (mfaCode && secret && totpVerify(secret, String(mfaCode), MFA_TOTP_WINDOW, MFA_TOTP_STEP)) {
      mfaPassed = true;
    } else if (backupCode) {
      const list = mfaBackupCodes.get(user.id) || [];
      for (const rec of list) {
        if (!rec.used && await bcrypt.compare(String(backupCode), rec.hash)) {
          rec.used = true; mfaPassed = true; break;
        }
      }
    }
    if (!mfaPassed) {
      return res.status(401).json({ error: 'mfa_required' });
    }
  }
  const tokenJwt = jwt.sign({ sub: user.id, roles: user.roles, ver: user.verified, mfa: requiresMfa ? true : false }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  logAudit({ action: 'login_success', ip: req.ip, userId: user.id, email: user.email });
  res.json({ token: tokenJwt, user: { id: user.id, email: user.email, roles: user.roles, verified: user.verified } });
});

app.post('/auth/verify-email', (req, res) => {
  const { email } = req.body || {};
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'not_found' });
  user.verified = true;
  logAudit({ action: 'verify_email', ip: req.ip, userId: user.id, email: user.email });
  res.json({ ok: true });
});

app.post('/auth/password/request', pwdLimiter, (req, res) => {
  const { email } = req.body || {};
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'not_found' });
  const t = token();
  resetTokens.set(t, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });
  logAudit({ action: 'password_reset_request', ip: req.ip, userId: user.id, email: user.email });
  res.json({ resetToken: t });
});

app.post('/auth/password/reset', (req, res) => {
  const { resetToken, newPassword } = req.body || {};
  const rec = resetTokens.get(resetToken as string);
  if (!rec || rec.expiresAt < Date.now()) return res.status(400).json({ error: 'invalid_or_expired' });
  const user = users.find(u => u.id === rec.userId)!;
  bcrypt.hash(String(newPassword || ''), 10).then((hash: string) => {
    user.passwordHash = hash;
    resetTokens.delete(resetToken);
    logAudit({ action: 'password_reset_success', ip: req.ip, userId: user.id, email: user.email });
    res.json({ ok: true });
  }).catch(() => res.status(500).json({ error: 'hash_failed' }));
});

// MFA (demo)
// TOTP helpers (RFC 6238) using SHA1
import crypto from 'crypto';

// Encryption helpers for MFA secrets (AES-256-GCM)
function getEncKey(): Buffer {
  const env = process.env.MFA_SECRET_ENC_KEY; // base64 32 bytes recommended
  if (env) {
    try {
      const key = Buffer.from(env, 'base64');
      if (key.length === 32) return key;
    } catch { /* ignore */ }
  }
  // Fallback derive from JWT_SECRET (dev only)
  return crypto.createHash('sha256').update(String(process.env.JWT_SECRET || 'dev_secret_change_me')).digest();
}
const ENC_KEY = getEncKey();

function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}
function base32Encode(buffer: Buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}
function base32Decode(str: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const map: Record<string, number> = {};
  for (let i = 0; i < alphabet.length; i++) map[alphabet[i]] = i;
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of str.replace(/=+$/, '').toUpperCase()) {
    if (map[c] === undefined) continue;
    value = (value << 5) | map[c];
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}
function hotp(secret: Buffer, counter: number, digits = 6) {
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) { buf[i] = counter & 0xff; counter = Math.floor(counter / 256); }
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  const str = String(code % 10 ** digits).padStart(digits, '0');
  return str;
}
function totpVerify(base32Secret: string, token: string, window = 1, step = 30) {
  const secret = base32Decode(base32Secret);
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let w = -window; w <= window; w++) {
    const code = hotp(secret, counter + w);
    if (code === token) return true;
  }
  return false;
}

app.post('/auth/mfa/setup', mfaLimiter, async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId_required' });
  const raw = crypto.randomBytes(20);
  const secret = base32Encode(raw);
  const enc = encryptSecret(secret);
  mfaSecrets.set(Number(userId), enc);
  logAudit({ action: 'mfa_setup', ip: req.ip, userId });
  res.json({ secret, otpauth: `otpauth://totp/SkillFlow:${userId}?secret=${secret}&issuer=SkillFlow` });
});
app.post('/auth/mfa/verify', mfaLimiter, (req, res) => {
  const { userId, code } = req.body || {};
  const enc = mfaSecrets.get(Number(userId));
  if (!enc) return res.status(400).json({ error: 'mfa_not_setup' });
  let secret: string;
  try { secret = decryptSecret(enc); } catch { return res.status(500).json({ error: 'decrypt_failed' }); }
  const ok = totpVerify(secret, String(code || ''), MFA_TOTP_WINDOW, MFA_TOTP_STEP);
  if (!ok) return res.status(400).json({ error: 'invalid_code' });
  logAudit({ action: 'mfa_verify', ip: req.ip, userId });
  res.json({ ok: true });
});

// MFA backup codes
app.post('/auth/mfa/backup/generate', mfaLimiter, async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId_required' });
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) codes.push(crypto.randomBytes(5).toString('hex'));
  const hashes = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  mfaBackupCodes.set(Number(userId), hashes.map((h) => ({ hash: h, used: false })));
  res.json({ codes }); // Show once
});
app.post('/auth/mfa/backup/consume', mfaLimiter, async (req, res) => {
  const { userId, code } = req.body || {};
  const list = mfaBackupCodes.get(Number(userId)) || [];
  for (const rec of list) {
    if (!rec.used && await bcrypt.compare(String(code || ''), rec.hash)) {
      rec.used = true;
      return res.json({ ok: true });
    }
  }
  return res.status(400).json({ error: 'invalid_or_used' });
});

// Phone OTP (SMS)
const phoneLimiter = makeRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });
app.post('/auth/phone/code', phoneLimiter, (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone_required' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  phoneCodes.set(String(phone), { code, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
  // In production, send via SMS gateway here.
  res.json({ sent: true });
});
app.post('/auth/phone/verify', phoneLimiter, (req, res) => {
  const { phone, code } = req.body || {};
  const rec = phoneCodes.get(String(phone));
  if (!rec || rec.expiresAt < Date.now()) return res.status(400).json({ error: 'invalid_or_expired' });
  rec.attempts += 1;
  if (rec.attempts > 5) return res.status(429).json({ error: 'too_many_attempts' });
  if (rec.code !== String(code)) return res.status(400).json({ error: 'invalid_code' });
  phoneCodes.delete(String(phone));
  res.json({ ok: true });
});

// Stateless logout (audit only)
app.post('/auth/logout', (req, res) => {
  const { userId, email } = req.body || {};
  logAudit({ action: 'logout', ip: req.ip, userId, email });
  res.json({ ok: true });
});

// RBAC
app.get('/rbac/roles', (_req, res) => res.json(['student', 'instructor', 'admin', 'superadmin']));
app.post('/rbac/assign', (req, res) => {
  const { userId, role } = req.body || {};
  const user = users.find(u => u.id === Number(userId));
  if (!user) return res.status(404).json({ error: 'not_found' });
  if (!user.roles.includes(role)) user.roles.push(role);
  logAudit({ action: 'role_assign', ip: req.ip, userId: user.id, email: user.email });
  res.json({ id: user.id, roles: user.roles });
});

// Revoke persistent role
app.post('/rbac/revoke', (req, res) => {
  const { userId, role } = req.body || {};
  const user = users.find(u => u.id === Number(userId));
  if (!user) return res.status(404).json({ error: 'not_found' });
  user.roles = user.roles.filter((r) => r !== role);
  logAudit({ action: 'role_revoke', ip: req.ip, userId: user.id, email: user.email });
  res.json({ id: user.id, roles: user.roles });
});

// Assign temporary role with expiry (durationSeconds or expiresAt timestamp)
app.post('/rbac/assign-temp', (req, res) => {
  const { userId, role, durationSeconds, expiresAt } = req.body || {};
  const uid = Number(userId);
  const user = users.find(u => u.id === uid);
  if (!user) return res.status(404).json({ error: 'not_found' });
  const until = expiresAt ? Number(expiresAt) : Date.now() + Math.max(1, Number(durationSeconds || 0)) * 1000;
  if (!isFinite(until) || until <= Date.now()) return res.status(400).json({ error: 'invalid_expiry' });
  const list = tempRoles.get(uid) || [];
  list.push({ role, expiresAt: until });
  tempRoles.set(uid, list);
  logAudit({ action: 'role_assign_temp', ip: req.ip, userId: uid, email: user.email });
  res.json({ userId: uid, tempRoles: list });
});

// Revoke temporary role
app.post('/rbac/revoke-temp', (req, res) => {
  const { userId, role } = req.body || {};
  const uid = Number(userId);
  const user = users.find(u => u.id === uid);
  if (!user) return res.status(404).json({ error: 'not_found' });
  const list = (tempRoles.get(uid) || []).filter((t) => t.role !== role && t.expiresAt > Date.now());
  tempRoles.set(uid, list);
  logAudit({ action: 'role_revoke_temp', ip: req.ip, userId: uid, email: user.email });
  res.json({ userId: uid, tempRoles: list });
});

// List active temporary roles
app.get('/rbac/temp/:userId', (req, res) => {
  const uid = Number(req.params.userId);
  const list = (tempRoles.get(uid) || []).filter((t) => t.expiresAt > Date.now());
  res.json({ userId: uid, tempRoles: list });
});

// JWT auth middleware + role guard (demo)
function auth(req: any, res: any, next: any) {
  const h = String(req.headers['authorization'] || '');
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload: any = jwt.verify(m[1], JWT_SECRET);
    // Merge active temporary roles into request auth and expand via hierarchy
    const baseRoles: string[] = Array.isArray(payload.roles) ? payload.roles : [];
    const uid = Number(payload.sub);
    const now = Date.now();
    const activeTemps = (tempRoles.get(uid) || []).filter((t) => t.expiresAt > now).map((t) => t.role);
    const merged = Array.from(new Set([...(baseRoles || []), ...activeTemps]));
    payload.roles = expandRoles(merged);
    req.auth = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
function requireRole(role: string | string[]) {
  const need = Array.isArray(role) ? role : [role];
  return (req: any, res: any, next: any) => {
    const roles: string[] = (req.auth && req.auth.roles) || [];
    if (!roles.some((r) => need.includes(r))) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// Permission map and groups (demo)
const PERMISSIONS: Record<string, string[]> = {
  'course.read': ['student', 'instructor', 'admin', 'superadmin'],
  'course.manage.own': ['instructor', 'admin', 'superadmin'],
  'course.manage.any': ['admin', 'superadmin'],
  'builder.access': ['instructor', 'admin', 'superadmin'],
  'analytics.view.own': ['student', 'instructor'],
  'analytics.view.global': ['admin', 'superadmin'],
  'orders.manage.any': ['admin', 'superadmin'],
  'community.moderate.own': ['instructor'],
  'community.moderate.any': ['admin', 'superadmin'],
  'admin.panel': ['admin', 'superadmin'],
  'rbac.manage': ['superadmin'],
};

type PermissionGroup = { key: string; label: string; permissions: string[] };
const PERMISSION_GROUPS: PermissionGroup[] = [
  { key: 'student-default', label: 'Student Default', permissions: ['course.read', 'analytics.view.own'] },
  { key: 'instructor-default', label: 'Instructor Default', permissions: ['course.read', 'course.manage.own', 'builder.access', 'community.moderate.own', 'analytics.view.own'] },
  { key: 'admin-ops', label: 'Admin Operations', permissions: ['course.manage.any', 'orders.manage.any', 'community.moderate.any', 'analytics.view.global', 'admin.panel'] },
  { key: 'superadmin-core', label: 'Super Admin Core', permissions: ['rbac.manage'] },
];

function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    const roles: string[] = (req.auth && req.auth.roles) || [];
    const allowed = PERMISSIONS[permission] || [];
    if (!roles.some((r) => allowed.includes(r))) return res.status(403).json({ error: 'forbidden', permission });
    next();
  };
}

function requireAnyPermission(perms: string[]) {
  return (req: any, res: any, next: any) => {
    const roles: string[] = (req.auth && req.auth.roles) || [];
    const ok = perms.some((p) => (PERMISSIONS[p] || []).some((r) => roles.includes(r)));
    if (!ok) return res.status(403).json({ error: 'forbidden_any', permissions: perms });
    next();
  };
}

function requireAllPermissions(perms: string[]) {
  return (req: any, res: any, next: any) => {
    const roles: string[] = (req.auth && req.auth.roles) || [];
    const ok = perms.every((p) => (PERMISSIONS[p] || []).some((r) => roles.includes(r)));
    if (!ok) return res.status(403).json({ error: 'forbidden_all', permissions: perms });
    next();
  };
}

// Permission matrix validation
function validatePermissionMatrix() {
  const issues: { code: string; message: string; detail?: any }[] = [];
  const roleSet = new Set<string>(ROLES as unknown as string[]);
  // Check unknown roles in permission map
  for (const [perm, allowed] of Object.entries(PERMISSIONS)) {
    for (const r of allowed) {
      if (!roleSet.has(r)) issues.push({ code: 'unknown_role_in_permission', message: `Unknown role '${r}' in permission '${perm}'` });
    }
    if (allowed.length === 0) issues.push({ code: 'orphan_permission', message: `Permission '${perm}' has no allowed roles` });
  }
  // Check groups reference valid permissions
  const permKeys = new Set(Object.keys(PERMISSIONS));
  for (const g of PERMISSION_GROUPS) {
    for (const p of g.permissions) {
      if (!permKeys.has(p)) issues.push({ code: 'unknown_permission_in_group', message: `Group '${g.key}' references unknown permission '${p}'` });
    }
  }
  // Check hierarchy cycles (simple DFS)
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(r: Role): boolean {
    if (visited.has(r)) return true;
    if (visiting.has(r)) return false; // cycle
    visiting.add(r);
    for (const pr of ROLE_INHERITS[r]) {
      if (!dfs(pr as Role)) return false;
    }
    visiting.delete(r);
    visited.add(r);
    return true;
  }
  for (const r of ROLES) {
    if (!dfs(r)) issues.push({ code: 'role_hierarchy_cycle', message: 'Cycle detected in role hierarchy' });
  }
  return { ok: issues.length === 0, issues };
}

app.get('/rbac/hierarchy', (_req, res) => {
  res.json({ roles: ROLES, inherits: ROLE_INHERITS });
});

app.get('/rbac/validate', (_req, res) => {
  res.json(validatePermissionMatrix());
});

// RBAC: permissions discovery/check
app.get('/rbac/permissions', (_req, res) => {
  res.json({ permissions: Object.keys(PERMISSIONS), map: PERMISSIONS, groups: PERMISSION_GROUPS });
});
app.post('/rbac/check', auth, (req: any, res) => {
  const { permission } = req.body || {};
  if (!permission) return res.status(400).json({ error: 'permission_required' });
  const roles: string[] = (req.auth && req.auth.roles) || [];
  const allowed = PERMISSIONS[permission] || [];
  const ok = roles.some((r) => allowed.includes(r));
  res.json({ ok, roles, permission });
});

// Example protected endpoints (demo)
app.get('/me', auth, (req: any, res) => {
  res.json({ sub: req.auth.sub, roles: req.auth.roles, mfa: req.auth.mfa, ver: req.auth.ver });
});
app.get('/admin/health', auth, requireRole('admin'), (_req, res) => {
  res.json({ ok: true });
});
app.get('/admin/orders', auth, requirePermission('orders.manage.any'), (_req, res) => {
  res.json({ items: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});

// Audit endpoint (demo only, protect in production)
app.get('/audit/logs', (_req, res) => {
  res.json(auditLogs.slice(-500));
});
