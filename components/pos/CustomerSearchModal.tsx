
import React, { useState, useEffect, useMemo } from 'react';
import { getCustomers } from '../../services/dataService';
import { Customer } from '../../types';
import Modal from '../common/Modal';

interface CustomerSearchModalProps {
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <Modal title="Cari Pelanggan" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, ID, atau telepon..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Telepon</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{customer.id}</td>
                  <td className="px-4 py-2">{customer.name}</td>
                  <td className="px-4 py-2">{customer.phone}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => onSelectCustomer(customer)} 
                      className="px-3 py-1 bg-sky-500 text-white text-xs font-semibold rounded-md hover:bg-sky-600"
                    >
                      Pilih
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-4">Pelanggan tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerSearchModal;
