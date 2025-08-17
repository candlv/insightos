// src/lib/session.ts
import crypto from 'crypto';
import { parse as parseCookie } from 'cookie';
import { prisma } from './prisma';
import { IS_PROD, SESSION_COOKIE_NAME, SESSION_MAX_AGE_DAYS } from './env';

const DAY_MS = 24 * 60 * 60 * 1000;

export function generateSessionToken(): string {
  // 32 bytes -> 64 hex chars (good entropy)
  return crypto.randomBytes(32).toString('hex');
}

export function computeExpiry(days = SESSION_MAX_AGE_DAYS): Date {
  return new Date(Date.now() + days * DAY_MS);
}

export function buildSessionCookie(token: string, expiresAt: Date) {
  // NextResponse.cookies.set accepts this shape
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
    maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  };
}

/** Create a DB session row and return { token, expiresAt } */
export async function createSession(userId: string) {
  const token = generateSessionToken();
  const expiresAt = computeExpiry();
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
  return { token, expiresAt };
}

/** Read session from Request cookies and return { session, user } or null */
export async function getSessionFromRequest(req: Request) {
  const header = req.headers.get('cookie') ?? '';
  const jar = parseCookie(header);
  const token = jar[SESSION_COOKIE_NAME];
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    // best-effort cleanup
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return { session, user: session.user };
}

/** Delete session by token (no-throw). Returns boolean found */
export async function destroySession(token: string) {
  try {
    await prisma.session.delete({ where: { token } });
    return true;
  } catch {
    return false;
  }
}
