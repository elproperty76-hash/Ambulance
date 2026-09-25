import React, { useState } from 'react';
import { ShieldAlert, Lock, X, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { loadAdminUsers } from '../utils/storage';

interface RequirePengurusModalProps {
  isOpen: boolean;
  actionTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequirePengurusModal: React.FC<RequirePengurusModalProps> = ({
  isOpen,
  actionTitle = 'Fitur Kelola, Edit, Hapus & Reset',
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = password.trim();

    const adminUsers = loadAdminUsers();
    const isMatch =
      adminUsers.some(
        (u) =>
          (u.role === 'pengurus' || u.role === 'admin') &&
          u.passwordHash.toLowerCase() === clean.toLowerCase()
      ) ||
      clean === 'bpa123fkw' ||
      clean === 'bpa-123-fkw' ||
      clean === 'fkw123';

    if (isMatch) {
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setErrorMsg('Kata sandi salah. Hanya user terotorisasi yang memiliki hak akses.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3.5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs leading-tight">
                Otorisasi Akses Pengurus
              </h3>
              <p className="text-[10px] text-red-100">
                Akses Eksklusif Pengurus FKW-BPA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed">
            <div className="flex items-start space-x-1.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">
                  Aksi Memerlukan Akses Pengurus:
                </span>
                <span className="text-amber-800 text-[10.5px]">
                  <strong>{actionTitle}</strong>.
                </span>
                <p className="text-[10px] text-amber-700 mt-1">
                  Fitur kelola armada, supir, relawan, call center, tarif, edit, hapus data, dan reset sistem hanya dapat diakses oleh user login <strong>pengurus</strong>.
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] p-2 rounded-lg flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-800 mb-1">
              Kata Sandi Pengurus *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi pengurus..."
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-16 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-600 outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showPassword ? 'Tutup' : 'Lihat'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Akses khusus pengurus berwenang</span>
            <span className="font-semibold text-slate-600">FKW-BPA</span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verifikasi Pengurus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
