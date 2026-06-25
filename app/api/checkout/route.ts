import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { cart, totalAmount, cashGiven, change, cashierName } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan Transaksi
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          cashGiven,
          change,
          cashierName,
          items: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.qty,
              price: item.sellingPrice
            }))
          }
        }
      });

      // 2. Kurangi Stok Barang
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.qty } }
        });
      }
      return sale;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Gagal memproses transaksi' }, { status: 500 });
  }
}