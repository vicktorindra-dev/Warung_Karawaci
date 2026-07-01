import Link from 'next/link'
import { signOut } from '@/lib/auth-actions'

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen h-dvh">
      <nav className="bg-white border-b px-6 py-3 flex items-center gap-6 shrink-0">
        <span className="font-bold text-lg">Kasir Warung</span>
        <Link href="/kasir" className="text-sm text-gray-600 hover:text-blue-600">Kasir</Link>
        <Link href="/kasir/riwayat" className="text-sm text-gray-600 hover:text-blue-600">Riwayat Transaksi</Link>
        <div className="flex-1" />
        <form action={signOut}>
          <button type="submit" className="text-sm text-red-600 hover:underline">Logout</button>
        </form>
      </nav>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}