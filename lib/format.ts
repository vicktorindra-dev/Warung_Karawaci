// Format ID transaksi supaya pendek & mudah disebutkan kasir ke admin,
// tapi tetap konsisten dipakai di halaman kasir maupun admin.
export function formatTransactionId(id: string) {
  if (!id) return '-'
  return '#' + id.slice(0, 8).toUpperCase()
}

// Kolom waktu di database (created_at, voided_at, dst) bertipe `timestamp` TANPA zona waktu.
// Nilai yang tersimpan sebenarnya sudah dalam UTC (karena sesi database pakai UTC), tapi
// string yang dikembalikan Supabase tidak punya akhiran 'Z'. Tanpa 'Z', browser salah
// mengira nilai itu adalah jam LOKAL device, bukan UTC — sehingga konversi ke WIB jadi keliru.
// Fungsi ini memastikan nilai tersebut selalu dibaca sebagai UTC lebih dulu, baru dikonversi
// ke waktu Jakarta (WIB) yang benar.
export function formatJakartaTime(rawTimestamp: string) {
  if (!rawTimestamp) return '-'
  const hasTimezoneSuffix = /Z$|[+-]\d{2}:?\d{2}$/.test(rawTimestamp)
  const isoUtc = hasTimezoneSuffix ? rawTimestamp : `${rawTimestamp}Z`
  return new Date(isoUtc).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

// Sama seperti formatJakartaTime tapi cuma tanggalnya saja (dipakai buat label grafik).
export function formatJakartaDateShort(rawTimestamp: string) {
  if (!rawTimestamp) return '-'
  const hasTimezoneSuffix = /Z$|[+-]\d{2}:?\d{2}$/.test(rawTimestamp)
  const isoUtc = hasTimezoneSuffix ? rawTimestamp : `${rawTimestamp}Z`
  return new Date(isoUtc).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short' })
}

// Mengurai timestamp UTC mentah dari database menjadi tanggal (dateKey, format YYYY-MM-DD)
// dan jam, keduanya dalam waktu Jakarta (WIB) — dipakai buat kelompokkan transaksi per hari/shift.
export function getJakartaParts(rawTimestamp: string) {
  if (!rawTimestamp) return null
  const hasTimezoneSuffix = /Z$|[+-]\d{2}:?\d{2}$/.test(rawTimestamp)
  const isoUtc = hasTimezoneSuffix ? rawTimestamp : `${rawTimestamp}Z`
  const date = new Date(isoUtc)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')) % 24, // beberapa environment mengembalikan '24' untuk tengah malam
    minute: Number(get('minute')),
  }
}

// dateKey (YYYY-MM-DD, WIB) + jam WIB -> Date object (instant UTC yang tepat).
// WIB = UTC+7 tetap, tidak ada DST, jadi ini aman dipakai kapan saja.
export function wibBoundaryUtc(dateKey: string, hourWib: number) {
  const d = new Date(`${dateKey}T00:00:00Z`)
  d.setUTCHours(d.getUTCHours() + (hourWib - 7))
  return d
}

// Geser dateKey (WIB) sejauh N hari (boleh negatif).
export function shiftDateKey(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}