import React, { useState, useEffect } from 'react';
import { RelawanMaster } from '../types';
import {
  Users2,
  X,
  UserPlus,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface AddRelawanModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSaveRelawan?: (relawan: RelawanMaster) => void;
  onSave?: (relawan: RelawanMaster) => void;
  editRelawan?: RelawanMaster | null;
  editingRelawan?: RelawanMaster | null;
}

export const AddRelawanModal: React.FC<AddRelawanModalProps> = ({
  isOpen = true,
  onClose,
  onSaveRelawan,
  onSave,
  editRelawan,
  editingRelawan,
}) => {
  const activeRelawan = editRelawan || editingRelawan;
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [blokBpa, setBlokBpa] = useState('');
  const [tim, setTim] = useState('Tim Satgas Medis BPA');
  const [keahlian, setKeahlian] = useState('Bantuan Evakuasi & Tandu');
  const [status, setStatus] = useState<'siaga' | 'bertugas' | 'tidak_aktif'>('siaga');
  const [errorValidation, setErrorValidation] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorValidation('');
    if (activeRelawan) {
      setNama(activeRelawan.nama || '');
      setNoHp(activeRelawan.noHp || '');
      setBlokBpa(activeRelawan.blokBpa || '');
      setTim(activeRelawan.tim || 'Tim Satgas Medis BPA');
      setKeahlian(activeRelawan.keahlian || 'Bantuan Evakuasi & Tandu');
      setStatus(activeRelawan.status || 'siaga');
    } else {
      setNama('');
      setNoHp('');
      setBlokBpa('');
      setTim('Tim Satgas Medis BPA');
      setKeahlian('Evakuasi Tandu & BHD Dasar');
      setStatus('siaga');
    }
  }, [isOpen, activeRelawan?.id, activeRelawan?.nama]);

  if (isOpen === false) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidation('');
    if (!nama.trim()) {
      setErrorValidation('Mohon masukkan nama lengkap relawan pendamping');
      return;
    }

    if (!noHp.trim()) {
      setErrorValidation('Mohon masukkan nomor kontak/WhatsApp relawan');
      return;
    }

    const relawanData: RelawanMaster = {
      id: activeRelawan ? activeRelawan.id : `rel-${Date.now()}`,
      nama: nama.trim(),
      noHp: noHp.trim(),
      blokBpa: blokBpa.trim() || 'Perum BPA Rancaekek',
      tim: tim.trim() || 'Satgas Medis FKW',
      keahlian: keahlian.trim() || 'Pendamping Medis & Evakuasi',
      status,
      totalPendampingan: activeRelawan ? activeRelawan.totalPendampingan : 0,
    };

    const saveFn = onSaveRelawan || onSave;
    if (saveFn) {
      saveFn(relawanData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs leading-tight">
                {activeRelawan ? 'Edit Data Relawan Medis' : 'Tambah Relawan Medis Baru'}
              </h3>
              <p className="text-[10px] text-blue-100">
                Satgas Relawan Pendamping Pasien FKW-BPA
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
              Nama Lengkap Relawan *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Kang Dedi Supriyadi"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
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
                placeholder="Contoh: 085712345678"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <MapPin className="w-3 h-3 text-slate-500 mr-1" />
                Alamat / Blok di BPA (Isi Manual)
              </label>
              <input
                type="text"
                value={blokBpa}
                onChange={(e) => setBlokBpa(e.target.value)}
                placeholder="Contoh: Blok B2 No. 09, RT 03 / RW 14"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <Shield className="w-3 h-3 text-slate-500 mr-1" />
                Tim / Divisi Satgas
              </label>
              <select
                value={tim}
                onChange={(e) => setTim(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                <option value="Tim Satgas Medis BPA">Tim Satgas Medis BPA</option>
                <option value="Tim Oksigen & P3K">Tim Oksigen & P3K</option>
                <option value="Tim Tanggap Bencana & SAR">Tim Tanggap Bencana & SAR</option>
                <option value="Divisi Pelayanan Warga">Divisi Pelayanan Warga</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                Status Siaga
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'siaga' | 'bertugas' | 'tidak_aktif')
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                <option value="siaga">🟢 Siaga On-Call (Siap Dampingi)</option>
                <option value="bertugas">🟡 Sedang Bertugas</option>
                <option value="tidak_aktif">⚪ Off / Libur</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">
              Keahlian Khusus / Peran Pendamping
            </label>
            <input
              type="text"
              value={keahlian}
              onChange={(e) => setKeahlian(e.target.value)}
              placeholder="Contoh: Evakuasi Tandu, Pasang Oksigen, Rute Cepat RS"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
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
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeRelawan ? 'Perbarui Relawan' : 'Simpan Relawan Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
