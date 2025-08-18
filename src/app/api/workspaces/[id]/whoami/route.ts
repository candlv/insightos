// src/app/api/workspaces/[id]/whoami/route.ts
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/rbac';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  try {
    const { id: workspaceId } = await ctx.params; // ⬅️ await params

    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'BAD_REQUEST' }, { status: 400 });
    }

    const { auth, membership } = await requireRole(workspaceId, Role.VIEWER);

    return NextResponse.json({
      ok: true,
      user: auth.user,
      membership: { id: membership.id, role: membership.role },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
