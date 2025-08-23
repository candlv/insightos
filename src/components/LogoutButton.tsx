'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    setLoading(false);
    if (res.ok) router.push('/login');
    else alert('Logout failed. Please try again.');
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
      aria-label="Log out"
    >
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  );
}
