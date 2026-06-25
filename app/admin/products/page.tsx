import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });

  async function addProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const costPrice = Number(formData.get('costPrice'));
    const sellingPrice = Number(formData.get('sellingPrice'));
    const stock = Number(formData.get('stock'));

    await prisma.product.create({
      data: { name, costPrice, sellingPrice, stock }
    });
    revalidatePath('/admin/products');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kelola Barang & Stok</h1>
      
      <form action={addProduct} className="bg-white shadow-sm p-4 rounded mb-8 flex gap-4 items-end border">
        <div>
          <label className="block text-sm text-gray-600">Nama Barang</label>
          <input type="text" name="name" required className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Harga Modal</label>
          <input type="number" name="costPrice" required className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Harga Jual</label>
          <input type="number" name="sellingPrice" required className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Stok Awal</label>
          <input type="number" name="stock" required className="border p-2 w-full rounded" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Tambah</button>
      </form>

      <table className="w-full bg-white border shadow-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border">Nama Barang</th>
            <th className="p-3 border">Modal</th>
            <th className="p-3 border">Jual</th>
            <th className="p-3 border">Sisa Stok</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="text-center hover:bg-gray-50">
              <td className="p-3 border">{p.name}</td>
              <td className="p-3 border text-gray-600">Rp {p.costPrice}</td>
              <td className="p-3 border text-blue-600 font-semibold">Rp {p.sellingPrice}</td>
              <td className="p-3 border font-bold">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}