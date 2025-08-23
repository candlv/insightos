// src/app/api/workspaces/[id]/members/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { $Enums } from '@prisma/client';

// Next.js 15+: params is a Promise and must be awaited.
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  // Ensure auth (your requireRole likely also checks, but keep this explicit)
  await requireAuth();

  const { id: workspaceId } = await params;

  // OWNER-only endpoint
  try {
    await requireRole(workspaceId, $Enums.Role.OWNER);
  } catch (error) {
    return Response.json(
      { ok: false, code: 'FORBIDDEN', message: 'Owner role required' },
      { status: 403 },
    );
  }

  // Include user so TS knows `user` exists; sort by user email for stability
  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, email: true } },
    },
    orderBy: {
      user: { email: 'asc' },
    },
  });

  const members: { id: string; email: string; role: $Enums.Role }[] = memberships.map(
    ({ role, user }) => ({
      id: user.id,
      email: user.email,
      role,
    }),
  );

  return Response.json({ ok: true, members }, { status: 200 });
}
