// src/app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'insightos.sid';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value || '';
    if (!token) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHENTICATED', message: 'No session.' },
        { status: 401 },
      );
    }

    // Load session + user; ensure not expired
    const session = await prisma.session.findUnique({
      where: { token },
      select: {
        token: true,
        expiresAt: true,
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHENTICATED', message: 'Session invalid or expired.' },
        { status: 401 },
      );
    }

    // Optionally include basic memberships to help routing (kept minimal for now)
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true, role: true },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      user: session.user,
      memberships,
    });
  } catch {
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
