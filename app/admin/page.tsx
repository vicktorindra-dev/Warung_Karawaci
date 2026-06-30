import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Selamat Datang Admin</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/produk" className="block p-5 bg-white border rounded-lg shadow hover:border-blue-500">
          <div className="font-semibold mb-1">Kelola Produk</div>
          <div className="text-sm text-gray-500">Tambah produk, update harga & stok</div>
        </Link>
        <Link href="/admin/transaksi" className="block p-5 bg-white border rounded-lg shadow hover:border-blue-500">
          <div className="font-semibold mb-1">Transaksi & Void</div>
          <div className="text-sm text-gray-500">Lihat riwayat transaksi, batalkan jika salah input</div>
        </Link>
      </div>
    </div>
  )
}