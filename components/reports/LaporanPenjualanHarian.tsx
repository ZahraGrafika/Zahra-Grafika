
import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '../../services/dataService';
import { Transaction } from '../../types';

const LaporanPenjualanHarian: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const productSalesData = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= start && txDate <= end;
    });

    const sales: { [key: string]: { quantity: number; total: number } } = {};

    filteredTransactions.forEach(tx => {
        tx.items.forEach(item => {
            if (item.name) {
                if (!sales[item.name]) {
                    sales[item.name] = { quantity: 0, total: 0 };
                }
                sales[item.name].quantity += item.quantity;
                sales[item.name].total += item.total;
            }
        });
    });

    return Object.keys(sales)
        .map(key => ({
            name: key,
            quantity: sales[key].quantity,
            total: sales[key].total,
        }))
        .sort((a, b) => b.total - a.total);

  }, [transactions, startDate, endDate]);

  const totalRevenue = productSalesData.reduce((acc, item) => acc + item.total, 0);

  const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Laporan Penjualan Barang</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="bg-white p-2 rounded-lg flex items-center border border-slate-300">
            <label className="text-sm font-bold text-slate-700 mr-2">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md border-slate-600 bg-slate-800 text-white" style={{ colorScheme: 'dark' }} />
        </div>
        <div className="bg-white p-2 rounded-lg flex items-center border border-slate-300">
            <label className="text-sm font-bold text-slate-700 mr-2">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md border-slate-600 bg-slate-800 text-white" style={{ colorScheme: 'dark' }} />
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-blue-100 rounded-lg">
        <p className="text-blue-800">Total Pendapatan dari Penjualan Barang</p>
        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th className="px-6 py-3">Nama Produk / Barang</th>
                    <th className="px-6 py-3 text-center">Jumlah Terjual</th>
                    <th className="px-6 py-3 text-right">Total Penjualan</th>
                </tr>
            </thead>
            <tbody>
                {productSalesData.map(item => (
                    <tr key={item.name} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                ))}
                {productSalesData.length === 0 && (
                    <tr>
                        <td colSpan={3} className="text-center py-4">Tidak ada penjualan barang pada periode ini.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanPenjualanHarian;
