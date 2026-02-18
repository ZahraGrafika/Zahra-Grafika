
import React, { useState, useEffect, useRef } from 'react';
import { getAdmins, saveAdmin, deleteAdmin } from '../services/dataService';
import { AdminUser, UserRole } from '../types';
import Modal from './common/Modal';

const SettingsAdmin: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    useEffect(() => {
        setAdmins(getAdmins());
    }, []);

    const openModal = (admin: AdminUser | null = null) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };

    const handleSave = (admin: AdminUser) => {
        saveAdmin(admin);
        setAdmins(getAdmins());
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (admins.length <= 1) {
            alert("Tidak dapat menghapus admin terakhir.");
            return;
        }
        if (window.confirm('Anda yakin ingin menghapus admin ini?')) {
            deleteAdmin(id);
            setAdmins(getAdmins());
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Pengaturan Admin</h1>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                    Tambah Admin
                </button>
            </div>
            <p className="text-slate-600 mb-6">Halaman ini ditujukan untuk mengelola akun administrator, hak akses pengguna, dan pengaturan keamanan lainnya.</p>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Nama Pengguna</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Hak Akses</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-3">
                                    {admin.avatar ? (
                                        <img src={admin.avatar} alt={admin.name} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </span>
                                    )}
                                    <span>{admin.name}</span>
                                </td>
                                <td className="px-6 py-4">{admin.username}</td>
                                <td className="px-6 py-4">{admin.role}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openModal(admin)} className="font-medium text-indigo-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(admin.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <AdminFormModal
                    adminUser={selectedAdmin}
                    onSave={handleSave}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

interface AdminFormModalProps {
    adminUser: AdminUser | null;
    onSave: (admin: AdminUser) => void;
    onClose: () => void;
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({ adminUser, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<AdminUser, 'id'>>({
        name: '',
        username: '',
        password: '',
        role: 'Kasir',
        avatar: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adminUser) {
            setFormData({
                name: adminUser.name,
                username: adminUser.username,
                password: '', // Password is not shown for editing
                role: adminUser.role,
                avatar: adminUser.avatar || '',
            });
        }
    }, [adminUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert('Ukuran file maks 1MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.username || !formData.role) {
            alert('Semua kolom harus diisi.');
            return;
        }
        if (!adminUser && !formData.password) {
            alert('Password harus diisi untuk admin baru.');
            return;
        }

        const adminPayload: AdminUser = {
            id: adminUser ? adminUser.id : `ADMIN-${Date.now()}`,
            name: formData.name,
            username: formData.username,
            role: formData.role,
            avatar: formData.avatar,
        };

        if (formData.password) {
            adminPayload.password = formData.password;
        }

        onSave(adminPayload);
    };

    return (
        <Modal title={adminUser ? 'Edit Admin' : 'Tambah Admin'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center space-y-3">
                    <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-slate-300">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    <button type="button" onClick={triggerFileSelect} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Ubah Foto
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Pengguna</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">User Pengguna</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={adminUser ? 'Kosongkan jika tidak ingin mengubah' : ''} required={!adminUser} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Hak Akses</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="Administrator">Administrator</option>
                        <option value="Owner">Owner</option>
                        <option value="Kasir">Kasir</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default SettingsAdmin;