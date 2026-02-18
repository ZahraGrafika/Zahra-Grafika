
import React, { useState } from 'react';
import { CompanyProfile, AdminUser } from '../types';

interface TopbarProps {
  companyProfile: CompanyProfile | null;
  currentUser: AdminUser | null;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ companyProfile, currentUser, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-sky-300 shadow-md p-2 flex justify-between items-center z-10 text-slate-800">
      {/* Left: Company Name */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-blue-900">{companyProfile?.name || 'Zahra Grafika'}</h1>
        <p className="text-sm font-medium text-slate-700">{companyProfile?.slogan || 'Percetakan - Sablon - Konfeksi'}</p>
      </div>

      {/* Right: Admin Info */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
             <img src={currentUser?.avatar || `https://i.pravatar.cc/40?u=${currentUser?.username}`} alt="Admin" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <div className="text-left">
              <p className="font-bold">{currentUser?.name || 'Admin'}</p>
              <p className="text-sm">{currentUser?.role || 'Administrator'}</p>
            </div>
             <button onClick={onLogout} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-lg hover:bg-red-600">-</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;