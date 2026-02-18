
import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, deleteTransaction, saveTransaction } from '../../services/dataService';
import { Transaction, AdminUser } from '../../types';
import EditTransactionModal from './EditTransactionModal';
import { useInvoiceGenerator } from '../../hooks/useInvoiceGenerator';

const DataPesanan: React.FC<{currentUser: AdminUser | null}> = ({currentUser}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

    const { isGenerating, generateInvoice, InvoiceTemplateComponent, transactionToPrint } = useInvoiceGenerator(currentUser);

    const showFeedback = (message: string, type: 'success' | 'info' = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const refreshTransactions = () => {
        setTransactions(getTransactions());
    };

    useEffect(() => {
        refreshTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx =>
            tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);
    
    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, invoiceNumber: string) => {
        if (window.confirm(`Anda yakin ingin menghapus pesanan ${invoiceNumber}? Aksi ini tidak dapat dibatalkan.`)) {
            deleteTransaction(id);
            refreshTransactions();
            showFeedback(`Pesanan ${invoiceNumber} berhasil dihapus.`, 'info');
        }
    };
    
    const handleSave = (updatedTransaction: Transaction) => {
        saveTransaction(updatedTransaction);
        refreshTransactions();
        setIsModalOpen(false);
        setSelectedTransaction(null);
        showFeedback(`Pesanan ${updatedTransaction.invoiceNumber} berhasil diperbarui.`, 'success');
    };

    const handlePrintAction = (transaction: Transaction, action: 'pdf' | 'direct') => {
        generateInvoice(transaction, action);
    };

    const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID');

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">Data Pesanan</h1>

            {feedback && (
                <div className={`mb-4 p-3 rounded-md transition-opacity duration-300 ${
                    feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`} role="alert">
                    {feedback.message}
                </div>
            )}

            <input
                type="text"
                placeholder="Cari berdasarkan No. Invoice atau Nama Pelanggan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full mb-4 p-2 border rounded-md"
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Invoice</th>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Pelanggan</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Uang Muka</th>
                            <th className="px-6 py-3">Sisa</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{tx.invoiceNumber}</td>
                                <td className="px-6 py-4">{formatDate(tx.date)}</td>
                                <td className="px-6 py-4">{tx.customerName}</td>
                                <td className="px-6 py-4">{formatCurrency(tx.total)}</td>
                                <td className="px-6 py-4">{formatCurrency(tx.downPayment)}</td>
                                <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(tx.remainingBalance)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'Sudah Diambil' || tx.remainingBalance <= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => handlePrintAction(tx, 'direct')} disabled={isGenerating && transactionToPrint?.id === tx.id} className="font-medium text-green-600 hover:underline disabled:opacity-50">Cetak</button>
                                    <button onClick={() => handlePrintAction(tx, 'pdf')} disabled={isGenerating && transactionToPrint?.id === tx.id} className="font-medium text-blue-600 hover:underline disabled:opacity-50">PDF</button>
                                    <button onClick={() => handleEdit(tx)} className="font-medium text-indigo-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(tx.id, tx.invoiceNumber)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-4">Tidak ada data pesanan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && selectedTransaction && (
                <EditTransactionModal
                    transaction={selectedTransaction}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
             {InvoiceTemplateComponent}
        </div>
    );
};

export default DataPesanan;
