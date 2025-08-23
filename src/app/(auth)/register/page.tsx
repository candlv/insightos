import Link from 'next/link';
import RegisterForm from './RegisterForm';

export const metadata = { title: 'Register | InsightOS' };

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
