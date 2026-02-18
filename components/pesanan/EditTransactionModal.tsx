
import React, { useState } from 'react';
import { Transaction, TransactionStatus } from '../../types';
import Modal from '../common/Modal';

interface EditTransactionModalProps {
    transaction: Transaction;
    onSave: (transaction: Transaction) => void;
    onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onSave, onClose }) => {
    const [downPayment, setDownPayment] = useState(transaction.downPayment);
    const [status, setStatus] = useState<TransactionStatus>(transaction.status);
    const [paymentAmount, setPaymentAmount] = useState(0);

    const remainingBalance = transaction.total - downPayment;
    const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

    const handleAddPayment = () => {
        const newDownPayment = downPayment + paymentAmount;
        if (newDownPayment > transaction.total) {
            alert('Pembayaran melebihi total tagihan.');
            return;
        }
        setDownPayment(newDownPayment);
        setPaymentAmount(0);
    };

    const handlePayInFull = () => {
        setDownPayment(transaction.total);
        setPaymentAmount(0);
        setStatus('Sudah Diambil');
    };
    
    const handleSubmit = () => {
        const newRemainingBalance = transaction.total - downPayment;
        const newStatus = newRemainingBalance <= 0 ? 'Sudah Diambil' : status;

        const updatedTransaction: Transaction = {
            ...transaction,
            downPayment: downPayment,
            remainingBalance: newRemainingBalance,
            status: newStatus,
        };
        onSave(updatedTransaction);
    };

    return (
        <Modal title={`Edit Pesanan: ${transaction.invoiceNumber}`} onClose={onClose}>
            <div className="space-y-4">
                <InfoRow label="Pelanggan" value={transaction.customerName} />
                <InfoRow label="Total Tagihan" value={formatCurrency(transaction.total)} isBold={true} />
                <InfoRow label="Sudah Dibayar" value={formatCurrency(downPayment)} />
                <InfoRow label="Sisa Tagihan" value={formatCurrency(remainingBalance)} isBold={true} color="text-red-600" />
                
                <hr className="my-4"/>

                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Update Status Pesanan</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                            className="mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="Order Baru">Order Baru</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Sudah Diambil">Sudah Diambil</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Input Pembayaran Baru</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Jumlah pembayaran"
                                value={paymentAmount || ''}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                className="flex-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                             <button onClick={handleAddPayment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Tambah</button>
                        </div>
                         <button onClick={handlePayInFull} className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">LUNAS</button>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Batal</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan Perubahan</button>
                </div>
            </div>
        </Modal>
    );
};

const InfoRow: React.FC<{label: string, value: string, isBold?: boolean, color?: string}> = ({label, value, isBold, color}) => (
    <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`text-sm ${isBold ? 'font-bold' : ''} ${color || 'text-slate-800'}`}>{value}</span>
    </div>
);


export default EditTransactionModal;
