'use client'
import { useState, useEffect, useMemo } from 'react'
import { getTransactionsForDashboard, getProducts, getSetting, saveSetting } from './actions'
import { getJakartaParts, wibBoundaryUtc, shiftDateKey, formatJakartaDateShort } from '@/lib/format'

const CHART_RANGE_SETTING_KEY = 'dashboard_chart_range_days'
const RANGE_OPTIONS = [7, 14, 30, 60, 90]

function rupiah(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

// Label tanggal WIB yang enak dibaca, mis. "1 Jul 08:00"
function labelWib(date: Date) {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'hari' | 'minggu' | 'bulan'>('hari')
  const [chartRange, setChartRange] = useState<number>(30)
  const [rangeLoaded, setRangeLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      getTransactionsForDashboard(),
      getProducts(),
      getSetting(CHART_RANGE_SETTING_KEY),
    ]).then(([tx, prod, savedRange]) => {
      setTransactions(tx)
      setProducts(prod)
      if (savedRange && RANGE_OPTIONS.includes(Number(savedRange))) {
        setChartRange(Number(savedRange))
      }
      setRangeLoaded(true)
    }).finally(() => setLoading(false))
  }, [])

  const handleChangeRange = (days: number) => {
    setChartRange(days)
    // auto-save, tidak perlu tombol simpan — biar tidak usah diatur ulang tiap buka dashboard
    saveSetting(CHART_RANGE_SETTING_KEY, days).catch(() => {})
  }

  // Hanya transaksi yang tidak di-void yang dihitung sebagai penjualan/keuntungan.
  const activeTransactions = useMemo(
    () => transactions.filter(t => t.status !== 'void'),
    [transactions]
  )

  const sumInRange = (start: Date, end: Date) => {
    let total = 0
    for (const t of activeTransactions) {
      const created = new Date(t.created_at.endsWith('Z') ? t.created_at : t.created_at + 'Z')
      if (created >= start && created < end) total += Number(t.total_amount)
    }
    return total
  }

  const dashboardData = useMemo(() => {
    const nowParts = getJakartaParts(new Date().toISOString())
    if (!nowParts) return null
    const { dateKey: todayKey, hour: currentHour } = nowParts

    // Shift Pagi: selalu 08:00–20:00 WIB hari ini.
    const shiftPagiStart = wibBoundaryUtc(todayKey, 8)
    const shiftPagiEnd = wibBoundaryUtc(todayKey, 20)
    const shiftPagiTotal = sumInRange(shiftPagiStart, shiftPagiEnd)

    // Shift Malam: shift 20:00–08:00 yang sedang berjalan / baru saja selesai.
    let shiftMalamStart: Date, shiftMalamEnd: Date
    if (currentHour < 8) {
      shiftMalamStart = wibBoundaryUtc(shiftDateKey(todayKey, -1), 20)
      shiftMalamEnd = wibBoundaryUtc(todayKey, 8)
    } else {
      shiftMalamStart = wibBoundaryUtc(todayKey, 20)
      shiftMalamEnd = wibBoundaryUtc(shiftDateKey(todayKey, 1), 8)
    }
    const shiftMalamTotal = sumInRange(shiftMalamStart, shiftMalamEnd)

    // Keuntungan hari ini: 00:00–23:59 WIB.
    const todayStart = wibBoundaryUtc(todayKey, 0)
    const todayEnd = wibBoundaryUtc(shiftDateKey(todayKey, 1), 0)
    const todayTotal = sumInRange(todayStart, todayEnd)

    // Minggu ini & bulan ini dihitung rolling (7 & 30 hari terakhir termasuk hari ini) —
    // supaya tidak ambigu soal minggu mulai hari apa.
    const weekTotal = sumInRange(wibBoundaryUtc(shiftDateKey(todayKey, -6), 0), todayEnd)
    const monthTotal = sumInRange(wibBoundaryUtc(shiftDateKey(todayKey, -29), 0), todayEnd)

    // Data harian untuk grafik, sepanjang chartRange hari terakhir (termasuk hari ini).
    const dailyChart: { dateKey: string; label: string; total: number }[] = []
    for (let i = chartRange - 1; i >= 0; i--) {
      const dKey = shiftDateKey(todayKey, -i)
      const dStart = wibBoundaryUtc(dKey, 0)
      const dEnd = wibBoundaryUtc(shiftDateKey(dKey, 1), 0)
      const total = sumInRange(dStart, dEnd)
      const label = new Date(dKey + 'T00:00:00Z').toLocaleDateString('id-ID', { timeZone: 'UTC', day: '2-digit', month: 'short' })
      dailyChart.push({ dateKey: dKey, label, total })
    }

    return {
      shiftPagiTotal, shiftPagiStart, shiftPagiEnd,
      shiftMalamTotal, shiftMalamStart, shiftMalamEnd,
      todayTotal, weekTotal, monthTotal,
      dailyChart,
    }
  }, [activeTransactions, chartRange])

  const lowStockProducts = useMemo(
    () => products.filter(p => p.is_active !== false && Number(p.stock) < 5).sort((a, b) => a.stock - b.stock),
    [products]
  )

  const periodTotal = period === 'hari' ? dashboardData?.todayTotal
    : period === 'minggu' ? dashboardData?.weekTotal
    : dashboardData?.monthTotal

  const periodLabel = period === 'hari' ? 'Hari Ini (00:00–23:59)'
    : period === 'minggu' ? '7 Hari Terakhir'
    : '30 Hari Terakhir'

  const maxChartValue = Math.max(1, ...(dashboardData?.dailyChart.map(d => d.total) || [1]))

  if (loading || !dashboardData) {
    return <div className="p-6 max-w-5xl mx-auto text-gray-500">Memuat dashboard...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Total penjualan per shift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Shift Pagi (08:00–20:00)</div>
          <div className="text-xs text-gray-400 mb-2">{labelWib(dashboardData.shiftPagiStart)} – {labelWib(dashboardData.shiftPagiEnd)}</div>
          <div className="text-2xl font-bold">{rupiah(dashboardData.shiftPagiTotal)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Shift Malam (20:00–08:00)</div>
          <div className="text-xs text-gray-400 mb-2">{labelWib(dashboardData.shiftMalamStart)} – {labelWib(dashboardData.shiftMalamEnd)}</div>
          <div className="text-2xl font-bold">{rupiah(dashboardData.shiftMalamTotal)}</div>
        </div>
      </div>

      {/* Keuntungan (kotor) dengan pilihan periode */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="text-sm text-gray-500">Keuntungan (Kotor) — {periodLabel}</div>
          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
            {[
              { key: 'hari', label: 'Hari Ini' },
              { key: 'minggu', label: 'Mingguan' },
              { key: 'bulan', label: 'Bulanan' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key as any)}
                className={`px-3 py-1 text-xs font-medium rounded ${period === opt.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-3xl font-bold text-green-700">{rupiah(periodTotal || 0)}</div>
        <div className="text-xs text-gray-400 mt-1">Dihitung dari harga jual apa adanya (belum dikurangi harga modal), transaksi void tidak dihitung.</div>
      </div>

      {/* Grafik keuntungan harian */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="text-sm font-medium text-gray-700">Grafik Keuntungan Harian</div>
          <select
            value={chartRange}
            onChange={e => handleChangeRange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            {RANGE_OPTIONS.map(d => (
              <option key={d} value={d}>{d} hari terakhir</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-[2px] h-40 overflow-x-auto">
          {dashboardData.dailyChart.map(d => (
            <div key={d.dateKey} className="flex flex-col items-center justify-end h-full group relative" style={{ minWidth: chartRange > 45 ? 6 : chartRange > 20 ? 12 : 20 }}>
              <div className="absolute -top-7 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                {d.label}: {rupiah(d.total)}
              </div>
              <div
                className="w-full bg-green-500 hover:bg-green-600 rounded-t"
                style={{ height: `${Math.max(2, (d.total / maxChartValue) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{dashboardData.dailyChart[0]?.label}</span>
          <span>{dashboardData.dailyChart[dashboardData.dailyChart.length - 1]?.label}</span>
        </div>
      </div>

      {/* Stok menipis */}
      <div className="bg-white border rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Stok Menipis (di bawah 5 pcs)</div>
        {lowStockProducts.length === 0 ? (
          <div className="text-sm text-gray-400">Semua stok aman.</div>
        ) : (
          <div className="divide-y">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span>{p.name}</span>
                <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock} {p.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}