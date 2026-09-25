import React, { useState, useEffect } from 'react';
import { CallCenterContact } from '../types';
import { X, PhoneCall, Save, Trash2, Shield, CheckCircle2 } from 'lucide-react';

interface AddCallCenterModalProps {
  initialContact?: CallCenterContact | null;
  onSave: (contact: CallCenterContact) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const AddCallCenterModal: React.FC<AddCallCenterModalProps> = ({
  initialContact,
  onSave,
  onDelete,
  onClose,
}) => {
  const [nama, setNama] = useState(initialContact?.nama || '');
  const [jabatan, setJabatan] = useState(
    initialContact?.jabatan || 'Koordinator Operasional / Posko Utama'
  );
  const [noHp, setNoHp] = useState(initialContact?.noHp || '');
  const [isUtama, setIsUtama] = useState(initialContact?.isUtama ?? false);
  const [tersedia24Jam, setTersedia24Jam] = useState(
    initialContact?.tersedia24Jam ?? true
  );
  const [catatan, setCatatan] = useState(initialContact?.catatan || '');

  useEffect(() => {
    if (initialContact) {
      setNama(initialContact.nama);
      setJabatan(initialContact.jabatan);
      setNoHp(initialContact.noHp);
      setIsUtama(initialContact.isUtama);
      setTersedia24Jam(initialContact.tersedia24Jam);
      setCatatan(initialContact.catatan || '');
    }
  }, [initialContact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Mohon isi nama petugas / penanggung jawab call center');
      return;
    }
    if (!noHp.trim()) {
      alert('Mohon isi nomor telepon / WhatsApp call center');
      return;
    }

    const contactToSave: CallCenterContact = {
      id: initialContact ? initialContact.id : `cc-${Date.now()}`,
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      noHp: noHp.trim(),
      isUtama,
      tersedia24Jam,
      catatan: catatan.trim() || undefined,
    };

    onSave(contactToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs">
                {initialContact
                  ? 'Ubah Kontak Call Center'
                  : 'Tambah Call Center Utama / Hotline'}
              </h3>
              <p className="text-[10px] text-red-100">
                Divisi Ambulance FKW Bumi Pesona Asri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {/* Nama Penanggung Jawab */}
          <div>
            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
              Nama Lengkap / Nama Kontak Call Center <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bpk. H. Sukmana / Posko Utama FKW"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          {/* Jabatan / Peran Posko */}
          <div>
            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
              Jabatan / Posko Operasional <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Koordinator Operasional / Posko Utama BPA"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                'Koordinator Operasional / Posko Utama',
                'Pusat Komando Ambulance BPA',
                'Ketua Satgas Medis & O2',
                'Sekretariat FKW-BPA',
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setJabatan(role)}
                  className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer border border-slate-200 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Nomor HP / WhatsApp */}
          <div>
            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
              Nomor Telepon / WhatsApp Call Center <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="0812-2345-6789 atau 0857-8910-1122"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-mono font-semibold"
            />
          </div>

          {/* Checklist Status Call Center */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUtama}
                onChange={(e) => setIsUtama(e.target.checked)}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center">
                  <Shield className="w-3.5 h-3.5 text-amber-600 mr-1" />
                  Jadikan Call Center Utama (Prioritas Hotline)
                </span>
                <p className="text-[10px] text-slate-500">
                  Akan ditampilkan paling atas di banner darurat & tombol telepon cepat
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer pt-1.5 border-t border-slate-200">
              <input
                type="checkbox"
                checked={tersedia24Jam}
                onChange={(e) => setTersedia24Jam(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  Layanan Siaga 24 Jam Aktif
                </span>
                <p className="text-[10px] text-slate-500">
                  Dapat dihubungi sewaktu-waktu siang & malam hari
                </p>
              </div>
            </label>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
              Catatan / Info Lokasi Piket (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Piket Posko Siaga Sekretariat RW 14 BPA"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            {initialContact && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Hapus kontak call center "${initialContact.nama}"?`
                    )
                  ) {
                    onDelete(initialContact.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center space-x-2">
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
                <Save className="w-3.5 h-3.5" />
                <span>{initialContact ? 'Simpan Perubahan' : 'Tambah Kontak'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
