// src/app/w/page.tsx
import { redirect } from 'next/navigation';
import { getActiveWorkspaceId } from '@/lib/active-workspace';

export default async function WIndex() {
  const id = await getActiveWorkspaceId();
  if (id) redirect(`/w/${id}`);
  redirect('/login');
}
