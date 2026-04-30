// Login attempts tracker implementation
interface LoginAttemptEntry {
  attempts: number;
  lockedUntil?: number;
}

const loginAttemptsMap = new Map<string, LoginAttemptEntry>();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function getLoginTrackerMetrics() {
  let lockedAccounts = 0;
  const now = Date.now();
  
  loginAttemptsMap.forEach((entry) => {
    if (entry.lockedUntil && entry.lockedUntil > now) {
      lockedAccounts++;
    }
  });

  return {
    mapSize: loginAttemptsMap.size,
    lockedAccounts,
  };
}

export function recordLoginAttempt(identifier: string, success: boolean): boolean {
  const now = Date.now();
  const entry = loginAttemptsMap.get(identifier);

  if (success) {
    loginAttemptsMap.delete(identifier);
    return true;
  }

  if (!entry) {
    loginAttemptsMap.set(identifier, {
      attempts: 1,
    });
    return true;
  }

  // Check if account is locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return false;
  }

  // Increment attempts
  entry.attempts++;

  // Lock account if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_DURATION;
    return false;
  }

  return true;
}

export function isAccountLocked(identifier: string): boolean {
  const entry = loginAttemptsMap.get(identifier);
  if (!entry || !entry.lockedUntil) {
    return false;
  }

  const now = Date.now();
  if (entry.lockedUntil < now) {
    loginAttemptsMap.delete(identifier);
    return false;
  }

  return true;
}
