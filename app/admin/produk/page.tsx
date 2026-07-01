'use client'
import { useState, useEffect } from 'react'
import { getProducts, addOrUpdateProduct, toggleProductActive } from '../actions'

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  is_active: boolean
}

const emptyForm = { id: '', name: '', category: '', price: '', stock: '', unit: 'pcs', is_active: true }

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)

  const loadProducts = () => {
    setLoadingList(true)
    getProducts()
      .then(setProducts)
      .finally(() => setLoadingList(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category || '',
      price: String(p.price),
      stock: String(p.stock),
      unit: p.unit,
      is_active: p.is_active,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => setForm(emptyForm)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      if (form.id) fd.set('id', form.id)
      fd.set('name', form.name)
      fd.set('category', form.category)
      fd.set('price', form.price)
      fd.set('stock', form.stock)
      fd.set('unit', form.unit)
      fd.set('is_active', String(form.is_active))

      await addOrUpdateProduct(fd)
      setForm(emptyForm)
      loadProducts()
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message)
    }
    setLoading(false)
  }

  const handleToggle = async (p: Product) => {
    try {
      await toggleProductActive(p.id, !p.is_active)
      loadProducts()
    } catch (err: any) {
      alert('Gagal mengubah status: ' + err.message)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kelola Produk</h1>

      {/* Form Tambah / Edit */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-8 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <datalist id="category-options">
          {Array.from(new Set(
            products.flatMap(p => (p.category || '').split(',').map(c => c.trim()).filter(Boolean))
          )).sort().map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Nama Produk</label>
          <input
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Contoh: Indomie Goreng"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <input
            required
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Mie Instan, Mie Cup"
            list="category-options"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stok</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Satuan</label>
          <input
            required
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="pcs / kg / botol"
          />
        </div>

        <div className="md:col-span-6 -mt-1 text-xs text-gray-400">
          Kategori bisa diisi lebih dari satu, pisahkan dengan koma (misal "Mie Instan, Mie Cup"). Produk akan muncul di semua kategori itu, dengan stok yang tetap sama.
        </div>

        <div className="md:col-span-6 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
            />
            Aktif (tampil di kasir)
          </label>

          <div className="flex-1" />

          {form.id && (
            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded border">
              Batal Edit
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : form.id ? 'Update Produk' : 'Tambah Produk'}
          </button>
        </div>
      </form>

      {/* Daftar Produk */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Satuan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingList && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">Memuat produk...</td></tr>
            )}
            {!loadingList && products.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">Belum ada produk.</td></tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(p.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
                      <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.unit}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleToggle(p)} className="text-gray-600 hover:underline">
                    {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}