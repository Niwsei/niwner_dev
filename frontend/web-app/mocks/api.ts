import { courses, modules, lessons, userPoints, userAchievements, randomPuzzle, workflows, Workflow } from './data';
import { leaderboard, streaks, subscriptionPlans, learningSeries, kanban, groups, threads } from './data';

function wait<T>(data: T, ms = 250): Promise<T> { return new Promise((r) => setTimeout(() => r(data), ms)); }

// Courses
export async function listCourses() {
  return wait([...courses]);
}

export async function getCourse(id: number | string) {
  const cid = Number(id);
  const course = courses.find(c => c.id === cid);
  if (!course) throw new Error('not_found');
  const cms = modules.filter(m => m.course_id === cid).sort((a,b) => a.order - b.order);
  const cls = lessons.filter(l => cms.some(m => m.id === l.module_id));
  return wait({ ...course, modules: cms, lessons: cls });
}

export async function getCoursePreview(id: number | string) {
  const cid = Number(id);
  const course = courses.find(c => c.id === cid);
  if (!course) throw new Error('not_found');
  const sampleModules = modules.filter(m => m.course_id === cid).sort((a,b) => a.order - b.order).slice(0,1);
  const sampleLessons = lessons.filter(l => sampleModules.some(m => m.id === l.module_id)).slice(0,1);
  return wait({ id: course.id, title: course.title, description: (course.description || '').slice(0,200), sampleModules, sampleLessons });
}

// Gamification
export async function getUserPoints(userId: string) {
  return wait(userPoints.get(userId) || { xp: 0, level: 1 });
}

export async function addUserPoints(userId: string, delta: number) {
  const prev = userPoints.get(userId) || { xp: 0, level: 1 };
  const xp = Math.max(0, prev.xp + Number(delta || 0));
  const level = Math.floor(xp / 1000) + 1;
  const updated = { xp, level };
  userPoints.set(userId, updated);
  return wait(updated);
}

export async function getUserAchievements(userId: string) {
  return wait(userAchievements.get(userId) || []);
}

export async function getLeaderboard() {
  return wait(leaderboard.slice());
}

export async function getUserStreak(userId: string) {
  return wait(streaks.get(userId) || { current: 0, longest: 0, days: [] });
}

// Logic
export async function getRandomPuzzle() {
  return wait(randomPuzzle());
}

export async function analyzeCode(code: string) {
  const metrics = {
    length: code.length,
    lines: code.split(/\n/).length,
    branches: (code.match(/if\s*\(|else if\s*\(|switch\s*\(/g) || []).length,
    loops: (code.match(/for\s*\(|while\s*\(/g) || []).length,
    tryCatch: (code.match(/try\s*\{|catch\s*\(/g) || []).length
  } as any;
  metrics.cyclomatic = metrics.branches + metrics.loops + 1;
  const feedback: string[] = [];
  if (metrics.cyclomatic > 10) feedback.push('High complexity, consider refactoring.');
  if (metrics.lines > 200) feedback.push('Long function/module, consider splitting.');
  return wait({ metrics, feedback });
}

// Flow
let nextWorkflowId = workflows.length + 1;
export async function listWorkflows() {
  return wait([...workflows]);
}

export async function createWorkflow(payload: Partial<Workflow>) {
  if (!payload.title) throw new Error('title is required');
  const wf: Workflow = { id: nextWorkflowId++, title: payload.title!, description: payload.description || '', nodes: payload.nodes as any || [], connections: payload.connections as any || [] };
  workflows.push(wf);
  return wait(wf);
}

// Shop / Subscriptions
export async function listSubscriptions() {
  return wait(subscriptionPlans.slice());
}

// Analytics
export async function getLearningSeries() {
  return wait({ ...learningSeries });
}

// Projects / Kanban
export async function getKanban() {
  return wait({ ...kanban });
}

// Community
export async function listGroups() {
  return wait(groups.slice());
}
export async function listThreads() {
  return wait(threads.slice());
}

// -----------------------------
// Auth (Mock)
// -----------------------------
type MockUser = { id: number; email?: string; phone?: string; password: string; verified: boolean; providers: string[] };
let nextMockUserId = 1;
const mockUsers: MockUser[] = [];
const mockResetTokens = new Map<string, { userId: number; expiresAt: number }>();
const mockSmsCodes = new Map<string, { code: string; expiresAt: number }>();

function tkn() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

export async function registerWithEmail(email: string, password: string) {
  const exists = mockUsers.find(u => u.email === email);
  if (exists) throw new Error('email_exists');
  const user: MockUser = { id: nextMockUserId++, email, password, verified: false, providers: [] };
  mockUsers.push(user);
  return wait({ id: user.id, email: user.email, requiresVerification: true });
}

export async function registerWithPhone(phone: string, password: string) {
  const exists = mockUsers.find(u => u.phone === phone);
  if (exists) throw new Error('phone_exists');
  const user: MockUser = { id: nextMockUserId++, phone, password, verified: false, providers: [] };
  mockUsers.push(user);
  // auto-send code
  await requestPhoneCode(phone);
  return wait({ id: user.id, phone: user.phone, requiresVerification: true });
}

export async function requestPhoneCode(phone: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  mockSmsCodes.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  return wait({ sent: true, code });
}

export async function verifyPhoneCode(phone: string, code: string) {
  const rec = mockSmsCodes.get(phone);
  if (!rec || rec.expiresAt < Date.now() || rec.code !== code) throw new Error('invalid_or_expired');
  const user = mockUsers.find(u => u.phone === phone);
  if (user) user.verified = true;
  mockSmsCodes.delete(phone);
  return wait({ ok: true });
}

export async function loginAuth(identifier: string, password: string) {
  const user = mockUsers.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
  if (!user) throw new Error('invalid_credentials');
  return wait({ token: tkn(), user: { id: user.id, email: user.email, phone: user.phone, verified: user.verified, providers: user.providers } });
}

export async function startSSO(provider: 'google' | 'facebook' | 'line') {
  // simulate SSO success
  const id = nextMockUserId++;
  const user: MockUser = { id, email: `${provider}+${id}@example.com`, password: '', verified: true, providers: [provider] };
  mockUsers.push(user);
  return wait({ token: tkn(), user: { id: user.id, email: user.email, verified: true, providers: user.providers } });
}

export async function requestPasswordResetEmail(email: string) {
  const user = mockUsers.find(u => u.email === email);
  if (!user) throw new Error('not_found');
  const token = tkn();
  mockResetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });
  return wait({ resetToken: token });
}

export async function requestPasswordResetSms(phone: string) {
  return requestPhoneCode(phone);
}

export async function resetPasswordWithToken(resetToken: string, newPassword: string) {
  const rec = mockResetTokens.get(resetToken);
  if (!rec || rec.expiresAt < Date.now()) throw new Error('invalid_or_expired');
  const user = mockUsers.find(u => u.id === rec.userId);
  if (!user) throw new Error('not_found');
  user.password = newPassword;
  mockResetTokens.delete(resetToken);
  return wait({ ok: true });
}

export async function verifyEmail(email: string) {
  const user = mockUsers.find(u => u.email === email);
  if (!user) throw new Error('not_found');
  user.verified = true;
  return wait({ ok: true });
}

export async function resetPasswordWithSms(phone: string, code: string, newPassword: string) {
  const rec = mockSmsCodes.get(phone);
  if (!rec || rec.expiresAt < Date.now() || rec.code !== code) throw new Error('invalid_or_expired');
  const user = mockUsers.find(u => u.phone === phone);
  if (!user) throw new Error('not_found');
  user.password = newPassword;
  mockSmsCodes.delete(phone);
  return wait({ ok: true });
}

// MFA (Mock)
export async function setupMfa(userId: number) {
  const secret = tkn().slice(0, 16).toUpperCase();
  const otpauth = `otpauth://totp/SkillFlow:${userId}?secret=${secret}&issuer=SkillFlow`;
  return wait({ secret, otpauth });
}
export async function verifyMfa(_userId: number, code: string) {
  if (String(code) !== '123456') throw new Error('invalid_code');
  return wait({ ok: true });
}

// MFA backup codes (mock)
const mockBackupCodes = new Map<number, string[]>();
export async function generateBackupCodes(userId: number) {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) codes.push(tkn().slice(0, 10));
  mockBackupCodes.set(userId, codes.slice());
  return wait({ codes });
}
export async function consumeBackupCode(userId: number, code: string) {
  const list = mockBackupCodes.get(userId) || [];
  const idx = list.indexOf(code);
  if (idx === -1) throw new Error('invalid_or_used');
  list.splice(idx, 1);
  mockBackupCodes.set(userId, list);
  return wait({ ok: true });
}
