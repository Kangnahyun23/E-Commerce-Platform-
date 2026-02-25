export function getRoleHomePath(role) {
  if (role === 'SELLER') return '/seller';
  if (role === 'STAFF') return '/staff';
  if (role === 'ADMIN') return '/admin';
  return '/';
}
