'use client'
import { useState, useEffect, useMemo } from 'react'
import { getActiveProducts, submitTransaction } from './actions'
import { signOut } from '@/lib/auth-actions'

export default function KasirPage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getActiveProducts().then(setProducts)
  }, [])

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.qty + 1 > product.stock) return alert('Stok tidak cukup!')
      setCart(cart.map(item => item.product_id === product.id ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price } : item))
    } else {
      setCart([...cart, { product_id: product.id, product_name: product.name, price: product.price, qty: 1, subtotal: product.price }])
    }
  }

  const updateQty = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId)
    setCart(prev => prev
      .map(item => {
        if (item.product_id !== productId) return item
        const newQty = item.qty + delta
        if (delta > 0 && product && newQty > product.stock) {
          alert('Stok tidak cukup!')
          return item
        }
        return { ...item, qty: newQty, subtotal: newQty * item.price }
      })
      .filter(item => item.qty > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
      await submitTransaction(total, cart)
      alert('Transaksi Berhasil!')
      setCart([])
      getActiveProducts().then(setProducts)
    } catch (error: any) {
      alert('Gagal: ' + error.message)
    }
    setLoading(false)
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
  }, [products, search])

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of filteredProducts) {
      const cat = p.category || 'Lainnya'
      if (!map[cat]) map[cat] = []
      map[cat].push(p)
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredProducts])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <span className="font-bold">Kasir Warung</span>
        <button onClick={() => signOut()} className="text-sm text-red-600 hover:underline">Logout</button>
      </header>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Daftar Produk */}
        <div className="flex-1 md:w-2/3 p-4 bg-gray-100 overflow-y-auto min-h-0">
          <h2 className="text-xl font-bold mb-3">Pilih Produk</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk atau kategori..."
            className="w-full mb-4 border rounded px-3 py-2 bg-white"
          />

          {grouped.length === 0 && (
            <div className="text-gray-500 text-sm">Tidak ada produk ditemukan.</div>
          )}

          {grouped.map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {items.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="p-3 sm:p-4 bg-white rounded shadow text-left hover:border-blue-500 border-2 border-transparent active:scale-95 transition-transform">
                    <div className="font-semibold text-sm sm:text-base">{p.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Rp {p.price.toLocaleString('id-ID')} | Stok: {p.stock}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Keranjang */}
        <div className="h-[45vh] md:h-auto md:w-1/3 bg-white border-t md:border-t-0 md:border-l flex flex-col shrink-0">
          <div className="p-4 pb-2">
            <h2 className="text-xl font-bold">Keranjang</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            {cart.length === 0 && (
              <div className="text-sm text-gray-400 py-4">Keranjang masih kosong.</div>
            )}
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-2 mb-2 pb-2 border-b">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.product_name}</div>
                  <div className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold leading-none">−</button>
                  <span className="w-5 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold leading-none">+</button>
                </div>
                <div className="w-20 text-right text-sm font-medium shrink-0">Rp {item.subtotal.toLocaleString('id-ID')}</div>
                <button onClick={() => removeFromCart(item.product_id)} aria-label="Hapus" className="shrink-0 w-7 h-7 rounded text-red-500 hover:bg-red-50 text-lg leading-none">×</button>
              </div>
            ))}
          </div>
          <div className="p-4 pt-3 border-t shrink-0">
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>Total</span>
              <span>Rp {cart.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Selesaikan Transaksi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}