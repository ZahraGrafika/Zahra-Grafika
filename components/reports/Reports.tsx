
import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, getExpenses } from '../../services/dataService';
import { Transaction, Expense, AdminUser } from '../../types';
import { useInvoiceGenerator } from '../../hooks/useInvoiceGenerator';

type ReportTab = 'cashflow' | 'income' | 'expense' | 'ledger';

const Reports: React.FC<{ currentUser: AdminUser | null }> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('cashflow');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const { isGenerating, generateInvoice, InvoiceTemplateComponent, transactionToPrint } = useInvoiceGenerator(currentUser);

    useEffect(() => {
        setTransactions(getTransactions());
        setExpenses(getExpenses());
    }, []);

    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= start && txDate <= end;
        });

        const filteredExpenses = expenses.filter(ex => {
            const exDate = new Date(ex.date);
            return exDate >= start && exDate <= end;
        });
        
        return { transactions: filteredTransactions, expenses: filteredExpenses };
    }, [startDate, endDate, transactions, expenses]);

    const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

    const renderContent = () => {
        const totalIncome = filteredData.transactions.reduce((sum, tx) => sum + tx.total, 0);
        const totalExpense = filteredData.expenses.reduce((sum, ex) => sum + ex.amount, 0);

        switch (activeTab) {
            case 'cashflow':
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-green-100 rounded-lg">
                                <p className="text-green-800">Total Pemasukan</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</p>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg">
                                <p className="text-red-800">Total Pengeluaran</p>
                                <p className="text-2xl font-bold text-red-900">{formatCurrency(totalExpense)}</p>
                            </div>
                            <div className="p-4 bg-indigo-100 rounded-lg">
                                <p className="text-indigo-800">Saldo Bersih</p>
                                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(totalIncome - totalExpense)}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Detail Pemasukan</h3>
                        <IncomeTable transactions={filteredData.transactions} onPrint={generateInvoice} isGenerating={isGenerating} transactionToPrintId={transactionToPrint?.id} />
                        <h3 className="text-lg font-semibold mt-6 mb-2">Detail Pengeluaran</h3>
                        <ExpenseTable expenses={filteredData.expenses} />
                    </div>
                );
            case 'income':
                return <IncomeTable transactions={filteredData.transactions} onPrint={generateInvoice} isGenerating={isGenerating} transactionToPrintId={transactionToPrint?.id} />;
            case 'expense':
                return <ExpenseTable expenses={filteredData.expenses} />;
            case 'ledger':
                const ledgerItems = [
                    ...filteredData.transactions.map(tx => ({ type: 'Pemasukan', date: tx.date, description: `Invoice ${tx.invoiceNumber}`, amount: tx.total })),
                    ...filteredData.expenses.map(ex => ({ type: 'Pengeluaran', date: ex.date, description: ex.description, amount: -ex.amount }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return <LedgerTable items={ledgerItems} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="bg-white p-2 rounded-lg flex items-center border border-slate-300">
                    <label className="text-sm font-bold text-slate-700 mr-2">Dari Tanggal</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md border-slate-600 bg-slate-800 text-white" style={{ colorScheme: 'dark' }}/>
                </div>
                <div className="bg-white p-2 rounded-lg flex items-center border border-slate-300">
                    <label className="text-sm font-bold text-slate-700 mr-2">Sampai Tanggal</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md border-slate-600 bg-slate-800 text-white" style={{ colorScheme: 'dark' }}/>
                </div>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['cashflow', 'income', 'expense', 'ledger'] as ReportTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab === 'cashflow' ? 'Arus Kas' : tab === 'income' ? 'Pemasukan' : tab === 'expense' ? 'Pengeluaran' : 'Buku Besar'}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>
            {InvoiceTemplateComponent}
        </div>
    );
};

const IncomeTable: React.FC<{ transactions: Transaction[], onPrint: (tx: Transaction, action: 'pdf' | 'direct') => void, isGenerating: boolean, transactionToPrintId: string | undefined }> = ({ transactions, onPrint, isGenerating, transactionToPrintId }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Konsumen</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4">{tx.invoiceNumber}</td>
                        <td className="px-6 py-4">{tx.customerName}</td>
                        <td className="px-6 py-4">{`Rp ${new Intl.NumberFormat('id-ID').format(tx.total)}`}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.remainingBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {tx.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => onPrint(tx, 'direct')} disabled={isGenerating && transactionToPrintId === tx.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">Cetak</button>
                            <button onClick={() => onPrint(tx, 'pdf')} disabled={isGenerating && transactionToPrintId === tx.id} className="font-medium text-blue-600 hover:underline disabled:opacity-50">PDF</button>
                        </td>
                    </tr>
                ))}
                 {transactions.length === 0 && (<tr><td colSpan={6} className="text-center py-4">Tidak ada data.</td></tr>)}
            </tbody>
        </table>
    </div>
);

const ExpenseTable: React.FC<{ expenses: Expense[] }> = ({ expenses }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Deskripsi</th>
                    <th className="px-6 py-3">Kategori</th>
                    <th className="px-6 py-3">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                {expenses.map(ex => (
                    <tr key={ex.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4">{new Date(ex.date).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4">{ex.description}</td>
                        <td className="px-6 py-4">{ex.category}</td>
                        <td className="px-6 py-4">{`Rp ${new Intl.NumberFormat('id-ID').format(ex.amount)}`}</td>
                    </tr>
                ))}
                {expenses.length === 0 && (<tr><td colSpan={4} className="text-center py-4">Tidak ada data.</td></tr>)}
            </tbody>
        </table>
    </div>
);

const LedgerTable: React.FC<{ items: Array<{ type: string, date: string, description: string, amount: number }> }> = ({ items }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Deskripsi</th>
                    <th className="px-6 py-3">Pemasukan</th>
                    <th className="px-6 py-3">Pengeluaran</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4">{item.description}</td>
                        <td className="px-6 py-4 text-green-600">{item.amount > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}</td>
                        <td className="px-6 py-4 text-red-600">{item.amount < 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(Math.abs(item.amount))}` : '-'}</td>
                    </tr>
                ))}
                 {items.length === 0 && (<tr><td colSpan={4} className="text-center py-4">Tidak ada data.</td></tr>)}
            </tbody>
        </table>
    </div>
);

export default Reports;
