import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { Role } from '@prisma/client';

/** PATCH /api/records/:id  (EDITOR+) */
export async function PATCH(req: Request, { params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;

  try {
    const existing = await prisma.record.findUnique({
      where: { id: recordId },
      select: { id: true, workspaceId: true },
    });
    if (!existing) {
      return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    await requireRole(existing.workspaceId, Role.EDITOR);

    const body = await req.json().catch(() => null);
    if (!body || (typeof body.title !== 'string' && typeof body.content !== 'string')) {
      return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const data: { title?: string; content?: string } = {};
    if (typeof body.title === 'string') {
      const t = body.title.trim();
      if (!t) {
        return new Response(JSON.stringify({ ok: false, error: 'TITLE_REQUIRED' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }
      data.title = t;
    }
    if (typeof body.content === 'string') {
      data.content = body.content.trim();
    }

    const record = await prisma.record.update({ where: { id: recordId }, data });
    return new Response(JSON.stringify({ ok: true, record }), {
      status: 200,
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
    console.error('PATCH /records/:id error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

/** DELETE /api/records/:id  (EDITOR+) */
export async function DELETE(_req: Request, { params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;

  try {
    const existing = await prisma.record.findUnique({
      where: { id: recordId },
      select: { id: true, workspaceId: true },
    });
    if (!existing) {
      return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    await requireRole(existing.workspaceId, Role.EDITOR);

    await prisma.record.delete({ where: { id: recordId } });

    return new Response(JSON.stringify({ ok: true, deleted: true, id: recordId }), {
      status: 200,
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
    console.error('DELETE /records/:id error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'SERVER_ERROR' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
