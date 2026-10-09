import { auth } from '@/auth';

export type PermissionKey =
  | 'vehicles'
  | 'bookings'
  | 'calendar'
  | 'customers'
  | 'payments'
  | 'revenue'
  | 'reviews'
  | 'messages';

/**
 * Asserts that the currently logged-in user is authenticated and has the required permission.
 * - ADMIN has all permissions unconditionally.
 * - STAFF must have the specific permission in their staffPermissions list.
 * Throws an Error if unauthorized.
 */
export async function requirePermission(permission?: PermissionKey) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Vous devez être connecté pour effectuer cette action.');
  }

  const role = (session.user as any)?.role;

  if (role === 'ADMIN') {
    return session.user;
  }

  if (role === 'STAFF') {
    if (!permission) {
      return session.user;
    }
    const staffPermissions: string = (session.user as any)?.staffPermissions || '';
    const perms = staffPermissions.split(',').map((p: string) => p.trim());
    if (perms.includes(permission) || perms.includes('all')) {
      return session.user;
    }
    throw new Error(`Accès refusé : vous n'avez pas la permission de gérer ce module (${permission}).`);
  }

  throw new Error('Accès réservé aux administrateurs et collaborateurs autorisés.');
}

/**
 * Checks if the current user has a specific permission without throwing.
 */
export async function hasPermission(permission: PermissionKey): Promise<boolean> {
  try {
    await requirePermission(permission);
    return true;
  } catch {
    return false;
  }
}
