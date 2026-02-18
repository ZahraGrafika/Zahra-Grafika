
import React, { useState, useEffect } from 'react';
import { getExpenses, saveExpense, deleteExpense } from '../../services/dataService';
import { Expense } from '../../types';
import Modal from './common/Modal';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const openModal = (expense: Expense | null = null) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleSave = (expense: Expense) => {
    saveExpense(expense);
    setExpenses(getExpenses());
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      setExpenses(getExpenses());
    }
  };
  
  const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pembelanjaan</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
          Tambah Pengeluaran
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Deskripsi</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3">Jumlah</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{expense.description}</td>
                <td className="px-6 py-4">{expense.category}</td>
                <td className="px-6 py-4">{formatCurrency(expense.amount)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(expense)} className="font-medium text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(expense.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ExpenseFormModal
          expense={selectedExpense}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

interface ExpenseFormModalProps {
  expense: Expense | null;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ expense, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Bahan Baku',
    amount: 0,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        date: new Date(expense.date).toISOString().split('T')[0],
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
      });
    }
  }, [expense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: expense ? expense.id : `EXP-${Date.now()}`,
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      category: formData.category,
      amount: formData.amount,
    };
    onSave(newExpense);
  };

  return (
    <Modal title={expense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tanggal</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kategori</label>
          <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
            <option>Bahan Baku</option>
            <option>Tinta</option>
            <option>Gaji Karyawan</option>
            <option>Listrik & Air</option>
            <option>Operasional Lainnya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Jumlah</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Batal</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
        </div>
      </form>
    </Modal>
  );
};

export default Expenses;
