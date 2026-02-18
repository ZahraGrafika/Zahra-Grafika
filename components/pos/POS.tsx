
import React, { useState, useEffect, useCallback } from 'react';
import { getCustomers, getProducts, getNextInvoiceNumber, saveTransaction } from '../../services/dataService';
import { Customer, Product, TransactionItem, Transaction, TransactionStatus, AdminUser } from '../../types';
import CustomerSearchModal from './CustomerSearchModal';
import { useInvoiceGenerator } from '../../hooks/useInvoiceGenerator';

const parseUkuran = (ukuran: string): number => {
  if (!ukuran || typeof ukuran !== 'string' || ukuran.trim() === '') {
      return 1;
  }
  const normalizedUkuran = ukuran.replace(',', '.').trim().toLowerCase();
  const parts = normalizedUkuran.split(/[x*]/);
  if (parts.length === 2) {
      const num1 = parseFloat(parts[0]);
      const num2 = parseFloat(parts[1]);
      if (!isNaN(num1) && !isNaN(num2)) {
          return num1 * num2;
      }
  }
  const size = parseFloat(normalizedUkuran);
  return isNaN(size) ? 1 : size;
};

const InputField: React.FC<{ 
  label: string; 
  value: string | number; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  readOnly?: boolean; 
  type?: string;
  inputClassName?: string;
}> = 
  ({ label, inputClassName, ...props }) => (
  <div className="flex items-center">
    <label className="w-28 font-bold">{label}</label>
    <input className={`flex-1 p-1 border border-gray-400 bg-white ${inputClassName || ''}`} {...props} />
  </div>
);

const POS: React.FC<{currentUser: AdminUser | null}> = ({currentUser}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimasiSelesai, setEstimasiSelesai] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);


  const [items, setItems] = useState<TransactionItem[]>([]);
  
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [status, setStatus] = useState<TransactionStatus>('Order Baru');

  const { isGenerating, generateInvoice, InvoiceTemplateComponent, printAction } = useInvoiceGenerator(currentUser);

  const resetState = useCallback(() => {
    setInvoiceNumber(getNextInvoiceNumber());
    const today = new Date().toISOString().split('T')[0];
    setTransactionDate(today);
    setEstimasiSelesai(today);
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setItems([{ id: `ITEM-${Date.now()}`, productId: null, name: '', detail: '', bahan: '', ukuran: '', quantity: 1, price: 0, total: 0 }]);
    setIsTaxEnabled(false);
    setTaxAmount(0);
    setDiscountValue(0);
    setDownPayment(0);
    setStatus('Order Baru');
  }, []);

  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (!isTaxEnabled) {
      setTaxAmount(0);
    }
  }, [isTaxEnabled]);

  const calculateTotals = useCallback(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const newDiscountAmount = discountValue;
    const afterDiscountTotal = newSubtotal - newDiscountAmount;
    const newTotal = afterDiscountTotal + (isTaxEnabled ? taxAmount : 0);
    const newRemainingBalance = newTotal - downPayment;

    setSubtotal(newSubtotal);
    setDiscountAmount(newDiscountAmount);
    setTotal(newTotal);
    setRemainingBalance(newRemainingBalance);
  }, [items, discountValue, taxAmount, downPayment, isTaxEnabled]);

  useEffect(() => {
    calculateTotals();
  }, [items, discountValue, taxAmount, downPayment, calculateTotals]);

  const handleAddItem = () => {
    const newItem: TransactionItem = {
      id: `ITEM-${Date.now()}`, productId: null, name: '', detail: '', bahan: '', ukuran: '', quantity: 1, price: 0, total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (itemId: string, field: keyof TransactionItem, value: any) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if(field === 'name') {
             const product = products.find(p => p.name === value);
             if(product) {
                updatedItem.price = product.sellPrice;
                updatedItem.productId = product.id;
             }
          }
          if (field === 'quantity' || field === 'price' || field === 'ukuran' || field === 'name') {
            const size = parseUkuran(updatedItem.ukuran);
            updatedItem.total = size * updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerAddress(customer.address);
    setCustomerPhone(customer.phone);
    setIsCustomerSearchOpen(false);
  };

  const handleSaveTransaction = () => {
    if (items.length === 0 || items.every(it => it.total === 0)) {
      alert('Tidak ada item dalam transaksi.'); return;
    }
    if (!customerName) {
      alert('Nama pelanggan harus diisi.'); return;
    }
    
    const newTransaction: Transaction = {
      id: `TX-${Date.now()}`,
      invoiceNumber,
      date: new Date(transactionDate).toISOString(),
      estimasiSelesai: new Date(estimasiSelesai).toISOString(),
      customerId: selectedCustomer?.id || null,
      customerName, customerAddress, customerPhone,
      items, subtotal, discountValue, discountAmount,
      taxAmount: isTaxEnabled ? taxAmount : 0, 
      total, downPayment, remainingBalance, status,
    };
    saveTransaction(newTransaction);
    alert(`Transaksi ${invoiceNumber} berhasil disimpan.`);
    resetState();
  };

  const handlePrintAction = (action: 'pdf' | 'direct') => {
    if (items.length === 0 || items.every(it => it.total === 0 && it.name === '')) {
        alert('Tidak ada item untuk diproses.'); return;
    }
    if (!customerName) {
        alert('Nama pelanggan harus diisi untuk mencetak/membuat PDF invoice.'); return;
    }
    
    const transactionForPrint: Transaction = {
        id: `TX-PRINT-${Date.now()}`,
        invoiceNumber,
        date: new Date(transactionDate).toISOString(),
        estimasiSelesai: new Date(estimasiSelesai).toISOString(),
        customerId: selectedCustomer?.id || null,
        customerName, customerAddress, customerPhone,
        items, subtotal, discountValue, discountAmount,
        taxAmount: isTaxEnabled ? taxAmount : 0, 
        total, downPayment, remainingBalance, status,
    };
    
    generateInvoice(transactionForPrint, action);
  };

  return (
    <>
      <div className="p-4 text-sm font-sans">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Side */}
          <div className="space-y-2">
            <InputField label="No. Order" value={invoiceNumber} readOnly />
            <InputField 
              label="Tgl. Order" 
              value={transactionDate} 
              onChange={e => setTransactionDate(e.target.value)} 
              type="date"
              inputClassName="cursor-pointer focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
            />
            <InputField 
              label="Estimasi Selesai" 
              value={estimasiSelesai} 
              onChange={e => setEstimasiSelesai(e.target.value)} 
              type="date" 
              inputClassName="cursor-pointer focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
          {/* Right Side */}
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-28 font-bold">Kode Pelanggan</label>
              <input className="flex-1 p-1 border border-gray-400 bg-gray-200" value={selectedCustomer?.id || ''} readOnly/>
              <button onClick={() => setIsCustomerSearchOpen(true)} className="p-1 border border-gray-500 mx-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></button>
              <button onClick={() => { setSelectedCustomer(null); setCustomerName(''); setCustomerAddress(''); setCustomerPhone('')}} className="p-1 px-2 border border-gray-500 font-bold">Baru</button>
            </div>
            <InputField label="Nama Pelanggan" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <InputField label="Alamat" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
            <InputField label="No. Telp / HP" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end items-center my-1">
            <div className="bg-sky-300 p-1 px-2 border border-gray-400 flex items-center">
                <label htmlFor="status-select" className="font-bold mr-4">STATUS</label>
                <select
                    id="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                    className="p-1 w-40 text-center border border-gray-400 rounded-sm bg-white text-black"
                >
                    <option value="Order Baru">Order Baru</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Sudah Diambil">Sudah Diambil</option>
                </select>
            </div>
        </div>

        {/* Items Table */}
        <div className="border-t-2 border-b-2 border-black py-1">
          <table className="w-full">
            <thead>
              <tr className="font-bold">
                <td className="p-1 border border-gray-500 w-1/5 bg-cyan-200 text-black">Produk</td>
                <td className="p-1 border border-gray-500 w-1/4 bg-cyan-200 text-black">Detail Pesanan</td>
                <td className="p-1 border border-gray-500 w-1/6 bg-cyan-200 text-black">Bahan</td>
                <td className="p-1 border border-gray-500 w-1/12 bg-cyan-200 text-black">Ukuran</td>
                <td className="p-1 border border-gray-500 w-[5%] bg-cyan-200 text-black">QTY</td>
                <td className="p-1 border border-gray-500 w-1/12 bg-cyan-200 text-black">Harga</td>
                <td className="p-1 border border-gray-500 w-1/12 bg-cyan-200 text-black">Total</td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
              <tr key={item.id}>
                <td className="p-0 border border-gray-500 bg-white"><input list="products-list" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.detail} onChange={e => updateItem(item.id, 'detail', e.target.value)} className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.bahan} onChange={e => updateItem(item.id, 'bahan', e.target.value)} className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.ukuran} onChange={e => updateItem(item.id, 'ukuran', e.target.value)} className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} type="number" className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} type="number" className="w-full p-1 border-0 bg-white text-black" /></td>
                <td className="p-0 border border-gray-500 bg-white"><input value={item.total} readOnly className="w-full p-1 border-0 bg-gray-200 text-black" /></td>
              </tr>
              ))}
            </tbody>
          </table>
          <datalist id="products-list">
              {products.map(p => <option key={p.id} value={p.name} />)}
          </datalist>
          <div className="text-right mt-1">
              <button onClick={handleAddItem} className="bg-sky-300 p-1 px-2 border border-gray-500 flex items-center ml-auto">Tambah Pesanan <span className="ml-2 rounded-full border border-black w-5 h-5 flex items-center justify-center font-bold">+</span></button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <div className="flex items-center">
                <div className="w-20 p-1 px-2 bg-sky-300 border border-gray-500 font-bold flex items-center justify-between">
                    <label htmlFor="tax-toggle">Pajak</label>
                    <input
                        id="tax-toggle"
                        type="checkbox"
                        checked={isTaxEnabled}
                        onChange={(e) => setIsTaxEnabled(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-800 rounded focus:ring-blue-900"
                    />
                </div>
                <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                    disabled={!isTaxEnabled}
                    className={`flex-1 p-1 border border-gray-400 ${!isTaxEnabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                />
            </div>
              <div className="flex items-center">
                  <label className="w-20 p-1 px-2 bg-sky-300 border border-gray-500 font-bold">Diskon</label>
                  <input type="number" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} className="flex-1 p-1 border border-gray-400 bg-white text-black"/>
              </div>
          </div>
          <div className="space-y-2">
              <div className="flex items-center">
                  <label className="w-24 p-1 px-2 bg-sky-300 border border-gray-500 font-bold">Grand Total</label>
                  <input value={total} readOnly className="flex-1 p-1 border border-gray-400 bg-gray-200"/>
              </div>
              <div className="flex items-center">
                  <label className="w-24 p-1 px-2 bg-sky-300 border border-gray-500 font-bold">Uang Muka</label>
                  <input type="number" value={downPayment} onChange={e => setDownPayment(parseFloat(e.target.value) || 0)} className="flex-1 p-1 border border-gray-400 bg-white text-black"/>
              </div>
              <div className="flex items-center">
                  <label className="w-24 p-1 px-2 bg-sky-300 border border-gray-500 font-bold">Sisa</label>
                  <input value={remainingBalance} readOnly className="flex-1 p-1 border border-gray-400 bg-gray-200"/>
              </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center space-x-2">
          <button onClick={handleSaveTransaction} className="p-1 px-4 bg-sky-300 border border-gray-600 font-bold">SIMPAN</button>
          <button onClick={() => handlePrintAction('pdf')} disabled={isGenerating} className="p-1 px-4 bg-sky-300 border border-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating && printAction === 'pdf' ? 'MEMBUAT...' : 'PDF'}
          </button>
          <button onClick={() => handlePrintAction('direct')} disabled={isGenerating} className="p-1 px-4 bg-sky-300 border border-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating && printAction === 'direct' ? 'MENCETAK...' : 'CETAK'}
          </button>
        </div>
      </div>
      {isCustomerSearchOpen && (
        <CustomerSearchModal
          onClose={() => setIsCustomerSearchOpen(false)}
          onSelectCustomer={handleSelectCustomer}
        />
      )}
      {InvoiceTemplateComponent}
    </>
  );
};

export default POS;
