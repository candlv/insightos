// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password'; // uses your Phase 3.1 helper
import { ensureDefaultWorkspace } from '@/lib/workspace';

const SESSION_COOKIE = 'insightos.sid';
const SESSION_TTL_DAYS = 7;

function getClientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd && typeof fwd === 'string') {
    return fwd.split(',')[0]?.trim() || '0.0.0.0';
  }
  return '0.0.0.0';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    // Basic validation (tight zod schemas come in Phase 8.1)
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
        { status: 400 },
      );
    }

    // 1) Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    // Uniform 401 for not-found or wrong password
    if (!user) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    // 2) Verify password
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    await ensureDefaultWorkspace(user.id);

    // 3) Create session (rotate by default: optional cleanup can be added later)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        ip: getClientIp(req),
        userAgent: req.headers.get('user-agent') ?? '',
        expiresAt,
      },
    });

    // 4) Set httpOnly cookie
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return res;
  } catch (err) {
    console.error('LOGIN_ERROR', err);
    // Mask internal errors
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
