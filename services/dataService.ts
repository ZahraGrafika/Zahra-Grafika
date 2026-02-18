
import { Customer, Product, Transaction, Expense, CompanyProfile, AdminUser } from '../types';

export const LSK = {
  CUSTOMERS: 'pos_customers',
  PRODUCTS: 'pos_products',
  TRANSACTIONS: 'pos_transactions',
  EXPENSES: 'pos_expenses',
  PROFILE: 'pos_company_profile',
  INVOICE_FORMATS: 'pos_invoice_formats',
  ADMINS: 'pos_admins',
  DATA_VERSION: 'pos_data_version',
};

const CURRENT_APP_VERSION = 2;

const seedInitialData = () => {
  if (!localStorage.getItem(LSK.CUSTOMERS)) {
    localStorage.setItem(LSK.CUSTOMERS, JSON.stringify([
      { id: 'CUST-001', name: 'PT. Maju Jaya', phone: '081234567890', address: 'Jl. Sudirman No. 1, Jakarta' },
      { id: 'CUST-002', name: 'CV. Kreatif Bersama', phone: '08122334455', address: 'Jl. Gajah Mada No. 2, Bandung' },
    ]));
  }
  if (!localStorage.getItem(LSK.PRODUCTS)) {
    localStorage.setItem(LSK.PRODUCTS, JSON.stringify([
      // --- PERCETAKAN ---
      { id: 'PROD-001', name: 'Banner Flexi China 280g', costPrice: 15000, sellPrice: 25000, category: 'Percetakan' },
      { id: 'PROD-002', name: 'Spanduk Kain', costPrice: 20000, sellPrice: 35000, category: 'Percetakan' },
      { id: 'PROD-003', name: 'Stiker Vinyl A3+', costPrice: 8000, sellPrice: 15000, category: 'Percetakan' },
      { id: 'PROD-004', name: 'Kartu Nama (100 pcs)', costPrice: 12000, sellPrice: 25000, category: 'Percetakan' },
      { id: 'PROD-005', name: 'Brosur A5 Art Paper (1 rim)', costPrice: 250000, sellPrice: 400000, category: 'Percetakan' },
      { id: 'PROD-006', name: 'Nota NCR (1 rim)', costPrice: 180000, sellPrice: 300000, category: 'Percetakan' },
      { id: 'PROD-007', name: 'X-Banner + Rangka', costPrice: 65000, sellPrice: 100000, category: 'Percetakan' },
      { id: 'PROD-008', name: 'Kalender Dinding', costPrice: 15000, sellPrice: 25000, category: 'Percetakan' },
      { id: 'PROD-009', name: 'Cetak Buku (per halaman)', costPrice: 200, sellPrice: 500, category: 'Percetakan' },
      { id: 'PROD-010', name: 'Sertifikat/Piagam', costPrice: 5000, sellPrice: 10000, category: 'Percetakan' },
      // --- SABLON ---
      { id: 'PROD-101', name: 'Kaos Sablon Plastisol', costPrice: 55000, sellPrice: 95000, category: 'Sablon' },
      { id: 'PROD-102', name: 'Kaos Sablon Rubber', costPrice: 45000, sellPrice: 75000, category: 'Sablon' },
      { id: 'PROD-103', name: 'Hoodie Sablon DTF', costPrice: 90000, sellPrice: 150000, category: 'Sablon' },
      { id: 'PROD-104', name: 'Tote Bag Sablon', costPrice: 15000, sellPrice: 30000, category: 'Sablon' },
      { id: 'PROD-105', name: 'Topi Sablon Polyflex', costPrice: 20000, sellPrice: 40000, category: 'Sablon' },
      // --- KONFEKSI ---
      { id: 'PROD-201', name: 'Kemeja PDH (Drill)', costPrice: 95000, sellPrice: 160000, category: 'Konfeksi' },
      { id: 'PROD-202', name: 'Jaket Bomber', costPrice: 120000, sellPrice: 200000, category: 'Konfeksi' },
      { id: 'PROD-203', name: 'Polo Shirt Bordir', costPrice: 65000, sellPrice: 110000, category: 'Konfeksi' },
      { id: 'PROD-204', name: 'Almamater Kampus', costPrice: 110000, sellPrice: 180000, category: 'Konfeksi' },
      { id: 'PROD-205', name: 'Seragam Sekolah', costPrice: 70000, sellPrice: 120000, category: 'Konfeksi' },
    ]));
  }
  if (!localStorage.getItem(LSK.TRANSACTIONS)) {
    localStorage.setItem(LSK.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LSK.EXPENSES)) {
    localStorage.setItem(LSK.EXPENSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(LSK.PROFILE)) {
    localStorage.setItem(LSK.PROFILE, JSON.stringify({
      name: 'ZAHRA GRAFIKA',
      slogan: 'PERCETAKAN - SABLON - KONVEKSI',
      address: 'Jl. Telagasari - Kosambi, Desa Pasirmulya, Karawang',
      phone: '08953 4447 4449 / 0896 6466 6692',
      email: 'info@zahragrafika.com',
      bankAccount: 'BCA: 5745492671 (Aang Nurali)\nBRI: 410401028747537 (Aang Nurali)',
      invoiceFormat: 'Kertas A5 (Lanskap)',
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAA+JSURBVHhe7d3/S9NXGsbx50GFIlGEuDFuNZX+M7qUuN/gxjh31Lg3LgaFm6xFEUfxJhZpMbeYaG6MIV0U22LMLIyl2UyrK5ubm5tbk5s0wY0hYqA09qHzvfcx7/ke3o93z3Me4P3kE7mD/D19z3ufc+65pwuFQiFgv9vttgVCoRBPChYKhUKwWLAQCIVAsFixEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYsBAIhUCxWLAQCIVAsViwEAiFQLFYs-OF-FILE-TEXT'
    }));
  }
  if (!localStorage.getItem(LSK.INVOICE_FORMATS)) {
    localStorage.setItem(LSK.INVOICE_FORMATS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LSK.ADMINS)) {
    localStorage.setItem(LSK.ADMINS, JSON.stringify([
      { id: 'ADMIN-001', name: 'Aang Nurali', username: 'admin@percetakan.id', password: 'admin123', role: 'Administrator', avatar: '' },
    ]));
  }
}

const migrateData = () => {
  const storedVersion = parseInt(localStorage.getItem(LSK.DATA_VERSION) || '1', 10);

  if (storedVersion < 2) {
    // Migration from v1 to v2: Add 'category' to products
    console.log("Migrating data from v1 to v2...");
    const products = getData<Product>(LSK.PRODUCTS);
    const migratedProducts = products.map(p => {
      if (!p.category) {
        // Simple logic to assign a category based on name
        if (p.name.toLowerCase().includes('kaos') || p.name.toLowerCase().includes('sablon') || p.name.toLowerCase().includes('hoodie')) {
          return { ...p, category: 'Sablon' };
        }
        if (p.name.toLowerCase().includes('kemeja') || p.name.toLowerCase().includes('jaket') || p.name.toLowerCase().includes('polo')) {
          return { ...p, category: 'Konfeksi' };
        }
        return { ...p, category: 'Percetakan' };
      }
      return p;
    });
    setData(LSK.PRODUCTS, migratedProducts);
    console.log("Product migration to v2 complete.");
  }

  // Future migrations can be added here
  // if (storedVersion < 3) { ... }

  localStorage.setItem(LSK.DATA_VERSION, CURRENT_APP_VERSION.toString());
};


// --- INITIALIZATION ---
export const initializeData = () => {
  seedInitialData();
  migrateData();
};

const getData = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setData = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- ADMINS ---
export const getAdmins = (): AdminUser[] => getData<AdminUser>(LSK.ADMINS);
export const saveAdmin = (admin: AdminUser): void => {
  const admins = getAdmins();
  const index = admins.findIndex(a => a.id === admin.id);
  if (index > -1) {
    // Preserve password if it's not being changed
    const existingAdmin = admins[index];
    admins[index] = {
        ...admin,
        password: admin.password ? admin.password : existingAdmin.password,
    };
  } else {
    admins.push(admin);
  }
  setData(LSK.ADMINS, admins);
};
export const deleteAdmin = (id: string): void => {
  let admins = getAdmins();
  admins = admins.filter(a => a.id !== id);
  setData(LSK.ADMINS, admins);
};


// --- CUSTOMERS ---
export const getCustomers = (): Customer[] => getData<Customer>(LSK.CUSTOMERS);
export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index > -1) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  setData(LSK.CUSTOMERS, customers);
};
export const deleteCustomer = (id: string): void => {
  let customers = getCustomers();
  customers = customers.filter(c => c.id !== id);
  setData(LSK.CUSTOMERS, customers);
};

// --- PRODUCTS ---
export const getProducts = (): Product[] => getData<Product>(LSK.PRODUCTS);
export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index > -1) {
    products[index] = product;
  } else {
    products.push(product);
  }
  setData(LSK.PRODUCTS, products);
};
export const deleteProduct = (id: string): void => {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  setData(LSK.PRODUCTS, products);
};

// --- TRANSACTIONS ---
export const getTransactions = (): Transaction[] => {
    const transactions = getData<Transaction>(LSK.TRANSACTIONS);
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === transaction.id);
  if (index > -1) {
      transactions[index] = transaction; // Update existing
  } else {
      transactions.unshift(transaction); // Add new
  }
  setData(LSK.TRANSACTIONS, transactions);
};
export const deleteTransaction = (id: string): void => {
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    setData(LSK.TRANSACTIONS, transactions);
};
export const getNextInvoiceNumber = (): string => {
  const transactions = getTransactions();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `${year}${month}`;

  if (transactions.length === 0) {
    return `${prefix}0001`;
  }
  
  const lastInvoice = transactions[0].invoiceNumber;
  if(lastInvoice.startsWith(prefix)){
    const lastNum = parseInt(lastInvoice.substring(prefix.length), 10);
    const newNum = (lastNum + 1).toString().padStart(4, '0');
    return `${prefix}${newNum}`;
  }
  
  return `${prefix}0001`;
};

// --- EXPENSES ---
export const getExpenses = (): Expense[] => {
    const expenses = getData<Expense>(LSK.EXPENSES);
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === expense.id);
  if (index > -1) {
    expenses[index] = expense;
  } else {
    expenses.unshift(expense);
  }
  setData(LSK.EXPENSES, expenses);
};
export const deleteExpense = (id: string): void => {
  let expenses = getExpenses();
  expenses = expenses.filter(e => e.id !== id);
  setData(LSK.EXPENSES, expenses);
};

// --- INVOICE FORMATS ---
export const getInvoiceFormats = (): string[] => {
    const data = localStorage.getItem(LSK.INVOICE_FORMATS);
    return data ? JSON.parse(data) : [];
};

export const saveInvoiceFormats = (formats: string[]): void => {
    localStorage.setItem(LSK.INVOICE_FORMATS, JSON.stringify(formats));
};

// --- COMPANY PROFILE ---
export const getCompanyProfile = (): CompanyProfile => {
  const profile = localStorage.getItem(LSK.PROFILE);
  return profile ? JSON.parse(profile) : { name: '', slogan: '', address: '', phone: '', email: '', bankAccount: '', invoiceFormat: '', logo: '' };
};
export const saveCompanyProfile = (profile: CompanyProfile): void => {
  localStorage.setItem(LSK.PROFILE, JSON.stringify(profile));
};