import Link from 'next/link';

export const metadata = { title: 'Sign in | InsightOS' };

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-gray-600">
          New here?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

import LoginForm from './LoginForm';
