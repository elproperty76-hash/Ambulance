import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
  Database,
  RefreshCw,
} from 'lucide-react';

interface DataResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllTrips: () => void;
  onResetToDefault: () => void;
  onResetFleetDriversOnly: () => void;
  totalTripsCount: number;
}

export const DataResetModal: React.FC<DataResetModalProps> = ({
  isOpen,
  onClose,
  onClearAllTrips,
  onResetToDefault,
  onResetFleetDriversOnly,
  totalTripsCount,
}) => {
  const [selectedAction, setSelectedAction] = useState<
    'clear_all' | 'reset_default' | 'reset_status' | null
  >(null);
  const [confirmText, setConfirmText] = useState<string>('');

  if (!isOpen) return null;

  const handleExecute = () => {
    if (selectedAction === 'clear_all') {
      onClearAllTrips();
      onClose();
    } else if (selectedAction === 'reset_default') {
      onResetToDefault();
      onClose();
    } else if (selectedAction === 'reset_status') {
      onResetFleetDriversOnly();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-red-950">
                Kelola & Reset Data Operasional
              </h3>
              <p className="text-[10px] text-red-700">
                Ambulance FKW Bumi Pesona Asri Rancaekek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-red-100 text-slate-500 hover:text-red-700 border border-red-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3 text-xs">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Pilih jenis tindakan penghapusan atau pemulihan data aplikasi di bawah ini. Saat ini tersimpan{' '}
            <strong className="text-slate-900 font-mono font-bold">
              {totalTripsCount} riwayat perjalanan
            </strong>
            .
          </p>

          <div className="space-y-2">
            {/* Option 1: Kosongkan Semua Data */}
            <div
              onClick={() => setSelectedAction('clear_all')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAction === 'clear_all'
                  ? 'bg-red-50 border-red-500 shadow-xs ring-1 ring-red-500'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Trash2 className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-red-950">
                      Hapus / Kosongkan Semua Riwayat Data
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Menghapus seluruh log perjalanan menjadi 0 data bersih. Siap untuk input baru dari nol.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="reset_opt"
                  checked={selectedAction === 'clear_all'}
                  onChange={() => setSelectedAction('clear_all')}
                  className="mt-1 accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Option 2: Reset ke Default BPA */}
            <div
              onClick={() => setSelectedAction('reset_default')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAction === 'reset_default'
                  ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-blue-950">
                      Reset ke Data Default Simulasi BPA
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Memulihkan data contoh rujukan RS, log BBM, dan data sopir/relawan standar Perum BPA.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="reset_opt"
                  checked={selectedAction === 'reset_default'}
                  onChange={() => setSelectedAction('reset_default')}
                  className="mt-1 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Option 3: Reset Status Tim & Armada */}
            <div
              onClick={() => setSelectedAction('reset_status')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAction === 'reset_status'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">
                      Reset Status Siaga Armada & Sopir Saja
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Mengembalikan seluruh sopir & unit ambulance ke status Siaga tanpa menghapus riwayat trip.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="reset_opt"
                  checked={selectedAction === 'reset_status'}
                  onChange={() => setSelectedAction('reset_status')}
                  className="mt-1 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {selectedAction === 'clear_all' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-[10px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Peringatan:</strong> Seluruh data riwayat perjalanan akan dihapus dari penyimpanan perangkat. Anda dapat menginput data baru kapan saja.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExecute}
            disabled={!selectedAction}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer ${
              !selectedAction
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : selectedAction === 'clear_all'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : selectedAction === 'reset_default'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {selectedAction === 'clear_all' ? (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Data</span>
              </>
            ) : selectedAction === 'reset_default' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Default</span>
              </>
            ) : selectedAction === 'reset_status' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Status Siaga</span>
              </>
            ) : (
              <span>Pilih Tindakan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
