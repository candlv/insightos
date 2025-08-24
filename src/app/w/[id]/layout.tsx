import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getWorkspaceContext } from '@/lib/workspace';
import { WorkspaceProvider } from './workspace-context';

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export default async function WorkspaceLayout({ children, params }: Props) {
  const { id } = await params;

  let role: Awaited<ReturnType<typeof getWorkspaceContext>>['role'];
  try {
    ({ role } = await getWorkspaceContext(id));
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw err;
  }

  if (!role) {
    notFound();
  }

  return <WorkspaceProvider value={{ workspaceId: id, role }}>{children}</WorkspaceProvider>;
}
