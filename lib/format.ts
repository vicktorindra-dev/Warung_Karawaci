// Format ID transaksi supaya pendek & mudah disebutkan kasir ke admin,
// tapi tetap konsisten dipakai di halaman kasir maupun admin.
export function formatTransactionId(id: string) {
  if (!id) return '-'
  return '#' + id.slice(0, 8).toUpperCase()
}