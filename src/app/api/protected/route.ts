// src/app/api/protected/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const { user, session } = await requireAuth();
    return NextResponse.json({
      ok: true,
      user,
      session: { id: session.id, expiresAt: session.expiresAt },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
    // Generic fallback
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
