import Link from 'next/link'
import { signOut } from '@/lib/auth-actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-lg">Admin Warung</span>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        <Link href="/admin/produk" className="text-sm text-gray-600 hover:text-blue-600">Kelola Produk</Link>
        <Link href="/admin/transaksi" className="text-sm text-gray-600 hover:text-blue-600">Transaksi & Void</Link>
        <div className="flex-1" />
        <form action={signOut}>
          <button type="submit" className="text-sm text-red-600 hover:underline">Logout</button>
        </form>
      </nav>
      <main>{children}</main>
    </div>
  )
}