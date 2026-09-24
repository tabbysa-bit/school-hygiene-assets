import { User } from 'firebase/auth';

/**
 * Superadmin emails and UID allowlist
 */
export const ADMIN_EMAILS: string[] = [
  'tabbysa@penz.kr'
];

/**
 * Checks if the current Firebase user has administrator rights.
 * Centrally controlled in one place.
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }
  // Allow test / local development admin accounts if email starts with admin@
  if (user.email && user.email.startsWith('admin@')) {
    return true;
  }
  return false;
}
