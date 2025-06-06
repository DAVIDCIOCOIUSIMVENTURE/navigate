type Role = 'user' | 'admin' | 'superadmin';

export function requireRole(userRole: string, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole as Role);
}

export function requireOwnership(resourceUserId: string, currentUserId: string) {
  return resourceUserId === currentUserId;
}