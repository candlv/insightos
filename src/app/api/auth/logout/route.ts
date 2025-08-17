// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'insightos.sid';

function clearSessionCookie(res: NextResponse) {
  // Expire immediately; keep same attributes as login for consistency
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value || '';

    // Idempotent: try to delete, but success even if token missing/not found
    if (token) {
      await prisma.session.delete({ where: { token } }).catch(() => null); // ignore if already deleted
    }

    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  } catch {
    // Still clear the cookie on server errors to avoid a stuck client
    const res = NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Something went wrong.' },
      { status: 500 },
    );
    clearSessionCookie(res);
    return res;
  }
}
