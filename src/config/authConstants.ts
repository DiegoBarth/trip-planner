/** Constantes só de autenticação – importadas pelo App no bundle inicial (mantém constants.ts fora do critical path). */
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const AUTH_TIMEOUT_MS = MS_PER_DAY * 7;
export const AUTH_REFRESH_INTERVAL_MS = 5 * MS_PER_MINUTE;
