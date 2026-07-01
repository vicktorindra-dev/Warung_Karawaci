'use client'
import { useState, useEffect, useMemo, Fragment } from 'react'
import { getTransactions, voidTransaction } from '../actions'
import { formatTransactionId } from '@/lib/format'

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [voidingId, setVoidingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getTransactions().then(setTransactions).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleVoid = async (id: string) => {
    const reason = prompt('Alasan void transaksi ini?')
    if (!reason) return
    setVoidingId(id)
    try {
      await voidTransaction(id, reason)
      load()
    } catch (err: any) {
      alert('Gagal void: ' + err.message)
    }
    setVoidingId(null)
  }

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^#/, '')
    if (!q) return transactions
    return transactions.filter(t => t.id.toLowerCase().includes(q))
  }, [transactions, search])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transaksi & Void</h1>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cari berdasarkan ID Transaksi (mis. dari laporan kasir)..."
        className="w-full mb-4 border rounded px-3 py-2 bg-white"
      />

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID Transaksi</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Kasir</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Memuat transaksi...</td></tr>
            )}
            {!loading && filteredTransactions.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">
                {transactions.length === 0 ? 'Belum ada transaksi.' : 'Tidak ditemukan transaksi dengan ID tersebut.'}
              </td></tr>
            )}
            {filteredTransactions.map(t => (
              <Fragment key={t.id}>
                <tr
                  className="border-t cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <td className="p-3 font-mono text-xs" title={t.id}>{formatTransactionId(t.id)}</td>
                  <td className="p-3">{new Date(t.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                  <td className="p-3">{t.cashier_name}</td>
                  <td className="p-3 font-medium">Rp {Number(t.total_amount).toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'void' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {t.status === 'void' ? 'Void' : 'Selesai'}
                    </span>
                    {t.status === 'void' && t.void_reason && (
                      <div className="text-xs text-gray-500 mt-1">Alasan: {t.void_reason}</div>
                    )}
                  </td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    {t.status !== 'void' && (
                      <button
                        onClick={() => handleVoid(t.id)}
                        disabled={voidingId === t.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {voidingId === t.id ? 'Memproses...' : 'Void'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === t.id && (
                  <tr className="bg-gray-50 border-t">
                    <td colSpan={6} className="p-3">
                      <div className="text-xs text-gray-500 mb-2">Detail Item:</div>
                      {(t.transaction_items || []).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <span>{item.product_name} x{item.qty}</span>
                          <span>Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}