import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex gap-4">
        <div className="font-bold mr-4">Admin Panel</div>
        <Link href="/admin/dashboard" className="hover:text-blue-300">Laporan Penjualan</Link>
        <Link href="/admin/products" className="hover:text-blue-300">Kelola Barang</Link>
        <Link href="/" className="ml-auto hover:text-red-300">Logout</Link>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}