
import React, { useState } from 'react';
import { AdminUser } from '../types';
import { getAdmins, getCompanyProfile } from '../services/dataService';

interface LoginProps {
  onLogin: (user: AdminUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin@percetakan.id');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const profile = getCompanyProfile();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admins = getAdmins();
    const foundUser = admins.find(user => user.username === username && user.password === password);

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <img src={profile.logo} alt="Company Logo" className="mx-auto w-32 h-32 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800">Selamat Datang</h1>
          <p className="text-slate-500">Silakan masuk untuk melanjutkan.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-900 rounded-md hover:bg-blue-800"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
