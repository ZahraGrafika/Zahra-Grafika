import React, { useState, useEffect } from 'react';
import { getProducts, saveProduct, deleteProduct } from '../../services/dataService';
import { Product } from '../../types';
import Modal from '../common/Modal';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = (product: Product) => {
    saveProduct(product);
    setProducts(getProducts());
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setProducts(getProducts());
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatCurrency = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
          Tambah Produk
        </button>
      </div>
      <input
        type="text"
        placeholder="Cari produk berdasarkan nama atau kategori..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded-md"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Nama Produk</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3">Harga Modal</th>
              <th className="px-6 py-3">Harga Jual</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">{product.category || 'Umum'}</span></td>
                <td className="px-6 py-4">{formatCurrency(product.costPrice)}</td>
                <td className="px-6 py-4">{formatCurrency(product.sellPrice)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(product)} className="font-medium text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ProductFormModal
          product={selectedProduct}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};


interface ProductFormModalProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', costPrice: 0, sellPrice: 0, category: 'Percetakan' });

  useEffect(() => {
    if (product) {
      setFormData({ name: product.name, costPrice: product.costPrice, sellPrice: product.sellPrice, category: product.category || 'Percetakan' });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: product ? product.id : `PROD-${Date.now()}`,
      ...formData,
    };
    onSave(newProduct);
  };

  return (
    <Modal title={product ? 'Edit Produk' : 'Tambah Produk'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama Produk</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kategori</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Contoh: Percetakan, Sablon, Konfeksi" required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Harga Modal</label>
          <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Harga Jual</label>
          <input type="number" name="sellPrice" value={formData.sellPrice} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Batal</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
        </div>
      </form>
    </Modal>
  );
};

export default Products;