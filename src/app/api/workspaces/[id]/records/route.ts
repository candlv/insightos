import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import type { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';

// GET (VIEWER+) — list records with basic paging/search
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = await params;

  try {
    await requireRole(workspaceId, Role.VIEWER);

    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get('pageSize') || '20', 10), 1),
      100,
    );
    const q = (url.searchParams.get('q') || '').trim();

    const containsInsensitive = q ? { contains: q, mode: 'insensitive' as const } : undefined;

    const where: Prisma.RecordWhereInput = {
      workspaceId,
      ...(containsInsensitive
        ? { OR: [{ title: containsInsensitive }, { content: containsInsensitive }] }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.record.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.record.count({ where }),
    ]);

    return Response.json({ ok: true, page, pageSize, total, items });
  } catch (err) {
    const msg = (err as Error).message || 'INTERNAL';
    if (msg === 'UNAUTHORIZED') {
      return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (msg === 'FORBIDDEN') {
      return new Response(JSON.stringify({ ok: false, error: 'FORBIDDEN' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }
    console.error('GET /workspaces/:id/records error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

// POST (EDITOR+) — create a record
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = await params;

  try {
    await requireRole(workspaceId, Role.EDITOR);

    const body = await req.json().catch(() => null);
    if (!body || typeof body.title !== 'string' || typeof body.content !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const title = body.title.trim();
    const content = body.content.trim();
    if (!title) {
      return new Response(JSON.stringify({ ok: false, error: 'TITLE_REQUIRED' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const record = await prisma.record.create({
      data: { workspaceId, title, content },
    });

    return new Response(JSON.stringify({ ok: true, record }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    const msg = (err as Error).message || 'INTERNAL';
    if (msg === 'UNAUTHORIZED') {
      return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (msg === 'FORBIDDEN') {
      return new Response(JSON.stringify({ ok: false, error: 'FORBIDDEN' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }
    console.error('POST /records error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
