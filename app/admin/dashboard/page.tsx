import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const sales = await prisma.sale.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Laporan Penjualan</h1>
      <div className="grid gap-4">
        {sales.map(sale => (
          <div key={sale.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between mb-3 border-b pb-2">
              <div>
                <span className="text-gray-500 block text-sm">Waktu Transaksi</span>
                <span className="font-semibold">{sale.createdAt.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600 block text-lg">Total: Rp {sale.totalAmount}</span>
                <span className="text-sm text-gray-500">Kasir: {sale.cashierName}</span>
              </div>
            </div>
            <ul className="list-disc pl-5 text-gray-700">
              {sale.items.map(item => (
                <li key={item.id}>
                  {item.product.name} — {item.quantity} x Rp {item.price}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sales.length === 0 && <p className="text-gray-500">Belum ada transaksi.</p>}
      </div>
    </div>
  );
}