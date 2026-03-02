/** Authentication-only constants, imported by App in the initial bundle to keep constants.ts out of the critical path. */
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const AUTH_TIMEOUT_MS = MS_PER_DAY * 7;
export const AUTH_REFRESH_INTERVAL_MS = 5 * MS_PER_MINUTE;
