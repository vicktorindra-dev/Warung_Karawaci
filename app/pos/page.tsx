'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Product = { id: number, name: string, sellingPrice: number, stock: number };
type CartItem = Product & { qty: number };

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashGiven, setCashGiven] = useState<number>(0);

  const fetchProducts = () => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
  const change = cashGiven - totalAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang kosong!');
    if (cashGiven < totalAmount) return alert('Uang konsumen kurang!');
    
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart, totalAmount, cashGiven, change, cashierName: 'Kasir Utama' })
    });
    
    if (res.ok) {
      alert('Transaksi Berhasil!');
      setCart([]);
      setCashGiven(0);
      fetchProducts(); // Refresh stok
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Kasir */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Mesin Kasir Warung</h1>
        <Link href="/" className="hover:text-blue-200">Keluar</Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Kiri: Daftar Barang */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className={`p-4 border rounded shadow-sm text-left transition-all ${p.stock <= 0 ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'bg-white hover:border-blue-500 hover:shadow-md'}`}
              >
                <div className="font-bold text-lg">{p.name}</div>
                <div className="text-blue-600 font-semibold mt-1">Rp {p.sellingPrice}</div>
                <div className="text-xs text-gray-500 mt-3">Sisa Stok: {p.stock}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Kanan: Keranjang & Pembayaran */}
        <div className="w-96 bg-white border-l p-6 flex flex-col shadow-lg z-10">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Keranjang</h2>
          <div className="flex-1 overflow-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.qty} x Rp {item.sellingPrice}</div>
                </div>
                <div className="font-bold">Rp {item.sellingPrice * item.qty}</div>
              </div>
            ))}
            {cart.length === 0 && <p className="text-gray-400 text-center mt-10">Belum ada barang</p>}
          </div>
          
          <div className="mt-4 pt-4 border-t-2 border-dashed">
            <div className="flex justify-between font-bold text-2xl mb-4 text-blue-700">
              <span>Total</span>
              <span>Rp {totalAmount}</span>
            </div>
            
            <label className="block text-sm mb-1 font-semibold text-gray-600">Uang Diterima:</label>
            <input 
              type="number" 
              value={cashGiven || ''} 
              onChange={(e) => setCashGiven(Number(e.target.value))}
              className="w-full border-2 border-gray-300 p-3 mb-4 rounded text-xl font-bold focus:border-blue-500 outline-none"
              placeholder="0"
            />

            <div className={`p-4 rounded mb-4 text-xl font-bold flex justify-between ${change < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              <span>Kembalian</span>
              <span>Rp {change >= 0 ? change : 0}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white p-4 rounded font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}