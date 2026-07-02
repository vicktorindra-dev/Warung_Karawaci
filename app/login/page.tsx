export default function LoginPage({ searchParams }: { searchParams?: { error?: string; email?: string } }) {
  const hasError = searchParams?.error === '1'

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form action="/api/login" method="POST" className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Warung</h1>

        {hasError && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            Email atau password salah. Silakan coba lagi.
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue={searchParams?.email || ''}
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full mb-6 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Masuk
        </button>
      </form>
    </div>
  )
}