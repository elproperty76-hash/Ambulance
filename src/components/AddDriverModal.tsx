import React, { useState, useEffect } from 'react';
import { DriverMaster } from '../types';
import {
  Car,
  X,
  UserPlus,
  Phone,
  MapPin,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

interface AddDriverModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSaveDriver?: (driver: DriverMaster) => void;
  onSave?: (driver: DriverMaster) => void;
  editDriver?: DriverMaster | null;
  editingDriver?: DriverMaster | null;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen = true,
  onClose,
  onSaveDriver,
  onSave,
  editDriver,
  editingDriver,
}) => {
  const activeDriver = editDriver || editingDriver;
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamatBpa, setAlamatBpa] = useState('');
  const [nomorSim, setNomorSim] = useState('SIM A');
  const [status, setStatus] = useState<'siaga' | 'bertugas' | 'libur'>('siaga');
  const [errorValidation, setErrorValidation] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorValidation('');
    if (activeDriver) {
      setNama(activeDriver.nama || '');
      setNoHp(activeDriver.noHp || '');
      setAlamatBpa(activeDriver.alamatBpa || '');
      setNomorSim(activeDriver.nomorSim || 'SIM A');
      setStatus(activeDriver.status || 'siaga');
    } else {
      setNama('');
      setNoHp('');
      setAlamatBpa('');
      setNomorSim('SIM A');
      setStatus('siaga');
    }
  }, [isOpen, activeDriver?.id, activeDriver?.nama]);

  if (isOpen === false) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidation('');
    if (!nama.trim()) {
      setErrorValidation('Mohon masukkan nama lengkap supir/driver');
      return;
    }

    if (!noHp.trim()) {
      setErrorValidation('Mohon masukkan nomor telepon/WhatsApp supir');
      return;
    }

    const driverData: DriverMaster = {
      id: activeDriver ? activeDriver.id : `drv-${Date.now()}`,
      nama: nama.trim(),
      noHp: noHp.trim(),
      alamatBpa: alamatBpa.trim() || 'Perum BPA Rancaekek',
      nomorSim: nomorSim.trim() || 'SIM A',
      status,
      totalTrip: activeDriver ? activeDriver.totalTrip : 0,
      rating: activeDriver ? activeDriver.rating : 5.0,
    };

    const saveFn = onSaveDriver || onSave;
    if (saveFn) {
      saveFn(driverData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs leading-tight">
                {activeDriver ? 'Edit Data Supir Ambulance' : 'Tambah Supir / Driver Baru'}
              </h3>
              <p className="text-[10px] text-emerald-100">
                Roster Pengemudi Tanggap Darurat FKW-BPA
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {errorValidation && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center space-x-2">
              <span className="font-semibold">{errorValidation}</span>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-slate-800 mb-1">
              Nama Lengkap Supir *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Bpk. Ahmad Fauzi"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <Phone className="w-3 h-3 text-slate-500 mr-1" />
                No. WhatsApp / HP *
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <FileCheck className="w-3 h-3 text-slate-500 mr-1" />
                Nomor / Jenis SIM
              </label>
              <input
                type="text"
                value={nomorSim}
                onChange={(e) => setNomorSim(e.target.value)}
                placeholder="SIM A / SIM B1"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
              <MapPin className="w-3 h-3 text-slate-500 mr-1" />
              Alamat / Blok Rumah di BPA (Isi Manual)
            </label>
            <input
              type="text"
              value={alamatBpa}
              onChange={(e) => setAlamatBpa(e.target.value)}
              placeholder="Contoh: Blok C3 No. 12, RT 02 / RW 14"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">
              Status Awal Penugasan
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'siaga' | 'bertugas' | 'libur')
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 outline-none font-medium"
            >
              <option value="siaga">🟢 Siaga On-Call (Siap Ditugaskan)</option>
              <option value="bertugas">🟡 Sedang Bertugas</option>
              <option value="libur">⚪ Sedang Libur / Tidak Tersedia</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2.5 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeDriver ? 'Perbarui Supir' : 'Simpan Supir Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
