
import React, { useState, useEffect, useMemo } from 'react';
import { getCompanyProfile, saveCompanyProfile, getInvoiceFormats, saveInvoiceFormats } from '../services/dataService';
import { CompanyProfile } from '../types';

interface SettingsProps {
    onProfileUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState<CompanyProfile>({ name: '', slogan: '', address: '', phone: '', email: '', bankAccount: '', invoiceFormat: '', logo: '' });
  const [feedback, setFeedback] = useState('');
  const [customFormats, setCustomFormats] = useState<string[]>([]);
  const [isAddingFormat, setIsAddingFormat] = useState(false);
  const [newFormatName, setNewFormatName] = useState('');

  const defaultFormats = useMemo(() => [
    "Kertas A5 (Lanskap)",
    "Kertas A4 (Potret)",
    "Struk Thermal 80mm"
  ], []);

  const availableFormats = useMemo(() => [...defaultFormats, ...customFormats], [defaultFormats, customFormats]);

  useEffect(() => {
    setProfile(getCompanyProfile());
    setCustomFormats(getInvoiceFormats());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        alert('Ukuran file terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyProfile(profile);
    onProfileUpdate();
    setFeedback('Profil berhasil diperbarui!');
    window.scrollTo(0, 0);
    setTimeout(() => setFeedback(''), 3000);
  };
  
  const handleAddNewFormat = () => {
    if (!newFormatName.trim()) {
        alert("Nama format tidak boleh kosong.");
        return;
    }
    if (availableFormats.map(f => f.toLowerCase()).includes(newFormatName.trim().toLowerCase())) {
        alert("Nama format sudah ada.");
        return;
    }

    const updatedCustomFormats = [...customFormats, newFormatName.trim()];
    saveInvoiceFormats(updatedCustomFormats);
    setCustomFormats(updatedCustomFormats);
    setProfile(prev => ({...prev, invoiceFormat: newFormatName.trim()}));
    setNewFormatName('');
    setIsAddingFormat(false);
  };

  const handleCancelAddFormat = () => {
      setNewFormatName('');
      setIsAddingFormat(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Aplikasi</h1>
      {feedback && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">{feedback}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Section */}
            <div className="md:col-span-1 flex flex-col items-center">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Logo Perusahaan</label>
                 <div className="mt-2 flex flex-col items-center space-y-4">
                    <span className="inline-block h-32 w-32 overflow-hidden rounded-full bg-gray-100 ring-4 ring-slate-200">
                        {profile.logo ? (
                            <img src={profile.logo} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </span>
                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                        Ganti Logo
                    </label>
                 </div>
            </div>
            {/* Details Section */}
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Perusahaan</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Slogan Perusahaan</label>
                    <input type="text" name="slogan" value={profile.slogan} onChange={handleChange} placeholder="Contoh: Percetakan - Sablon - Konfeksi" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
        </div>

        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Alamat Perusahaan</label>
            <textarea name="address" value={profile.address} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Akun Bank</label>
            <textarea name="bankAccount" value={profile.bankAccount} onChange={handleChange} placeholder="Contoh: BCA: 123456789 (a/n Nama)" rows={3} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700">No. Telp. / HP. Perusahaan</label>
            <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Perusahaan</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Format Kertas Nota</label>
                {!isAddingFormat && (
                    <button
                        type="button"
                        onClick={() => setIsAddingFormat(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                        + Tambah Baru
                    </button>
                )}
            </div>
            {isAddingFormat ? (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newFormatName}
                        onChange={(e) => setNewFormatName(e.target.value)}
                        placeholder="Contoh: Struk Thermal 58mm"
                        className="flex-grow mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                    />
                    <button type="button" onClick={handleAddNewFormat} className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Simpan</button>
                    <button type="button" onClick={handleCancelAddFormat} className="px-3 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Batal</button>
                </div>
            ) : (
                <select
                    name="invoiceFormat"
                    value={profile.invoiceFormat}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {availableFormats.map(format => (
                        <option key={format} value={format}>{format}</option>
                    ))}
                </select>
            )}
        </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
