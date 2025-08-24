import { redirect } from 'next/navigation';
import { getActiveWorkspaceId } from '@/lib/active-workspace';

export default async function HomePage() {
  const wsId = await getActiveWorkspaceId();
  if (wsId) {
    redirect(`/w/${wsId}`);
  }
  redirect('/login');
}
