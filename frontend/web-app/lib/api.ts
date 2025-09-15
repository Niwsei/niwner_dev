// Force mock by default. Set NEXT_PUBLIC_USE_MOCK=0 to call real APIs.
const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK ?? '1') !== '0';

export const API = {
  courses: process.env.NEXT_PUBLIC_COURSE_API || 'http://localhost:3001',
  gamification: process.env.NEXT_PUBLIC_GAMIFICATION_API || 'http://localhost:3002',
  logic: process.env.NEXT_PUBLIC_LOGIC_API || 'http://localhost:3003',
  flow: process.env.NEXT_PUBLIC_FLOW_API || 'http://localhost:3004',
  user: process.env.NEXT_PUBLIC_USER_API || 'http://localhost:3000'
};

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Import mocks once
import * as Mock from '../mocks/api';

// Courses
export async function listCourses() {
  if (USE_MOCK) return Mock.listCourses();
  return http(`${API.courses}/courses`);
}

export async function getCourse(id: number | string) {
  if (USE_MOCK) return Mock.getCourse(id);
  return http(`${API.courses}/courses/${id}`);
}

export async function getCoursePreview(id: number | string) {
  if (USE_MOCK) return Mock.getCoursePreview(id);
  return http(`${API.courses}/courses/${id}/preview`);
}

// Course management (real endpoints only)
export async function createCourse(payload: any) {
  return http(`${API.courses}/courses`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateCourse(id: number, payload: any) {
  return http(`${API.courses}/courses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
export async function listModules(courseId: number) {
  return http(`${API.courses}/courses/${courseId}/modules`);
}
export async function createModule(courseId: number, payload: any) {
  return http(`${API.courses}/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateModule(moduleId: number, payload: any) {
  return http(`${API.courses}/modules/${moduleId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
export async function reorderModules(courseId: number, order: number[]) {
  return http(`${API.courses}/courses/${courseId}/modules/reorder`, { method: 'POST', body: JSON.stringify({ order }) });
}
export async function listLessons(moduleId: number) {
  return http(`${API.courses}/modules/${moduleId}/lessons`);
}
export async function createLesson(moduleId: number, payload: any) {
  return http(`${API.courses}/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateLesson(lessonId: number, payload: any) {
  return http(`${API.courses}/lessons/${lessonId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
export async function reorderLessons(moduleId: number, order: number[]) {
  return http(`${API.courses}/modules/${moduleId}/lessons/reorder`, { method: 'POST', body: JSON.stringify({ order }) });
}
export async function listVersions(courseId: number) {
  return http(`${API.courses}/courses/${courseId}/versions`);
}
export async function createVersion(courseId: number, notes?: string) {
  return http(`${API.courses}/courses/${courseId}/versions`, { method: 'POST', body: JSON.stringify({ notes }) });
}
export async function publishCourse(courseId: number) {
  return http(`${API.courses}/courses/${courseId}/publish`, { method: 'POST' });
}
export async function unpublishCourse(courseId: number) {
  return http(`${API.courses}/courses/${courseId}/unpublish`, { method: 'POST' });
}
export async function listBundles() {
  return http(`${API.courses}/bundles`);
}
export async function createBundle(payload: any) {
  return http(`${API.courses}/bundles`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateBundle(id: number, payload: any) {
  return http(`${API.courses}/bundles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

// Bulk operations
export async function bulkUpdateCourses(items: Array<{ id: number; data: any }>) {
  return http(`${API.courses}/courses/bulk-update`, { method: 'POST', body: JSON.stringify({ items }) });
}

// Video assets & analytics
export async function importVideo(fileMeta: { path: string; filename?: string; size?: number; sha256?: string; mime?: string }) {
  return http(`${API.courses}/videos/import`, { method: 'POST', body: JSON.stringify(fileMeta) });
}
export async function getVideoAsset(id: string) {
  return http(`${API.courses}/videos/${id}`);
}
export async function transcodeVideo(id: string, opts?: { preset?: string; resolutions?: string[]; formats?: string[] }) {
  return http(`${API.courses}/videos/${id}/transcode`, { method: 'POST', body: JSON.stringify(opts || {}) });
}
export async function generateThumbnails(id: string, count = 4) {
  return http(`${API.courses}/videos/${id}/thumbnails`, { method: 'POST', body: JSON.stringify({ count }) });
}
export async function sendVideoAnalytics(id: string, events: any | any[]) {
  return http(`${API.courses}/videos/${id}/analytics/events`, { method: 'POST', body: JSON.stringify(events) });
}
export async function getVideoAnalytics(id: string) {
  return http(`${API.courses}/videos/${id}/analytics`);
}

// Subtitles & watermark
export async function listSubtitles(id: string) {
  return http(`${API.courses}/videos/${id}/subtitles`);
}
export async function addSubtitle(id: string, track: { lang: string; label: string; url: string; default?: boolean }) {
  return http(`${API.courses}/videos/${id}/subtitles`, { method: 'POST', body: JSON.stringify(track) });
}
export async function removeSubtitle(id: string, lang: string) {
  return http(`${API.courses}/videos/${id}/subtitles/${lang}`, { method: 'DELETE' });
}
export async function getWatermark(id: string) {
  return http(`${API.courses}/videos/${id}/watermark`);
}
export async function setWatermark(id: string, cfg: { type?: 'overlay'|'burnin'; text?: string; imageUrl?: string; opacity?: number; position?: string; moving?: boolean }) {
  return http(`${API.courses}/videos/${id}/watermark`, { method: 'POST', body: JSON.stringify(cfg) });
}

// Gamification
export async function getUserPoints(userId: string) {
  if (USE_MOCK) return Mock.getUserPoints(userId);
  return http(`${API.gamification}/users/${userId}/points`);
}

export async function addUserPoints(userId: string, delta: number) {
  if (USE_MOCK) return Mock.addUserPoints(userId, delta);
  return http(`${API.gamification}/users/${userId}/points`, { method: 'POST', body: JSON.stringify({ delta }) });
}

export async function getUserAchievements(userId: string) {
  if (USE_MOCK) return Mock.getUserAchievements(userId);
  return http(`${API.gamification}/users/${userId}/achievements`);
}

export async function getLeaderboard() {
  if (USE_MOCK) return Mock.getLeaderboard();
  return http(`${API.gamification}/leaderboard`);
}

export async function getUserStreak(userId: string) {
  if (USE_MOCK) return Mock.getUserStreak(userId);
  // no direct backend route yet; return points for now
  return { current: 0, longest: 0, days: [] } as any;
}

// Logic
export async function getRandomPuzzle() {
  if (USE_MOCK) return Mock.getRandomPuzzle();
  return http(`${API.logic}/puzzles/random`);
}

export async function analyzeCode(code: string) {
  if (USE_MOCK) return Mock.analyzeCode(code);
  return http(`${API.logic}/analyze`, { method: 'POST', body: JSON.stringify({ code }) });
}

// Flow
export async function listWorkflows() {
  if (USE_MOCK) return Mock.listWorkflows();
  return http(`${API.flow}/workflows`);
}

export async function createWorkflow(payload: any) {
  if (USE_MOCK) return Mock.createWorkflow(payload);
  return http(`${API.flow}/workflows`, { method: 'POST', body: JSON.stringify(payload) });
}

// Shop / Subscriptions
export async function listSubscriptions() {
  if (USE_MOCK) return Mock.listSubscriptions();
  return [] as any;
}

// Analytics
export async function getLearningSeries() {
  if (USE_MOCK) return Mock.getLearningSeries();
  return { labels: [], data: [] } as any;
}

// Projects / Kanban
export async function getKanban() {
  if (USE_MOCK) return Mock.getKanban();
  return { columns: [], tasks: [] } as any;
}

// Community
export async function listGroups() {
  if (USE_MOCK) return Mock.listGroups();
  return [] as any;
}
export async function listThreads() {
  if (USE_MOCK) return Mock.listThreads();
  return [] as any;
}

// Auth
export async function registerWithEmail(email: string, password: string) {
  if (USE_MOCK) return Mock.registerWithEmail(email, password);
  return http(`${API.user}/auth/register`, { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function registerWithPhone(phone: string, password: string) {
  if (USE_MOCK) return Mock.registerWithPhone(phone, password);
  // real impl would hit phone registration endpoint
  return http(`${API.user}/auth/register-phone`, { method: 'POST', body: JSON.stringify({ phone, password }) });
}

export async function requestPhoneCode(phone: string) {
  if (USE_MOCK) return Mock.requestPhoneCode(phone);
  return http(`${API.user}/auth/phone/code`, { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function verifyPhoneCode(phone: string, code: string) {
  if (USE_MOCK) return Mock.verifyPhoneCode(phone, code);
  return http(`${API.user}/auth/phone/verify`, { method: 'POST', body: JSON.stringify({ phone, code }) });
}

export async function loginAuth(identifier: string, password: string) {
  if (USE_MOCK) return Mock.loginAuth(identifier, password);
  // choose email/phone by format on server
  return http(`${API.user}/auth/login`, { method: 'POST', body: JSON.stringify({ email: identifier, password }) });
}

export async function startSSO(provider: 'google' | 'facebook' | 'line') {
  if (USE_MOCK) return Mock.startSSO(provider);
  // real impl would redirect to provider
  throw new Error('SSO not implemented');
}

export async function requestPasswordResetEmail(email: string) {
  if (USE_MOCK) return Mock.requestPasswordResetEmail(email);
  return http(`${API.user}/auth/password/request`, { method: 'POST', body: JSON.stringify({ email }) });
}

export async function requestPasswordResetSms(phone: string) {
  if (USE_MOCK) return Mock.requestPasswordResetSms(phone);
  return http(`${API.user}/auth/password/request-sms`, { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function resetPasswordWithToken(resetToken: string, newPassword: string) {
  if (USE_MOCK) return Mock.resetPasswordWithToken(resetToken, newPassword);
  return http(`${API.user}/auth/password/reset`, { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) });
}

export async function verifyEmail(email: string) {
  if (USE_MOCK) return Mock.verifyEmail(email);
  return http(`${API.user}/auth/verify-email`, { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPasswordWithSms(phone: string, code: string, newPassword: string) {
  if (USE_MOCK) return Mock.resetPasswordWithSms(phone, code, newPassword);
  return http(`${API.user}/auth/password/reset-sms`, { method: 'POST', body: JSON.stringify({ phone, code, newPassword }) });
}

// MFA
export async function setupMfa(userId: number) {
  if (USE_MOCK) return Mock.setupMfa(userId);
  return http(`${API.user}/auth/mfa/setup`, { method: 'POST', body: JSON.stringify({ userId }) });
}
export async function verifyMfa(userId: number, code: string) {
  if (USE_MOCK) return Mock.verifyMfa(userId, code);
  return http(`${API.user}/auth/mfa/verify`, { method: 'POST', body: JSON.stringify({ userId, code }) });
}

export async function generateBackupCodes(userId: number) {
  if (USE_MOCK) return Mock.generateBackupCodes(userId);
  return http(`${API.user}/auth/mfa/backup/generate`, { method: 'POST', body: JSON.stringify({ userId }) });
}

export async function consumeBackupCode(userId: number, code: string) {
  if (USE_MOCK) return Mock.consumeBackupCode(userId, code);
  return http(`${API.user}/auth/mfa/backup/consume`, { method: 'POST', body: JSON.stringify({ userId, code }) });
}
