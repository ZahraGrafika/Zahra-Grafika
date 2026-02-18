import React, { useEffect, useState } from 'react';
import { getTransactions, getCustomers, getExpenses } from '../services/dataService';
import { Transaction } from '../types';

// FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        totalCustomers: 0,
        totalIncome: 0,
        totalOutcome: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const transactions = getTransactions();
        const customers = getCustomers();
        const expenses = getExpenses();

        const totalIncome = transactions.reduce((sum, tx) => sum + tx.total, 0);
        const totalOutcome = expenses.reduce((sum, ex) => sum + ex.amount, 0);

        setStats({
            totalOrders: transactions.length,
            paidOrders: transactions.filter(tx => tx.remainingBalance <= 0 && tx.total > 0).length,
            unpaidOrders: transactions.filter(tx => tx.remainingBalance > 0).length,
            totalCustomers: customers.length,
            totalIncome,
            totalOutcome,
        });

        setRecentTransactions(transactions.slice(0, 5));
    }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Order Total" value={stats.totalOrders.toString()} icon={<OrdersIcon />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Lunas / Belum Lunas" value={`${stats.paidOrders} / ${stats.unpaidOrders}`} icon={<PaymentStatusIcon />} color="bg-green-100 text-green-600" />
        <StatCard title="Jumlah Konsumen" value={stats.totalCustomers.toString()} icon={<CustomersIcon />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Arus Kas (Income/Outcome)" value={`${new Intl.NumberFormat('id-ID').format(stats.totalIncome)} / ${new Intl.NumberFormat('id-ID').format(stats.totalOutcome)}`} icon={<CashflowIcon />} color="bg-indigo-100 text-indigo-600" />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaksi Terakhir</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Invoice</th>
                <th scope="col" className="px-6 py-3">Tanggal</th>
                <th scope="col" className="px-6 py-3">Konsumen</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{tx.invoiceNumber}</td>
                  <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">{tx.customerName}</td>
                  <td className="px-6 py-4">{`Rp ${new Intl.NumberFormat('id-ID').format(tx.total)}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.remainingBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">Belum ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PaymentStatusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-.743-1.67a5.002 5.002 0 00-8.514 0A2.99 2.99 0 002 18v2h5m10 0v-6a5 5 0 00-10 0v6H7" /></svg>;
const CashflowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;

export default Dashboard;