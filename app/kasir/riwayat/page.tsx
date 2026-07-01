'use client'
import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { getMyTransactions } from '../actions'
import { formatTransactionId } from '@/lib/format'

export default function RiwayatTransaksiKasirPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    getMyTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 max-w-4xl mx-auto">

        <Link href="/kasir" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          ← Kembali ke Kasir
        </Link>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded p-3 mb-4">
          Halaman ini hanya untuk melihat riwayat transaksi. Jika ada transaksi yang perlu dibatalkan,
          catat <strong>ID Transaksi</strong>-nya dan sampaikan ke admin untuk diproses void.
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">ID Transaksi</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Memuat riwayat...</td></tr>
              )}
              {!loading && transactions.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada transaksi.</td></tr>
              )}
              {transactions.map(t => (
                <Fragment key={t.id}>
                  <tr
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    <td className="p-3 font-mono text-xs" title={t.id}>{formatTransactionId(t.id)}</td>
                    <td className="p-3">{new Date(t.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                    <td className="p-3 font-medium">Rp {Number(t.total_amount).toLocaleString('id-ID')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'void' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {t.status === 'void' ? 'Void' : 'Selesai'}
                      </span>
                      {t.status === 'void' && t.void_reason && (
                        <div className="text-xs text-gray-500 mt-1">Alasan: {t.void_reason}</div>
                      )}
                    </td>
                  </tr>
                  {expandedId === t.id && (
                    <tr className="bg-gray-50 border-t">
                      <td colSpan={4} className="p-3">
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
    </div>
  )
}