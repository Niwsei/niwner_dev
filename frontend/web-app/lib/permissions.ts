export type Role = 'student' | 'instructor' | 'admin' | 'superadmin';

export const PERMISSIONS: Record<string, Role[]> = {
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

export const PERMISSION_GROUPS: { key: string; label: string; permissions: string[] }[] = [
  { key: 'student-default', label: 'Student Default', permissions: ['course.read', 'analytics.view.own'] },
  { key: 'instructor-default', label: 'Instructor Default', permissions: ['course.read', 'course.manage.own', 'builder.access', 'community.moderate.own', 'analytics.view.own'] },
  { key: 'admin-ops', label: 'Admin Operations', permissions: ['course.manage.any', 'orders.manage.any', 'community.moderate.any', 'analytics.view.global', 'admin.panel'] },
  { key: 'superadmin-core', label: 'Super Admin Core', permissions: ['rbac.manage'] },
];

export function can(roles: Role[] | undefined, permission: string): boolean {
  if (!roles || roles.length === 0) return false;
  const allowed = PERMISSIONS[permission] || [];
  return roles.some((r) => allowed.includes(r));
}

