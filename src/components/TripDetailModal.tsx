import React, { useState } from 'react';
import { AmbulanceTrip, RequestStatus } from '../types';
import {
  X,
  User,
  HeartPulse,
  Navigation,
  Car,
  Fuel,
  DollarSign,
  Clock,
  Printer,
  Share2,
  Phone,
  FileText,
  CheckCircle2,
  Send,
  Calendar,
  ShieldCheck,
  Trash2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../utils/storage';

interface TripDetailModalProps {
  trip: AmbulanceTrip | null;
  onClose: () => void;
  onUpdateStatus: (tripId: string, newStatus: RequestStatus, note?: string) => void;
  onPrintSuratJalan: (trip: AmbulanceTrip) => void;
  onPrintKuitansi: (trip: AmbulanceTrip) => void;
  onShareWhatsApp: (trip: AmbulanceTrip) => void;
  onQuickCall: (phone: string, name: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  isAuthenticated?: boolean;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  onClose,
  onUpdateStatus,
  onPrintSuratJalan,
  onPrintKuitansi,
  onShareWhatsApp,
  onQuickCall,
  onDeleteTrip,
  isAuthenticated = false,
}) => {
  if (!trip) return null;

  const [newStatus, setNewStatus] = useState<RequestStatus>(trip.status);
  const [logNote, setLogNote] = useState<string>('');

  const handleApplyStatusUpdate = () => {
    onUpdateStatus(trip.id, newStatus, logNote);
    setLogNote('');
  };

  const handleDeleteThisTrip = () => {
    if (
      window.confirm(
        `Yakin ingin menghapus data perjalanan tiket ${trip.ticketNumber} (${trip.pasien.nama}) secara permanen?`
      )
    ) {
      if (onDeleteTrip) {
        onDeleteTrip(trip.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {trip.ticketNumber}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {formatDateIndo(trip.requestDate)}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mt-0.5">
              Rincian Perjalanan Ambulance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-3 space-y-3 text-xs">
          {/* Quick Action Bar for Printing & Sharing */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id="modal-btn-print-surat"
              onClick={() => onPrintSuratJalan(trip)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors text-center text-xs shadow-xs"
            >
              <FileText className="w-3 h-3 text-blue-600" />
              <span>Surat Jalan</span>
            </button>

            <button
              id="modal-btn-print-kuitansi"
              onClick={() => onPrintKuitansi(trip)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors text-center text-xs shadow-xs"
            >
              <Printer className="w-3 h-3 text-emerald-600" />
              <span>Kuitansi</span>
            </button>

            <button
              id="modal-btn-share-wa"
              onClick={() => onShareWhatsApp(trip)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors text-center shadow-xs text-xs"
            >
              <Share2 className="w-3 h-3" />
              <span>Kirim WA</span>
            </button>
          </div>

          {/* 1. Pemohon & Pasien Info */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center text-xs">
              <User className="w-3 h-3 text-red-600 mr-1" />
              Data Pemohon & Pasien
            </h4>

            <div className="grid grid-cols-2 gap-1.5 text-slate-700">
              <div>
                <span className="text-[9px] text-slate-500 block">
                  Nama Pasien:
                </span>
                <strong className="text-slate-900 text-xs">
                  {trip.pasien.nama} ({trip.pasien.usia} th /{' '}
                  {trip.pasien.jenisKelamin})
                </strong>
                <span className="text-[10px] text-amber-800 block mt-0.5">
                  {trip.pasien.diagnosaKeluhan}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block">
                  Pemohon / Kontak:
                </span>
                <span className="text-slate-800 font-semibold block text-xs">
                  {trip.pemohon.nama} ({trip.pemohon.hubungan})
                </span>
                <button
                  onClick={() =>
                    onQuickCall(trip.pemohon.noHp, trip.pemohon.nama)
                  }
                  className="text-[10px] text-emerald-700 font-mono font-medium flex items-center mt-0.5 hover:underline"
                >
                  <Phone className="w-2.5 h-2.5 mr-0.5" />
                  {trip.pemohon.noHp}
                </button>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200 text-slate-700 text-[11px]">
              <span className="text-[9px] text-slate-500 block">
                Alamat Penjemputan di BPA:
              </span>
              <p className="font-medium text-slate-800">
                {trip.pemohon.alamatLengkap}
              </p>
            </div>

            <div className="pt-0.5 text-slate-700 text-[11px]">
              <span className="text-[9px] text-slate-500 block">
                Fasilitas / Alat Medis Digunakan:
              </span>
              <p className="text-slate-800">
                {(trip.pasien?.kebutuhanAlat || []).join(', ') || 'Standar P3K'}
              </p>
            </div>
          </div>

          {/* 2. Tujuan & Petugas Info */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center text-xs">
              <Navigation className="w-3 h-3 text-blue-600 mr-1" />
              Tujuan Rujukan & Personel Bertugas
            </h4>

            <div className="grid grid-cols-2 gap-1.5 text-slate-700">
              <div>
                <span className="text-[9px] text-slate-500 block">
                  Tempat Tujuan:
                </span>
                <strong className="text-slate-900 text-xs">{trip.tujuan.namaTujuan}</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {trip.tujuan.alamat} ({trip.tujuan.jarakKm} KM)
                </p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block">
                  Sopir & Relawan:
                </span>
                <p className="text-slate-800 font-semibold text-xs">
                  Driver: {trip.sopir.nama}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Relawan: {trip.relawan.nama}
                </p>
              </div>
            </div>

            <div className="pt-0.5 text-slate-700 text-[11px]">
              <span className="text-[9px] text-slate-500 block">
                Rute Jalur:
              </span>
              <p className="text-slate-800">{trip.tujuan.ruteVia}</p>
            </div>
          </div>

          {/* 3. Bahan Bakar & Biaya Administrasi */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center text-xs">
              <DollarSign className="w-3 h-3 text-emerald-600 mr-1" />
              Rincian BBM & Biaya / Infaq Pengguna
            </h4>

            <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
              <div>
                <span className="text-slate-500 block text-[9px]">
                  Bahan Bakar ({trip.bbm.jenisBbm}):
                </span>
                <span className="text-amber-800 font-mono font-bold block text-xs">
                  {trip.bbm.liter} Liter • {formatRupiah(trip.bbm.biayaBbm)}
                  {trip.bbm.hargaPerLiter ? ` (@ ${formatRupiah(trip.bbm.hargaPerLiter)}/L)` : ''}
                </span>
                <span className="text-[9px] text-slate-500">
                  Spido: {trip.bbm.kmAwal} ➔ {trip.bbm.kmAkhir} ({trip.bbm.totalKm} KM)
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px]">
                  Total Tagihan Pengguna:
                </span>
                <span className="text-emerald-800 font-mono font-bold block text-xs">
                  {trip.biaya.totalTagihan === 0
                    ? '100% Subsidi FKW (Gratis)'
                    : formatRupiah(trip.biaya.totalTagihan)}
                </span>
                <span className="text-[9px] text-slate-500 uppercase">
                  Metode: {trip.biaya.metodeBayar} ({trip.biaya.statusBayar})
                </span>
              </div>
            </div>

            {/* Granular Cost Breakdown if available */}
            {(trip.biaya.jasaSupir !== undefined || trip.biaya.jasaRelawan !== undefined || trip.biaya.biayaParkir !== undefined || trip.biaya.biayaTol !== undefined || trip.biaya.biayaKendaraan !== undefined) && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-[9px] bg-white p-1.5 rounded-md border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500 block">Biaya Kendaraan:</span>
                  <strong className="text-indigo-700">
                    {formatRupiah(trip.biaya.biayaKendaraan ?? (trip.pemohon?.tipeWarga === 'non_warga' ? 100000 : 50000))}
                    {' '}({trip.biaya.tipeBiayaKendaraan || (trip.pemohon?.tipeWarga === 'non_warga' ? 'External' : 'Internal')})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Jasa Supir:</span>
                  <strong className="text-slate-800">{formatRupiah(trip.biaya.jasaSupir || 0)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Jasa Relawan:</span>
                  <strong className="text-slate-800">{formatRupiah(trip.biaya.jasaRelawan || 0)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Parkir RS:</span>
                  <strong className="text-slate-800">{formatRupiah(trip.biaya.biayaParkir || 0)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gerbang Tol:</span>
                  <strong className="text-slate-800">{formatRupiah(trip.biaya.biayaTol || 0)}</strong>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-600">
              <span className="text-slate-700 font-medium">Catatan Biaya:</span>{' '}
              {trip.biaya.catatanBiaya || 'Sesuai ketentuan FKW-BPA'}
            </div>
          </div>

          {/* 4. Live Timeline Tracking */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center text-xs">
              <Clock className="w-3 h-3 text-amber-600 mr-1" />
              Riwayat Timeline Perjalanan
            </h4>

            <div className="space-y-1.5 relative pl-3.5 border-l-2 border-slate-300 ml-1 mt-1.5">
              {(trip.timeline || []).map((log) => (
                <div key={log.id} className="relative group">
                  <div className="w-2 h-2 bg-red-600 rounded-full absolute -left-[18px] top-1 ring-3 ring-white" />
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[9px] text-slate-500">
                      {log.time}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {log.title}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-0.5">{log.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Update Status Real-time Form */}
          <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">
              Update Status Perjalanan Real-time
            </h4>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[9px] text-slate-600 mb-0.5 font-medium">
                  Pilih Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as RequestStatus)
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-semibold"
                >
                  <option value="menunggu">Menunggu Konfirmasi</option>
                  <option value="disetujui">Driver Ditugaskan</option>
                  <option value="menuju_lokasi">Menuju Rumah Pasien</option>
                  <option value="membawa_pasien">
                    Membawa Pasien ke RS
                  </option>
                  <option value="tiba_tujuan">Tiba di RS / Tujuan</option>
                  <option value="selesai">Trip Selesai & Kembali</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-600 mb-0.5 font-medium">
                  Catatan Progres
                </label>
                <input
                  type="text"
                  placeholder="Kondisi pasien / posisi..."
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {(newStatus === 'disetujui' || newStatus === 'selesai') && (
              <div className="bg-emerald-50 border border-emerald-300/80 rounded-lg p-2 flex items-center space-x-2 text-emerald-900 text-[11px] animate-fadeIn">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold">Otomatisasi WhatsApp: </span>
                  <span>
                    Pesan {newStatus === 'disetujui' ? 'konfirmasi penugasan driver' : 'rekapitulasi & kuitansi'} akan otomatis dikirimkan ke pemohon ({trip.pemohon.noHp}).
                  </span>
                </div>
              </div>
            )}

            <button
              id="btn-confirm-update-status"
              onClick={handleApplyStatusUpdate}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>
                {newStatus === 'disetujui' || newStatus === 'selesai'
                  ? 'Simpan & Kirim WA Otomatis ke Pemohon'
                  : 'Simpan & Siarkan Update Status'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 border-t border-slate-100 bg-white flex items-center justify-between">
          {isAuthenticated && onDeleteTrip ? (
            <button
              onClick={handleDeleteThisTrip}
              id="modal-btn-delete-trip"
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Data Ini</span>
            </button>
          ) : (
            <div className="text-[10px] text-slate-400 italic">
              Akses kelola & hapus melalui tab Personal
            </div>
          )}

          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
