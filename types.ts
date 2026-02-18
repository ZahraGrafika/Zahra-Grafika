
export type ViewType = 'dashboard' | 'pos' | 'master-customers' | 'master-products' | 'expenses' | 'reports' | 'data-pesanan' | 'laporan-penjualan' | 'laporan-pelanggan' | 'settings-app' | 'settings-admin' | 'backup-data';

export type TransactionStatus = 'Order Baru' | 'Dalam Proses' | 'Selesai' | 'Sudah Diambil';

export type UserRole = 'Administrator' | 'Owner' | 'Kasir';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  category?: string; // New field for product category
}

export interface TransactionItem {
  id: string;
  productId: string | null;
  name: string;
  detail: string;
  bahan: string;
  ukuran: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id:string;
  date: string; // ISO string
  estimasiSelesai: string; // ISO string
  invoiceNumber: string;
  customerId: string | null;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: TransactionItem[];
  subtotal: number;
  discountValue: number; // Represents both % and amount, type is implicit
  discountAmount: number;
  taxAmount: number;
  total: number;
  downPayment: number;
  remainingBalance: number;
  status: TransactionStatus;
}

export interface Expense {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  category: string;
}

export interface CompanyProfile {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  bankAccount: string;
  invoiceFormat: string;
  logo: string; // URL or base64 string
}