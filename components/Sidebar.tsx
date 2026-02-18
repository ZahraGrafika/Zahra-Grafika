
import React from 'react';
import { ViewType } from '../types';
import { getCompanyProfile } from '../services/dataService';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSub?: boolean;
}> = ({ icon, label, isActive, onClick, isSub = false }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 text-gray-200 hover:bg-blue-800 ${
      isSub ? 'pl-10 text-sm' : ''
    } ${
      isActive ? 'bg-sky-400 text-white shadow-inner' : ''
    }`}
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isLaporanOpen, setIsLaporanOpen] = React.useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = React.useState(false);

  const companyProfile = getCompanyProfile();

  const toggleLaporan = () => setIsLaporanOpen(!isLaporanOpen);
  const togglePengaturan = () => setIsPengaturanOpen(!isPengaturanOpen);
    
  const menuItems: {key: ViewType, label: string, icon: React.ReactNode}[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon/> },
    { key: 'pos', label: 'POS Kasir', icon: <POSIcon/> },
    { key: 'data-pesanan', label: 'Data Pesanan', icon: <DataPesananIcon/> },
    { key: 'master-customers', label: 'Data Pelanggan', icon: <CustomersIcon/> },
    { key: 'master-products', label: 'Data Produk', icon: <ProductsIcon/> }
  ];

  return (
    <aside className="w-60 bg-blue-900 shadow-lg flex-shrink-0 flex flex-col text-white">
      <div className="p-4 flex flex-col items-center border-b border-blue-800">
        <h2 className="text-lg font-bold">Software POS Percetakan</h2>
        <img src={companyProfile.logo} alt="Company Logo" className="w-24 h-24 my-4 rounded-full bg-white p-1" />
      </div>
      <nav className="p-2 flex-grow">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label} isActive={activeView === item.key} onClick={() => setActiveView(item.key)} />
          ))}
           <li>
              <div onClick={toggleLaporan} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 text-gray-200 hover:bg-blue-800`}>
                  <ReportsIcon />
                  <span className="ml-3 font-medium flex-1">Laporan Transaksi</span>
                  <ChevronDownIcon isOpen={isLaporanOpen}/>
              </div>
              {isLaporanOpen && (
                  <ul className="pt-1 pl-4 space-y-1">
                       <NavItem icon={<CircleIcon/>} label="Laporan Keuangan" isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} isSub/>
                       <NavItem icon={<CircleIcon/>} label="Penjualan Barang" isActive={activeView === 'laporan-penjualan'} onClick={() => setActiveView('laporan-penjualan')} isSub/>
                       <NavItem icon={<CircleIcon/>} label="Transaksi Pelanggan" isActive={activeView === 'laporan-pelanggan'} onClick={() => setActiveView('laporan-pelanggan')} isSub/>
                  </ul>
              )}
           </li>
            <li>
              <div onClick={togglePengaturan} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 text-gray-200 hover:bg-blue-800`}>
                  <SettingsIcon />
                  <span className="ml-3 font-medium flex-1">Pengaturan</span>
                  <ChevronDownIcon isOpen={isPengaturanOpen}/>
              </div>
              {isPengaturanOpen && (
                  <ul className="pt-1 pl-4 space-y-1">
                       <NavItem icon={<AdminIcon/>} label="Pengaturan Admin" isActive={activeView === 'settings-admin'} onClick={() => setActiveView('settings-admin')} isSub/>
                       <NavItem icon={<AppIcon/>} label="Pengaturan Aplikasi" isActive={activeView === 'settings-app'} onClick={() => setActiveView('settings-app')} isSub/>
                       <NavItem icon={<BackupIcon/>} label="Backup Data" isActive={activeView === 'backup-data'} onClick={() => setActiveView('backup-data')} isSub/>
                  </ul>
              )}
           </li>
        </ul>
      </nav>
    </aside>
  );
};


const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const POSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 002-2V6a2 2 0 00-2-2H4zm1 2h10v2H5V6zm0 4h10v2H5v-2z" /></svg>;
const DataPesananIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3zm3.146 2.146a.5.5 0 01.708 0l2 2a.5.5 0 010 .708l-2 2a.5.5 0 01-.708-.708L8.293 8 6.146 5.854a.5.5 0 010-.708z" clipRule="evenodd" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const ProductsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>;
const BackupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ChevronDownIcon: React.FC<{isOpen: boolean}> = ({isOpen}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const CircleIcon = () => <svg viewBox="0 0 8 8" fill="currentColor" className="h-3 w-3"><circle cx="4" cy="4" r="3"></circle></svg>;

export default Sidebar;