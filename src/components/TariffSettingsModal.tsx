import React, { useState } from 'react';
import { TariffConfig } from '../types';
import {
  X,
  Fuel,
  DollarSign,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Car,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah } from '../utils/storage';
import { INITIAL_TARIFF_CONFIG } from '../data/mockData';

interface TariffSettingsModalProps {
  tariffConfig: TariffConfig;
  onSave: (newConfig: TariffConfig) => void;
  onClose: () => void;
}

export const TariffSettingsModal: React.FC<TariffSettingsModalProps> = ({
  tariffConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<TariffConfig>({ ...tariffConfig });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const handleResetDefault = () => {
    if (
      window.confirm(
        'Kembalikan semua nilai tarif & harga BBM ke pengaturan standar FKW-BPA?'
      )
    ) {
      setConfig({ ...INITIAL_TARIFF_CONFIG });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs">
                Pengaturan Tarif Operasional & Harga BBM
              </h3>
              <p className="text-[10px] text-slate-300">
                Formula Perhitungan Biaya Jarak Tempuh Ambulance FKW-BPA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-3.5 text-xs overflow-y-auto"
        >
          {/* 1. Nilai BBM per Liter Saat Ini */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
              <span className="font-bold text-amber-900 text-xs flex items-center">
                <Fuel className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                1. Harga BBM per Liter Saat Ini
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                Efisiensi: 1 Liter / {config.kmPerLiter} KM
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold text-[10px] mb-0.5">
                  Pertalite (RON 90) / Liter
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={config.hargaPertalite}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hargaPertalite: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-[10px] mb-0.5">
                  Pertamax (RON 92) / Liter
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={config.hargaPertamax}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hargaPertamax: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-[10px] mb-0.5">
                  Solar Subsidi / Liter
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={config.hargaSolar}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hargaSolar: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-[10px] mb-0.5">
                  Dexlite / Liter
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={config.hargaDexlite}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hargaDexlite: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-[10px] mb-0.5">
                Rasio Konsumsi BBM Kendaraan (KM per 1 Liter BBM)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="20"
                value={config.kmPerLiter}
                onChange={(e) =>
                  setConfig({ ...config, kmPerLiter: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Standar operasional ambulance Gran Max perkotaan: 8.0 KM/Liter
              </p>
            </div>
          </div>

          {/* 2. Jasa Operasional Supir & Relawan */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2">
            <span className="font-bold text-blue-950 text-xs flex items-center border-b border-blue-200/80 pb-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              2. Jasa Operasional Supir & Relawan Medis
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-800 uppercase flex items-center">
                  <Car className="w-3 h-3 text-blue-600 mr-1" />
                  Jasa Sopir
                </p>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-0.5">
                    Dasar per Trip (Rp)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={config.jasaSupirPerTrip}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        jasaSupirPerTrip: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-0.5">
                    Tambahan per KM (Rp)
                  </label>
                  <input
                    type="number"
                    step="250"
                    value={config.jasaSupirPerKm}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        jasaSupirPerKm: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-l border-blue-200 pl-2">
                <p className="text-[10px] font-bold text-slate-800 uppercase flex items-center">
                  <Users className="w-3 h-3 text-emerald-600 mr-1" />
                  Jasa Relawan Medis
                </p>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-0.5">
                    Dasar per Trip (Rp)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={config.jasaRelawanPerTrip}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        jasaRelawanPerTrip: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-0.5">
                    Tambahan per KM (Rp)
                  </label>
                  <input
                    type="number"
                    step="250"
                    value={config.jasaRelawanPerKm}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        jasaRelawanPerKm: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Parkir, Gerbang Tol & Oksigen Medis */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <span className="font-bold text-slate-900 text-xs flex items-center border-b border-slate-200 pb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-700 mr-1.5" />
              3. Parkir, Tol & Oksigen Medis
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">
                  Parkir Standar RS
                </label>
                <input
                  type="number"
                  step="1000"
                  value={config.biayaParkirDefault}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      biayaParkirDefault: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">
                  Estimasi Tol/KM (Jika Tol)
                </label>
                <input
                  type="number"
                  step="100"
                  value={config.biayaTolPerKm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      biayaTolPerKm: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">
                  Oksigen & Sanitasi
                </label>
                <input
                  type="number"
                  step="5000"
                  value={config.biayaOksigenSanitasi}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      biayaOksigenSanitasi: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Biaya Kendaraan (Internal & External) */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1.5">
              <span className="font-bold text-indigo-950 text-xs flex items-center">
                <Car className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                4. Biaya Kendaraan (Internal & External)
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                Otomatis via Domisili Pemohon
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-2 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-indigo-950 font-bold text-[10px]">
                    Internal (Warga BPA)
                  </label>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    50 Ribu
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={config.biayaKendaraanInternal ?? 50000}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        biayaKendaraanInternal: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">
                  Diterapkan otomatis untuk warga perumahan BPA
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-indigo-950 font-bold text-[10px]">
                    External (Luar Perumahan)
                  </label>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                    100 Ribu
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={config.biayaKendaraanExternal ?? 100000}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        biayaKendaraanExternal: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">
                  Diterapkan otomatis untuk pemohon luar perumahan
                </p>
              </div>
            </div>
          </div>

          {/* 5. Subsidi Kas RT/RW (Nilai Tetap) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
              <span className="font-bold text-blue-950 text-xs flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                5. Subsidi Kas RT/RW (Nilai Tetap)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                Standar: Rp 100.000
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-blue-200 flex items-center justify-between">
              <div>
                <label className="block text-blue-950 font-bold text-[11px]">
                  Nominal Subsidi Tetap Kas RT/RW
                </label>
                <p className="text-[9.5px] text-slate-500">
                  Besaran potongan tetap ketika skema Subsidi Kas RT/RW dipilih pada formulir input
                </p>
              </div>
              <div className="relative w-36">
                <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">
                  Rp
                </span>
                <input
                  type="number"
                  step="5000"
                  value={config.subsidiKasRtRw ?? 100000}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      subsidiKasRtRw: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-1 text-xs text-blue-950 font-mono font-bold text-right focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Contoh Simulasi Cepat */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="font-bold text-emerald-900 text-xs flex items-center mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Simulasi Hitung (Jarak PP 20 KM Pertalite):
            </span>
            <div className="text-[10px] text-emerald-800 space-y-0.5 font-mono">
              <p>
                • BBM ({((20) / config.kmPerLiter).toFixed(1)} L x {formatRupiah(config.hargaPertalite)}):{' '}
                <strong>
                  {formatRupiah(
                    ((20) / config.kmPerLiter) * config.hargaPertalite
                  )}
                </strong>
              </p>
              <p>
                • Biaya Kendaraan (Internal / External):{' '}
                <strong>
                  {formatRupiah(config.biayaKendaraanInternal ?? 50000)} / {formatRupiah(config.biayaKendaraanExternal ?? 100000)}
                </strong>
              </p>
              <p>
                • Jasa Supir ({formatRupiah(config.jasaSupirPerTrip)} + 20km x {formatRupiah(config.jasaSupirPerKm)}):{' '}
                <strong>
                  {formatRupiah(
                    config.jasaSupirPerTrip + 20 * config.jasaSupirPerKm
                  )}
                </strong>
              </p>
              <p>
                • Jasa Relawan ({formatRupiah(config.jasaRelawanPerTrip)} + 20km x {formatRupiah(config.jasaRelawanPerKm)}):{' '}
                <strong>
                  {formatRupiah(
                    config.jasaRelawanPerTrip + 20 * config.jasaRelawanPerKm
                  )}
                </strong>
              </p>
              <p>
                • Parkir + O2: <strong>{formatRupiah(config.biayaParkirDefault + config.biayaOksigenSanitasi)}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

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
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
