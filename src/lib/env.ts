// src/lib/env.ts
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'insightos.sid';

export const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);

// Useful later if we need absolute URLs.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const IS_PROD = process.env.NODE_ENV === 'production';
