import React, { useState, useEffect } from 'react';
import { FleetVehicle } from '../types';
import {
  Car,
  X,
  CheckCircle2,
  Fuel,
  HeartPulse,
  Gauge,
  UserCheck,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Wrench,
  ShieldCheck,
} from 'lucide-react';

interface EditFleetModalProps {
  isOpen?: boolean;
  onClose: () => void;
  fleet?: FleetVehicle | null;
  isNewFleet?: boolean;
  onSave: (updatedFleet: FleetVehicle) => void;
}

const DEFAULT_EQUIPMENT = [
  'Brankar Ambulance Lipat',
  'Tabung Oksigen + Regulator',
  'Kotak P3K Medis Lengkap',
  'Tandu Lipat Scoop Stretcher',
  'Sirine 6 Suara & Lightbar LED',
  'Apar Pemadam Api Ringan 2kg',
  'Tensimeter & Oximeter Digital',
];

export const EditFleetModal: React.FC<EditFleetModalProps> = ({
  isOpen = true,
  onClose,
  fleet,
  isNewFleet = false,
  onSave,
}) => {
  const [platNomor, setPlatNomor] = useState(fleet?.platNomor || '');
  const [namaUnit, setNamaUnit] = useState(fleet?.namaUnit || '');
  const [merk, setMerk] = useState(fleet?.merk || '');
  const [tahun, setTahun] = useState<number | string>(fleet?.tahun || 2023);
  const [status, setStatus] = useState<'siaga' | 'beroperasi' | 'perawatan'>(
    fleet?.status || 'siaga'
  );
  const [kmSpidometer, setKmSpidometer] = useState<number | string>(
    fleet?.kmSpidometer || 48250
  );
  const [kondisiBbmPersen, setKondisiBbmPersen] = useState<number | string>(
    fleet?.kondisiBbmPersen ?? 85
  );
  const [kondisiOksigen, setKondisiOksigen] = useState(
    fleet?.kondisiOksigen || '2 Tabung Siaga Penuh (100% & 90%)'
  );
  const [penanggungJawab, setPenanggungJawab] = useState(
    fleet?.penanggungJawab || 'Bpk. H. Sukmana (Divisi Operasional FKW)'
  );
  const [servisBerikutnya, setServisBerikutnya] = useState(
    fleet?.servisBerikutnya || '50.000 KM (Ganti Oli & Cek Rem)'
  );
  const [kelengkapan, setKelengkapan] = useState<string[]>(
    fleet?.kelengkapan && fleet.kelengkapan.length > 0
      ? fleet.kelengkapan
      : DEFAULT_EQUIPMENT
  );
  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [isUtama, setIsUtama] = useState<boolean>(fleet?.isUtama ?? true);
  const [errorValidation, setErrorValidation] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorValidation('');
    if (fleet && !isNewFleet) {
      setPlatNomor(fleet.platNomor || '');
      setNamaUnit(fleet.namaUnit || '');
      setMerk(fleet.merk || '');
      setTahun(fleet.tahun || 2023);
      setStatus(fleet.status || 'siaga');
      setKmSpidometer(fleet.kmSpidometer ?? 48250);
      setKondisiBbmPersen(fleet.kondisiBbmPersen ?? 85);
      setKondisiOksigen(fleet.kondisiOksigen || '2 Tabung Siaga Penuh (100% & 90%)');
      setPenanggungJawab(fleet.penanggungJawab || 'Divisi Operasional FKW');
      setServisBerikutnya(
        fleet.servisBerikutnya || '50.000 KM (Ganti Oli & Cek Rem)'
      );
      setKelengkapan(
        fleet.kelengkapan && fleet.kelengkapan.length > 0
          ? fleet.kelengkapan
          : DEFAULT_EQUIPMENT
      );
      setIsUtama(fleet.isUtama ?? false);
    } else if (isNewFleet) {
      setPlatNomor('');
      setNamaUnit('Ambulance Siaga 02 BPA');
      setMerk('Daihatsu Gran Max Minibus Medis');
      setTahun(new Date().getFullYear());
      setStatus('siaga');
      setKmSpidometer(15000);
      setKondisiBbmPersen(90);
      setKondisiOksigen('2 Tabung Oksigen Siaga Penuh');
      setPenanggungJawab('Pengurus Posko Siaga BPA');
      setServisBerikutnya('20.000 KM');
      setKelengkapan(DEFAULT_EQUIPMENT);
      setIsUtama(false);
    }
  }, [isOpen, fleet?.id, fleet?.platNomor, isNewFleet]);

  if (isOpen === false) return null;

  const handleAddEquipment = () => {
    if (newEquipmentItem.trim()) {
      if (!kelengkapan.includes(newEquipmentItem.trim())) {
        setKelengkapan([...kelengkapan, newEquipmentItem.trim()]);
      }
      setNewEquipmentItem('');
    }
  };

  const handleRemoveEquipment = (itemToRemove: string) => {
    setKelengkapan(kelengkapan.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidation('');
    if (!platNomor.trim()) {
      setErrorValidation('Mohon masukkan nomor polisi/plat kendaraan ambulance');
      return;
    }

    const savedFleet: FleetVehicle = {
      id: isNewFleet ? `fleet-${Date.now()}` : (fleet?.id || 'fleet-01'),
      platNomor: platNomor.trim().toUpperCase(),
      namaUnit: namaUnit.trim() || 'Ambulance Siaga BPA',
      merk: merk.trim() || 'Daihatsu Gran Max Medis',
      tahun: Number(tahun) || new Date().getFullYear(),
      status,
      kmSpidometer: Number(kmSpidometer) || 0,
      kondisiBbmPersen: Math.min(100, Math.max(0, Number(kondisiBbmPersen) || 0)),
      kondisiOksigen: kondisiOksigen.trim() || '2 Tabung Siaga Penuh',
      penanggungJawab: penanggungJawab.trim() || 'Divisi Operasional FKW-BPA',
      servisBerikutnya: servisBerikutnya.trim() || 'Servis Rutin Berkala',
      kelengkapan: kelengkapan.length > 0 ? kelengkapan : DEFAULT_EQUIPMENT,
      isUtama,
    };

    onSave(savedFleet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-3 bg-red-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs leading-tight">
                {isNewFleet
                  ? 'Tambah Armada Ambulance Baru'
                  : 'Ubah Data & Nomor Plat Ambulance'}
              </h3>
              <p className="text-[10px] text-red-100">
                {isNewFleet
                  ? 'Registrasi unit kendaraan operasional baru FKW-BPA'
                  : `Unit: ${fleet?.platNomor || platNomor || 'Ambulance BPA'}`}
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

        {/* Form Body with Scrolling */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto">
          {errorValidation && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center space-x-2">
              <span className="font-semibold">{errorValidation}</span>
            </div>
          )}

          {/* Plat Nomor Ambulance - Highlighted */}
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5">
            <label className="block text-[11px] font-bold text-amber-950 flex items-center justify-between">
              <span>Nomor Polisi / Plat Kendaraan *</span>
              <span className="text-[9px] font-semibold text-amber-800">
                Contoh: D 1945 BPA
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                placeholder="D 1945 BPA"
                required
                className="w-full bg-white border-2 border-amber-400 focus:border-amber-600 rounded-lg px-3 py-2 text-sm font-mono font-black text-slate-900 tracking-wider shadow-xs outline-none uppercase"
              />
            </div>
            <p className="text-[9.5px] text-amber-900">
              Nomor plat ini akan tertera di kop Surat Jalan, Kuitansi, dan Header aplikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Nama Unit / Panggilan *
              </label>
              <input
                type="text"
                value={namaUnit}
                onChange={(e) => setNamaUnit(e.target.value)}
                placeholder="Contoh: Ambulance Siaga 01 BPA"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Merk & Tipe Kendaraan *
              </label>
              <input
                type="text"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                placeholder="Contoh: Daihatsu Gran Max Minibus"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                Tahun Pembuatan
              </label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                placeholder="2023"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as 'siaga' | 'beroperasi' | 'perawatan'
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none font-medium"
              >
                <option value="siaga">🟢 Siaga di Posko</option>
                <option value="beroperasi">🟡 Sedang Beroperasi / Di Jalan</option>
                <option value="perawatan">🔴 Servis / Perawatan Bengkel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <Gauge className="w-3 h-3 text-slate-500 mr-1" />
                Spidometer Terakhir (KM)
              </label>
              <input
                type="number"
                value={kmSpidometer}
                onChange={(e) => setKmSpidometer(e.target.value)}
                placeholder="48250"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <Fuel className="w-3 h-3 text-amber-600 mr-1" />
                  Kondisi BBM (%)
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-700">
                  {kondisiBbmPersen}%
                </span>
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kondisiBbmPersen}
                  onChange={(e) => setKondisiBbmPersen(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
                <div className="flex-1 grid grid-cols-4 gap-0.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setKondisiBbmPersen(pct)}
                      className={`text-[9px] py-1 rounded border font-mono transition-colors ${
                        Number(kondisiBbmPersen) === pct
                          ? 'bg-amber-600 text-white border-amber-600 font-bold'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <HeartPulse className="w-3 h-3 text-blue-600 mr-1" />
                Kondisi Oksigen Medis
              </label>
              <input
                type="text"
                value={kondisiOksigen}
                onChange={(e) => setKondisiOksigen(e.target.value)}
                placeholder="2 Tabung Siaga Penuh (100% & 90%)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
                <UserCheck className="w-3 h-3 text-emerald-600 mr-1" />
                Penanggung Jawab Unit / Pool
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Bpk. H. Sukmana (Divisi Operasional)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center">
              <Wrench className="w-3 h-3 text-purple-600 mr-1" />
              Catatan Servis / Servis Berikutnya
            </label>
            <input
              type="text"
              value={servisBerikutnya}
              onChange={(e) => setServisBerikutnya(e.target.value)}
              placeholder="Contoh: 50.000 KM (Ganti Oli, Kampas Rem & Tune-up)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-none"
            />
          </div>

          {/* Kelengkapan Medis Checklist */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[10px] font-bold text-slate-700">
              Daftar Kelengkapan Peralatan Medis di Dalam Unit:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {kelengkapan.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-white text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 flex items-center space-x-1 shadow-2xs"
                >
                  <span>✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(item)}
                    className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                    title="Hapus item"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 pt-1">
              <input
                type="text"
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
                placeholder="Tambah item kelengkapan baru..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:border-red-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddEquipment}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Primary Armada Checkbox */}
          <div className="pt-1">
            <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={isUtama}
                onChange={(e) => setIsUtama(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Jadikan Armada Utama Siaga Posko
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Nomor plat unit ini akan otomatis dipakai pada penugasan baru dan header status
                </span>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isNewFleet ? 'Simpan Armada Baru' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
