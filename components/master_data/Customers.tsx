
import React, { useState, useEffect } from 'react';
import { getCustomers, saveCustomer, deleteCustomer, getTransactions } from '../../services/dataService';
import { Customer } from '../../types';
import Modal from '../common/Modal';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const openModal = (customer: Customer | null = null) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSave = (customer: Customer) => {
    saveCustomer(customer);
    setCustomers(getCustomers());
    closeModal();
    showFeedback(`Data pelanggan "${customer.name}" berhasil disimpan.`);
  };

  const handleDelete = (customer: Customer) => {
    const transactions = getTransactions();
    const hasTransactions = transactions.some(tx => tx.customerId === customer.id);

    if (hasTransactions) {
      showFeedback(`Pelanggan "${customer.name}" tidak dapat dihapus karena memiliki riwayat transaksi.`, 'error');
      return;
    }

    if (window.confirm(`Anda yakin ingin menghapus pelanggan "${customer.name}"? Aksi ini tidak dapat dibatalkan.`)) {
      deleteCustomer(customer.id);
      setCustomers(getCustomers());
      showFeedback(`Pelanggan "${customer.name}" berhasil dihapus.`, 'info');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Pelanggan</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
          Tambah Pelanggan
        </button>
      </div>
       {feedback && (
           <div className={`mb-4 p-3 rounded-md transition-opacity duration-300 ${
               feedback.type === 'success' ? 'bg-green-100 text-green-800' :
               feedback.type === 'info' ? 'bg-blue-100 text-blue-800' :
               'bg-red-100 text-red-800'
           }`} role="alert">
               {feedback.message}
           </div>
       )}
      <input
        type="text"
        placeholder="Cari pelanggan..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded-md"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Kode Pelanggan</th>
              <th className="px-6 py-3">Nama Pelanggan</th>
              <th className="px-6 py-3">Alamat</th>
              <th className="px-6 py-3">No. Telp. / HP</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{customer.id}</td>
                <td className="px-6 py-4">{customer.name}</td>
                <td className="px-6 py-4">{customer.address}</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(customer)} className="font-medium text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(customer)} className="font-medium text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <CustomerFormModal
          customer={selectedCustomer}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

interface CustomerFormModalProps {
  customer: Customer | null;
  onSave: (customer: Customer) => void;
  onClose: () => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState<Customer>(
    { id: '', name: '', phone: '', address: '' }
  );

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({ id: `CUST-${Date.now().toString().slice(-4)}`, name: '', phone: '', address: '' });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        alert('Nama Pelanggan harus diisi.');
        return;
    }
    onSave(formData);
  };

  return (
    <Modal title={customer ? 'Edit Pelanggan' : 'Tambah Pelanggan'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Kode Pelanggan</label>
          <input 
            type="text" 
            name="id" 
            value={formData.id} 
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-slate-100 text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama Pelanggan</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
         <div>
          <label className="block text-sm font-medium text-slate-700">Alamat</label>
          <textarea name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">No. Telp. / HP</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Batal</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
        </div>
      </form>
    </Modal>
  );
};

export default Customers;
