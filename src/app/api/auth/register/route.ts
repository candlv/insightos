// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { buildSessionCookie, createSession } from '@/lib/session';
import { ensureDefaultWorkspace } from '@/lib/workspace';

function isValidEmail(email: string) {
  // minimal sanity check; full Zod schema will come later (Phase 8)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const rawPassword = String(body.password ?? '');

    // Basic validation
    if (!isValidEmail(rawEmail)) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_EMAIL', message: 'Email is invalid.' },
        { status: 400 },
      );
    }
    if (rawPassword.length < 8) {
      return NextResponse.json(
        { ok: false, code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters.' },
        { status: 400 },
      );
    }

    // Ensure email not taken
    const existing = await prisma.user.findUnique({ where: { email: rawEmail } });
    if (existing) {
      return NextResponse.json(
        { ok: false, code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    // Create user
    const password = await hashPassword(rawPassword);
    const user = await prisma.user.create({
      data: { email: rawEmail, password },
      select: { id: true, email: true },
    });

    await ensureDefaultWorkspace(user.id);

    // Create session + cookie
    const { token, expiresAt } = await createSession(user.id);
    const cookie = buildSessionCookie(token, expiresAt);

    const res = NextResponse.json({
      ok: true,
      user,
      session: { expiresAt },
    });
    res.cookies.set(cookie);
    return res;
  } catch (err: any) {
    // Prisma unique constraint safety (future: map P2002 precisely)
    return NextResponse.json(
      { ok: false, code: 'INTERNAL_ERROR', message: 'Unexpected error.' },
      { status: 500 },
    );
  }
}
