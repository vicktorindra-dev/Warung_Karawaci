'use client'
import { useState, useEffect, useMemo } from 'react'
import { getActiveProducts, submitTransaction } from './actions'

export default function KasirPage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uangDiterima, setUangDiterima] = useState('')
  const [cartHidden, setCartHidden] = useState(false)

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
      setUangDiterima('')
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

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const uangNum = parseInt(uangDiterima.replace(/\D/g, ''), 10) || 0
  const kembalian = uangNum - total

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Daftar Produk */}
        <div className="flex-1 md:w-2/3 p-3 bg-gray-100 overflow-y-auto min-h-0">
          <h2 className="text-base font-bold mb-2">Pilih Produk</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk atau kategori..."
            className="w-full mb-3 border rounded px-3 py-1.5 bg-white text-sm"
          />

          {grouped.length === 0 && (
            <div className="text-gray-500 text-sm">Tidak ada produk ditemukan.</div>
          )}

          {grouped.map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{category}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="p-2.5 bg-white rounded shadow text-left hover:border-blue-500 border-2 border-transparent active:scale-95 transition-transform">
                    <div className="font-semibold text-xs sm:text-sm leading-snug">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Rp {p.price.toLocaleString('id-ID')} · Stok: {p.stock}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Keranjang */}
        <div className="max-h-[50dvh] md:max-h-none md:h-auto md:w-[280px] bg-[#edf7f0] border-t md:border-t-0 md:border-l flex flex-col shrink-0">
          <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold">Keranjang{cart.length > 0 ? ` (${cart.length})` : ''}</h2>
            <button
              onClick={() => setCartHidden(h => !h)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {cartHidden ? 'Tampilkan' : 'Sembunyikan'}
            </button>
          </div>

          {!cartHidden && (
            <div className="flex-1 overflow-y-auto px-3 py-1 min-h-0">
              {cart.length === 0 && (
                <div className="text-xs text-gray-400 py-3">Keranjang masih kosong.</div>
              )}
              {cart.map(item => (
                <div key={item.product_id} className="flex items-start gap-1.5 py-1.5 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs leading-snug">{item.product_name}</div>
                    <div className="text-xs text-gray-400">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-white hover:bg-gray-100 font-bold text-xs leading-none">−</button>
                    <span className="w-4 text-center text-xs">{item.qty}</span>
                    <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-white hover:bg-gray-100 font-bold text-xs leading-none">+</button>
                  </div>
                  <div className="text-xs font-medium w-16 text-right shrink-0 mt-0.5">Rp {item.subtotal.toLocaleString('id-ID')}</div>
                  <button onClick={() => removeFromCart(item.product_id)} aria-label="Hapus" className="shrink-0 w-5 h-5 rounded text-red-400 hover:bg-red-100 text-sm leading-none mt-0.5">×</button>
                </div>
              ))}
            </div>
          )}

          {cartHidden && (
            <div className="px-3 py-2 text-xs text-gray-400 shrink-0">
              {cart.length === 0 ? 'Keranjang masih kosong.' : `${cart.length} produk disembunyikan.`}
            </div>
          )}

          <div className="px-3 py-2 border-t shrink-0 bg-[#edf7f0]">
            <div className="flex justify-between font-bold text-sm mb-2">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>

            {/* Uang yang diterima (opsional) */}
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-gray-500 font-normal shrink-0">Uang yang diterima</label>
              <input
                type="text"
                inputMode="numeric"
                value={uangDiterima}
                onChange={e => setUangDiterima(e.target.value.replace(/\D/g, ''))}
                placeholder="Opsional"
                className="w-full border rounded px-2 py-1 text-base md:text-xs font-normal text-right bg-white"
              />
            </div>

            {/* Kembalian — hanya tampil jika uang diisi */}
            {uangNum > 0 && (
              <div className="flex justify-between text-xs font-normal mb-8">
                <span className="text-gray-500">Kembalian</span>
                <span className={kembalian >= 0 ? 'text-yellow-500' : 'text-red-500'}>
                  Rp {kembalian.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {uangNum === 0 && <div className="mb-8" />}

            <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full bg-green-600 text-white py-2 rounded font-bold text-sm hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Selesaikan Transaksi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}