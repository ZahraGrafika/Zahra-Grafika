
import React, { useState, useMemo } from 'react';
import { getTransactions, getCustomers } from '../../services/dataService';
import { Transaction, Customer, AdminUser } from '../../types';
import { useInvoiceGenerator } from '../../hooks/useInvoiceGenerator';

const LaporanTransaksiPelanggan: React.FC<{currentUser: AdminUser | null}> = ({ currentUser }) => {
  const [transactions] = useState(() => getTransactions());
  const [customers] = useState(() => getCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  const { isGenerating, generateInvoice, InvoiceTemplateComponent, transactionToPrint } = useInvoiceGenerator(currentUser);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions.filter(tx => tx.customerId === selectedCustomerId);
  }, [transactions, selectedCustomerId]);
  
  const customerTotals = useMemo(() => {
      const totalBelanja = customerTransactions.reduce((acc, tx) => acc + tx.total, 0);
      const totalTerbayar = customerTransactions.reduce((acc, tx) => acc + tx.downPayment, 0);
      const sisaHutang = customerTransactions.reduce((acc, tx) => acc + tx.remainingBalance, 0);
      return { totalBelanja, totalTerbayar, sisaHutang };
  }, [customerTransactions]);

  const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID');

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Laporan Transaksi Pelanggan</h1>
      
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="bg-white p-2 rounded-lg flex items-center border border-slate-300">
            <label className="text-sm font-bold text-slate-700 mr-2">Pilih Pelanggan:</label>
            <select
                value={selectedCustomerId || ''}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="p-2 border rounded-md w-full max-w-sm bg-slate-800 text-white border-slate-600"
                style={{ colorScheme: 'dark' }}
            >
                {customers.map(c => <option key={c.id} value={c.id} className="bg-white text-black">{c.name} ({c.id})</option>)}
            </select>
        </div>
      </div>

      {selectedCustomerId ? (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800">Total Belanja</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(customerTotals.totalBelanja)}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">Total Terbayar</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(customerTotals.totalTerbayar)}</p>
          </div>
          <div className="p-4 bg-red-100 rounded-lg">
              <p className="text-red-800">Sisa Hutang</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(customerTotals.sisaHutang)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">Invoice</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Sisa</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  {customerTransactions.map(tx => (
                      <tr key={tx.id} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-6 py-4">{formatDate(tx.date)}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{tx.invoiceNumber}</td>
                          <td className="px-6 py-4">{formatCurrency(tx.total)}</td>
                          <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(tx.remainingBalance)}</td>
                          <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.remainingBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {tx.status}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => generateInvoice(tx, 'direct')} disabled={isGenerating && transactionToPrint?.id === tx.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">Cetak</button>
                            <button onClick={() => generateInvoice(tx, 'pdf')} disabled={isGenerating && transactionToPrint?.id === tx.id} className="font-medium text-blue-600 hover:underline disabled:opacity-50">PDF</button>
                          </td>
                      </tr>
                  ))}
                  {customerTransactions.length === 0 && (
                      <tr>
                          <td colSpan={6} className="text-center py-4">Pelanggan ini belum memiliki transaksi.</td>
                      </tr>
                  )}
              </tbody>
          </table>
        </div>
      </>
      ) : (
        <p>Silakan pilih pelanggan untuk melihat laporannya.</p>
      )}
      {InvoiceTemplateComponent}
    </div>
  );
};

export default LaporanTransaksiPelanggan;
