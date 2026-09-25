import React, { useState, useMemo } from 'react';
import {
  AmbulanceTrip,
  RequestStatus,
  UrgencyLevel,
} from '../types';
import {
  Search,
  Filter,
  Calendar,
  User,
  HeartPulse,
  Navigation,
  Car,
  Fuel,
  DollarSign,
  Share2,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Plus,
  RotateCcw,
  Trash2,
  Database,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import { RequirePengurusModal } from './RequirePengurusModal';

interface TripHistoryTabProps {
  trips: AmbulanceTrip[];
  onSelectTrip: (trip: AmbulanceTrip) => void;
  onPrintSuratJalan: (trip: AmbulanceTrip) => void;
  onPrintKuitansi: (trip: AmbulanceTrip) => void;
  onShareWhatsApp: (trip: AmbulanceTrip) => void;
  onDeleteTrip?: (tripId: string) => void;
  onNavigateToInput?: () => void;
  isAuthenticated?: boolean;
  isPengurus?: boolean;
}

export const TripHistoryTab: React.FC<TripHistoryTabProps> = ({
  trips,
  onSelectTrip,
  onPrintSuratJalan,
  onPrintKuitansi,
  onShareWhatsApp,
  onDeleteTrip,
  onNavigateToInput,
  isAuthenticated = false,
  isPengurus = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama'>('terbaru');
  const [pengurusModal, setPengurusModal] = useState<{
    isOpen: boolean;
    trip: AmbulanceTrip | null;
  }>({
    isOpen: false,
    trip: null,
  });

  const filteredTrips = useMemo(() => {
    return trips
      .filter((trip) => {
        // Search matching
        const matchSearch =
          trip.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.pemohon.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.pasien.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.pemohon.blokRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.tujuan.namaTujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.sopir.nama.toLowerCase().includes(searchTerm.toLowerCase());

        // Status matching
        const matchStatus =
          statusFilter === 'semua' ||
          (statusFilter === 'aktif'
            ? trip.status !== 'selesai' && trip.status !== 'dibatalkan'
            : trip.status === statusFilter);

        // Urgency matching
        const matchUrgency =
          urgencyFilter === 'semua' || trip.urgency === urgencyFilter;

        return matchSearch && matchStatus && matchUrgency;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy === 'terbaru' ? dateB - dateA : dateA - dateB;
      });
  }, [trips, searchTerm, statusFilter, urgencyFilter, sortBy]);

  const handleDeleteSingle = (e: React.MouseEvent, trip: AmbulanceTrip) => {
    e.stopPropagation();
    if (!isPengurus) {
      setPengurusModal({ isOpen: true, trip });
      return;
    }
    if (
      window.confirm(
        `Hapus data riwayat perjalanan tiket ${trip.ticketNumber} (${trip.pasien.nama})?`
      )
    ) {
      if (onDeleteTrip) {
        onDeleteTrip(trip.id);
      }
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            ✅ Selesai
          </span>
        );
      case 'membawa_pasien':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-md animate-pulse">
            🚑 Dalam Perjalanan
          </span>
        );
      case 'menuju_lokasi':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            📍 Menuju Pasien
          </span>
        );
      case 'tiba_tujuan':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            🏥 Tiba di RS
          </span>
        );
      case 'disetujui':
        return (
          <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            📋 Driver Ditugaskan
          </span>
        );
      case 'menunggu':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            ⏳ Menunggu
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 pb-24 pt-1 max-w-xl mx-auto">
      {/* Top Header & Fast Action Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
        <div>
          <h2 className="text-xs font-bold text-slate-900 flex items-center">
            <Clock className="w-3.5 h-3.5 text-red-600 mr-1.5" />
            Histori Riwayat Penggunaan
          </h2>
          <span className="text-[10px] text-slate-500 font-mono font-medium">
            Total {trips.length} Catatan Tersimpan
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {onNavigateToInput && (
            <button
              onClick={onNavigateToInput}
              id="btn-history-add-new"
              title="Tambah Catatan Permohonan Baru"
              className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Input Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-input-trips"
            placeholder="Cari nama pasien, pemohon, blok, RS, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
          />
        </div>

        {/* Filter Badges Scroll */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-0.5">
            Status:
          </span>
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'aktif', label: '🔴 Aktif' },
            { id: 'selesai', label: '✅ Selesai' },
            { id: 'menunggu', label: '⏳ Menunggu' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-0.5">
            Kasus:
          </span>
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'darurat_kritis', label: 'Darurat Kritis' },
            { id: 'sedang', label: 'Rujukan' },
            { id: 'jenazah', label: 'Jenazah' },
            { id: 'rutin', label: 'Kontrol' },
          ].map((urg) => (
            <button
              key={urg.id}
              onClick={() => setUrgencyFilter(urg.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                urgencyFilter === urg.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {urg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-2">
        {filteredTrips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {trips.length === 0
                  ? 'Database Riwayat Masih Kosong'
                  : 'Tidak ada data riwayat yang cocok dengan filter'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {trips.length === 0
                  ? 'Gunakan tombol Input Baru untuk menambah data operasional pertama atau muat data default.'
                  : 'Coba sesuaikan kata kunci pencarian atau filter status.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {onNavigateToInput && (
                <button
                  onClick={onNavigateToInput}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Data Baru</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            return (
              <div
                key={trip.id}
                id={`history-trip-card-${trip.id}`}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 shadow-xs transition-all space-y-2"
              >
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        {trip.ticketNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-0.5 inline text-slate-400" />
                        {formatDateIndo(trip.requestDate)} • {trip.requestTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {trip.pasien.nama} ({trip.pasien.usia} th)
                    </h3>
                  </div>
                  <div>{getStatusBadge(trip.status)}</div>
                </div>

                {/* Patient condition & Route summary */}
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-start text-slate-700">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600 mr-1.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 text-xs">
                        {trip.pasien.diagnosaKeluhan}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Kondisi: {trip.pasien.kondisi}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start text-slate-700 pt-1 border-t border-slate-200">
                    <Navigation className="w-3.5 h-3.5 text-red-600 mr-1.5 shrink-0 mt-0.5" />
                    <div className="flex-1 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Dari:</span>{' '}
                        <strong className="text-slate-800">
                          {trip.pemohon.blokRumah}
                        </strong>
                        <span className="mx-1 text-slate-400">➔</span>
                        <span className="text-slate-500">Ke:</span>{' '}
                        <strong className="text-slate-900">
                          {trip.tujuan.namaTujuan}
                        </strong>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 ml-2">
                        {trip.tujuan.jarakKm} KM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver, BBM & Biaya Footprint */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[9px]">
                      Driver / Relawan
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {trip.sopir.nama.split(' ')[0]} / {trip.relawan.nama.split(' ')[0]}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px]">
                      Konsumsi BBM
                    </span>
                    <span className="font-semibold text-amber-800 font-mono block">
                      {trip.bbm.liter} L ({formatRupiah(trip.bbm.biayaBbm)})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px]">
                      Biaya / Infaq
                    </span>
                    <span className="font-semibold text-emerald-800 font-mono block">
                      {trip.biaya.totalTagihan === 0
                        ? 'Subsidi'
                        : formatRupiah(trip.biaya.totalTagihan)}
                    </span>
                  </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <div className="flex items-center space-x-1">
                    {/* Print Surat Jalan */}
                    <button
                      id={`btn-print-surat-${trip.id}`}
                      onClick={() => onPrintSuratJalan(trip)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[10px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Cetak Surat Jalan"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="hidden sm:inline">Surat Jalan</span>
                    </button>

                    {/* Print Kuitansi */}
                    <button
                      id={`btn-print-kuitansi-${trip.id}`}
                      onClick={() => onPrintKuitansi(trip)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[10px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Cetak Kuitansi Infaq"
                    >
                      <Printer className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">Kuitansi</span>
                    </button>

                    {/* Share WhatsApp */}
                    <button
                      id={`btn-share-wa-${trip.id}`}
                      onClick={() => onShareWhatsApp(trip)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-[10px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Kirim Laporan ke WhatsApp"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">WA</span>
                    </button>

                    {/* Delete Single Record */}
                    {onDeleteTrip && (
                      <button
                        id={`btn-delete-trip-${trip.id}`}
                        onClick={(e) => handleDeleteSingle(e, trip)}
                        className="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 px-1.5 py-1 rounded-md text-[10px] font-medium flex items-center transition-colors cursor-pointer"
                        title="Hapus Data Ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* View Details */}
                  <button
                    id={`btn-view-detail-${trip.id}`}
                    onClick={() => onSelectTrip(trip)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {pengurusModal.isOpen && pengurusModal.trip && (
        <RequirePengurusModal
          isOpen={pengurusModal.isOpen}
          title="Hapus Data Riwayat Perjalanan"
          onClose={() => setPengurusModal({ isOpen: false, trip: null })}
          onSuccess={() => {
            const t = pengurusModal.trip;
            setPengurusModal({ isOpen: false, trip: null });
            if (t && onDeleteTrip) {
              if (
                window.confirm(
                  `Hapus data riwayat perjalanan tiket ${t.ticketNumber} (${t.pasien.nama})?`
                )
              ) {
                onDeleteTrip(t.id);
              }
            }
          }}
        />
      )}
    </div>
  );
};

