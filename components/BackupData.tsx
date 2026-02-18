import React, { useState } from 'react';
import { LSK } from '../services/dataService';

const BackupData: React.FC = () => {
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleBackup = async () => {
    try {
      const backupData: { [key: string]: any } = {};
      Object.values(LSK).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            backupData[key] = JSON.parse(data);
          } catch (e) {
            backupData[key] = data;
          }
        }
      });

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const date = new Date().toISOString().split('T')[0];
      const fileName = `backup-pos-percetakan-${date}.json`;

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          showFeedback('Backup berhasil disimpan.', 'success');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.warn('showSaveFilePicker failed, falling back to legacy download.', err);
        }
      }
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showFeedback('Backup berhasil diunduh.', 'success');

    } catch (error) {
      console.error('Backup failed:', error);
      showFeedback('Terjadi kesalahan saat membuat backup.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setRestoreFile(file);
    } else {
      setRestoreFile(null);
      if (file) showFeedback('Harap pilih file dengan format .json', 'error');
    }
  };

  const handleRestore = () => {
    if (!restoreFile) return;
    const confirmation = window.confirm('PERINGATAN: Aksi ini akan menimpa SEMUA data yang ada saat ini dengan data dari file backup. Anda yakin ingin melanjutkan?');
    if (!confirmation) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== 'object' || data === null || !Object.values(LSK).some(key => data[key])) {
            throw new Error('File backup tidak valid atau kosong.');
        }
        Object.values(LSK).forEach(key => {
          if (data[key]) localStorage.setItem(key, JSON.stringify(data[key]));
        });
        showFeedback('Data berhasil dipulihkan. Aplikasi akan dimuat ulang...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('Restore failed:', error);
        showFeedback(error instanceof Error ? error.message : 'Gagal memulihkan data dari file.', 'error');
      }
    };
    reader.readAsText(restoreFile);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Backup & Restore Data Lokal</h1>
      <p className="text-slate-600 mb-6">Simpan atau pulihkan semua data aplikasi Anda ke dalam satu file. Ini berguna untuk memindahkan data antar perangkat atau sebagai cadangan keamanan.</p>

      {feedback && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
            feedback.type === 'success' ? 'bg-green-100 text-green-800' :
            feedback.type === 'info' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
        }`} role="alert">
            {feedback.message}
        </div>
      )}

      {/* Local Backup Section */}
      <div className="border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
            <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <div>
                <h2 className="text-lg font-semibold">Backup Lokal</h2>
                <p className="text-slate-500 text-sm">Simpan semua data Anda sebagai file di komputer ini.</p>
            </div>
        </div>
        <div className="mt-4 text-right">
            <button onClick={handleBackup} className="px-5 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                Backup Sekarang
            </button>
        </div>
      </div>

      {/* Local Restore Section */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
         <div className="flex items-center">
            <div className="mr-4 text-red-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-red-800">Restore Lokal</h2>
                <p className="text-red-700 text-sm">Pilih file backup (.json) dari komputer untuk memulihkan data.</p>
            </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <input id="restore-file-input" type="file" accept=".json" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <button onClick={handleRestore} disabled={!restoreFile} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
            Restore Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupData;