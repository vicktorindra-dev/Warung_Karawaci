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