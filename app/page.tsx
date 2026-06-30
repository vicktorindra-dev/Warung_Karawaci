import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="bg-emerald-600 text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">🛒 Warung Karawaci POS</h1>
        <div className="text-sm bg-emerald-700 px-4 py-1.5 rounded-full font-medium">
          Kasir Aktif: Admin
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Panel Kiri: Daftar Menu */}
        <section className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Menu Tersedia</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            
            {/* Kartu Produk 1 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="h-28 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-4xl">🍜</div>
              <h3 className="font-semibold text-gray-800">Indomie Goreng</h3>
              <p className="text-emerald-600 font-bold mt-1">Rp 6.000</p>
            </div>

            {/* Kartu Produk 2 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="h-28 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-4xl">☕</div>
              <h3 className="font-semibold text-gray-800">Kopi Hitam</h3>
              <p className="text-emerald-600 font-bold mt-1">Rp 4.000</p>
            </div>

            {/* Kartu Produk 3 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="h-28 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-4xl">🧊</div>
              <h3 className="font-semibold text-gray-800">Es Teh Manis</h3>
              <p className="text-emerald-600 font-bold mt-1">Rp 3.000</p>
            </div>

          </div>
        </section>

        {/* Panel Kanan: Struk / Keranjang Pesanan */}
        <aside className="w-1/3 bg-white shadow-2xl border-l border-gray-100 p-6 flex flex-col z-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Pesanan Saat Ini</h2>
          
          {/* Area Daftar Pesanan */}
          <div className="flex-1 overflow-y-auto mb-4 border-b border-gray-100 pb-4">
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div>
                <h4 className="font-semibold text-gray-800">Indomie Goreng</h4>
                <p className="text-sm text-gray-500">2 x Rp 6.000</p>
              </div>
              <p className="font-bold text-gray-800">Rp 12.000</p>
            </div>
          </div>

          {/* Area Total & Tombol Bayar */}
          <div className="mt-auto pt-4">
            <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
              <span>Total</span>
              <span className="text-emerald-600">Rp 12.000</span>
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg active:scale-95">
              Proses Pembayaran
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}