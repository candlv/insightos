import LogoutButton from '@/components/LogoutButton';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to InsightOS</h1>
        <p className="text-sm text-gray-600">You are signed in. Use the button below to log out.</p>
        <div>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
