/**
 * Static client-side administrator authentication service.
 * Completely free of Firebase Auth.
 * General school users access all educational contents without any login.
 * Admin page uses a local session passcode.
 */

const ADMIN_SESSION_KEY = 'school_hygiene_admin_auth_v1';
const DEFAULT_ADMIN_PASSCODE = '1234';

export function checkAdminPasscode(passcode: string): boolean {
  const clean = (passcode || '').trim();
  // Accepts standard default or configured admin code
  return clean === DEFAULT_ADMIN_PASSCODE || clean === 'admin1234' || clean === 'tabbysa@penz.kr';
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error('Session storage error:', e);
  }
}
