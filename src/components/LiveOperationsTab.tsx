import React, { useState } from 'react';
import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  RequestStatus,
} from '../types';
import {
  Activity,
  Phone,
  Clock,
  MapPin,
  User,
  HeartPulse,
  Fuel,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Navigation,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileText,
  DollarSign,
  Car,
  BellRing,
  Zap,
  Radio,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../utils/storage';

interface LiveOperationsTabProps {
  trips: AmbulanceTrip[];
  drivers: DriverMaster[];
  relawan: RelawanMaster[];
  fleet: FleetVehicle;
  onUpdateTripStatus: (
    tripId: string,
    newStatus: RequestStatus,
    note?: string
  ) => void;
  onSelectTrip: (trip: AmbulanceTrip) => void;
  onNavigateToInput: () => void;
  onQuickCallDriver: (phone: string, name: string) => void;
}

export const LiveOperationsTab: React.FC<LiveOperationsTabProps> = ({
  trips,
  drivers,
  relawan,
  fleet,
  onUpdateTripStatus,
  onSelectTrip,
  onNavigateToInput,
  onQuickCallDriver,
}) => {
  const [selectedTripIdForUpdate, setSelectedTripIdForUpdate] = useState<
    string | null
  >(null);
  const [updateNote, setUpdateNote] = useState<string>('');

  // Active trips that are not completed or cancelled
  const activeTrips = trips.filter(
    (t) => t.status !== 'selesai' && t.status !== 'dibatalkan'
  );

  // Pending / Waiting trips that need immediate dispatcher attention
  const pendingTrips = activeTrips.filter((t) => t.status === 'menunggu');

  const completedTodayCount = trips.filter((t) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return t.requestDate === todayStr && t.status === 'selesai';
  }).length;

  const totalBbmMonth = trips
    .filter((t) => t.status === 'selesai')
    .reduce((acc, curr) => acc + (curr.bbm?.biayaBbm || 0), 0);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="bg-amber-500 text-white border border-amber-600 text-[10px] px-2.5 py-0.5 rounded font-bold flex items-center gap-1.5 shadow-xs animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-200"></span>
            </span>
            <span>Menunggu Dispatch</span>
          </span>
        );
      case 'disetujui':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Driver Siaga
          </span>
        );
      case 'menuju_lokasi':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5 text-indigo-600" />
            Menuju Pasien
          </span>
        );
      case 'membawa_pasien':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <HeartPulse className="w-2.5 h-2.5 text-rose-600" />
            Ke RS Rujukan
          </span>
        );
      case 'tiba_tujuan':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-emerald-600" />
            Tiba di Lokasi
          </span>
        );
      case 'selesai':
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded font-semibold">
            Selesai
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'darurat_kritis':
        return (
          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
            🚨 DARURAT KRITIS
          </span>
        );
      case 'jenazah':
        return (
          <span className="bg-slate-800 text-slate-100 border border-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
            🏴 JENAZAH
          </span>
        );
      case 'sedang':
        return (
          <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
            ⚠️ MENDESAK
          </span>
        );
      default:
        return (
          <span className="bg-blue-600 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
            ℹ️ KONTROL
          </span>
        );
    }
  };

  const handleNextStatus = (trip: AmbulanceTrip) => {
    let nextStatus: RequestStatus = 'selesai';
    if (trip.status === 'menunggu') nextStatus = 'disetujui';
    else if (trip.status === 'disetujui') nextStatus = 'menuju_lokasi';
    else if (trip.status === 'menuju_lokasi') nextStatus = 'membawa_pasien';
    else if (trip.status === 'membawa_pasien') nextStatus = 'tiba_tujuan';
    else if (trip.status === 'tiba_tujuan') nextStatus = 'selesai';

    onUpdateTripStatus(
      trip.id,
      nextStatus,
      updateNote || `Update status otomatis: ${nextStatus}`
    );
    setSelectedTripIdForUpdate(null);
    setUpdateNote('');
  };

  return (
    <div className="space-y-3 pb-20 pt-1">
      {/* Alert Banner / Live Status Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xs text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <h2 className="text-xs font-bold text-white tracking-wider uppercase">
              STATUS ARMADA SIAGA FKW-BPA
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
            {fleet.platNomor}
          </span>
        </div>

        {/* Quick Fleet Indicators */}
        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="bg-slate-800/90 rounded-lg p-2 border border-slate-700/60 flex flex-col items-center text-center">
            <Car className="w-4 h-4 text-red-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 font-medium">Status Unit</span>
            <span className={`text-[11px] font-bold uppercase ${fleet.status === 'beroperasi' ? 'text-amber-400' : fleet.status === 'perawatan' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {fleet.status === 'beroperasi' ? 'BEROPERASI' : fleet.status === 'perawatan' ? 'PERAWATAN' : 'SIAGA DI POOL'}
            </span>
          </div>

          <div className="bg-slate-800/90 rounded-lg p-2 border border-slate-700/60 flex flex-col items-center text-center">
            <Fuel className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 font-medium">Bahan Bakar</span>
            <span className="text-[11px] font-bold text-amber-300">
              {fleet.kondisiBbmPersen}% (Pertalite)
            </span>
          </div>

          <div className="bg-slate-800/90 rounded-lg p-2 border border-slate-700/60 flex flex-col items-center text-center">
            <HeartPulse className="w-4 h-4 text-blue-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 font-medium">Tabung O2</span>
            <span className="text-[11px] font-bold text-blue-300">2 Tabung Siaga</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1.5 border-t border-slate-800">
          <span className="flex items-center text-slate-400">
            <MapPin className="w-3 h-3 text-red-400 mr-1" />
            Pool: Posko Masjid Jami Al Adnan
          </span>
          <span className="text-slate-400 font-mono">
            Spido: {fleet.kmSpidometer.toLocaleString('id-ID')} KM
          </span>
        </div>
      </div>

      {/* Emergency Quick Action Bar */}
      <div className="flex items-center gap-2">
        <button
          id="btn-quick-new-trip"
          onClick={onNavigateToInput}
          className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-red-500"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Permintaan Ambulance Baru</span>
        </button>
      </div>

      {/* Active Trips Section */}
      <div>
        {/* Dispatcher Alert Banner when new 'menunggu' requests arrive */}
        {pendingTrips.length > 0 && (
          <div
            id="dispatch-pending-alert-banner"
            className="mb-2.5 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border-2 border-amber-500 rounded-xl p-3 shadow-md relative overflow-hidden ring-4 ring-amber-400/25 animate-pulse"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BellRing className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">
                      Panggilan Masuk
                    </span>
                    <span className="text-xs font-bold text-amber-950">
                      {pendingTrips.length} Permintaan Menunggu Dispatch!
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight mt-0.5">
                    Pasien membutuhkan respon cepat. Segera konfirmasi dan tugaskan supir/relawan.
                  </p>
                </div>
              </div>

              <a
                href={`#active-trip-card-${pendingTrips[0].id}`}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 shadow-xs flex items-center space-x-1 transition-colors"
              >
                <span>Lihat ({pendingTrips.length})</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Trip Aktif / Dalam Penanganan ({activeTrips.length})
            </h3>
            {pendingTrips.length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {pendingTrips.length} Menunggu
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Real-time update</span>
        </div>

        {activeTrips.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-500 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-800">
              Saat Ini Tidak Ada Perjalanan Aktif
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
              Armada Ambulance FKW-BPA dan seluruh driver/relawan dalam posisi
              siaga 24 jam untuk melayani warga Perumahan Bumi Pesona Asri.
            </p>
            <button
              id="btn-add-trip-empty"
              onClick={onNavigateToInput}
              className="mt-3 inline-flex items-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Buat Catatan Perjalanan Baru
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeTrips.map((trip) => {
              const isWaiting = trip.status === 'menunggu';

              return (
                <div
                  key={trip.id}
                  id={`active-trip-card-${trip.id}`}
                  className={`bg-white rounded-xl p-3 shadow-xs space-y-2 relative transition-all ${
                    isWaiting
                      ? 'border-2 border-amber-500 ring-4 ring-amber-400/30 bg-gradient-to-b from-amber-50/40 via-white to-white'
                      : 'border-2 border-red-500'
                  }`}
                >
                  {/* Pulsing Dispatch Alert Ribbon for 'menunggu' trips */}
                  {isWaiting && (
                    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-between shadow-xs animate-pulse">
                      <div className="flex items-center space-x-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-200"></span>
                        </span>
                        <span className="tracking-wide">
                          ⚡ PERMINTAAN BARU — BUTUH DISPATCH SEGERA
                        </span>
                      </div>
                      <span className="text-[8px] bg-black/20 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                        Menunggu Respon
                      </span>
                    </div>
                  )}

                  {/* Header Trip Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                          {trip.ticketNumber}
                        </span>
                        {getUrgencyBadge(trip.urgency)}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 flex items-center">
                        <User className="w-3.5 h-3.5 text-red-600 mr-1 inline shrink-0" />
                        Pasien: {trip.pasien.nama} ({trip.pasien.usia} th /{' '}
                        {trip.pasien.jenisKelamin})
                      </h4>
                    </div>
                    <div>{getStatusBadge(trip.status)}</div>
                  </div>

                  {/* Diagnosa / Kondisi */}
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-xs space-y-0.5">
                    <div className="flex items-start text-slate-700">
                      <span className="text-slate-500 font-semibold w-24 shrink-0">
                        Keluhan Medis:
                      </span>
                      <span className="font-bold text-slate-900">
                        {trip.pasien.diagnosaKeluhan}
                      </span>
                    </div>
                    <div className="flex items-start text-slate-700">
                      <span className="text-slate-500 font-semibold w-24 shrink-0">
                        Kondisi / Alat:
                      </span>
                      <span className="text-slate-800">
                        {trip.pasien.kondisi} •{' '}
                        {(trip.pasien.kebutuhanAlat || []).join(', ') || 'Standar P3K'}
                      </span>
                    </div>
                  </div>

                  {/* Route & Location Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600 mr-1" />
                        Penjemputan (BPA)
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {trip.pemohon.blokRumah}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {trip.pemohon.nama} ({trip.pemohon.noHp})
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center">
                        <Navigation className="w-2.5 h-2.5 text-red-600 mr-1" />
                        Tujuan Rujukan
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5 truncate">
                        {trip.tujuan.namaTujuan}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {trip.tujuan.jarakKm} KM • {trip.tujuan.ruteVia}
                      </p>
                    </div>
                  </div>

                  {/* Driver & Relawan Info with Quick Call */}
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] border border-red-200">
                        DR
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {trip.sopir.nama}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Relawan: {trip.relawan.nama}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        id={`btn-call-driver-${trip.id}`}
                        onClick={() =>
                          onQuickCallDriver(trip.sopir.noHp, trip.sopir.nama)
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-md transition-colors cursor-pointer"
                        title="Hubungi Driver"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      <button
                        id={`btn-call-pemohon-${trip.id}`}
                        onClick={() =>
                          onQuickCallDriver(
                            trip.pemohon.noHp,
                            trip.pemohon.nama
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors cursor-pointer"
                        title="Hubungi Pemohon / Keluarga"
                      >
                        <User className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Real-time Stepper Progress Tracker */}
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-600 mb-1.5">
                      Progres Perjalanan:
                    </p>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {[
                        { key: 'menunggu', label: 'Masuk' },
                        { key: 'disetujui', label: 'Tugas' },
                        { key: 'menuju_lokasi', label: 'Jemput' },
                        { key: 'membawa_pasien', label: 'Ke RS' },
                        { key: 'tiba_tujuan', label: 'Tiba' },
                      ].map((step, idx) => {
                        const stepOrder = [
                          'menunggu',
                          'disetujui',
                          'menuju_lokasi',
                          'membawa_pasien',
                          'tiba_tujuan',
                          'selesai',
                        ];
                        const currentIdx = stepOrder.indexOf(trip.status);
                        const thisIdx = stepOrder.indexOf(step.key);
                        const isDone = currentIdx > thisIdx;
                        const isCurrent = currentIdx === thisIdx;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mb-0.5 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? isWaiting
                                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
                                    : 'bg-red-600 text-white ring-2 ring-red-300'
                                  : 'bg-white border border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] truncate max-w-full font-medium ${
                                isCurrent
                                  ? isWaiting
                                    ? 'font-bold text-amber-600'
                                    : 'font-bold text-red-600'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                    <button
                      id={`btn-detail-trip-${trip.id}`}
                      onClick={() => onSelectTrip(trip)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Detail & Dokumen
                    </button>

                    {isWaiting ? (
                      <button
                        id={`btn-advance-status-${trip.id}`}
                        onClick={() => handleNextStatus(trip)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-sm ring-2 ring-amber-400 ring-offset-1 animate-pulse cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-200" />
                        <span>Terima & Dispatch Driver</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        id={`btn-advance-status-${trip.id}`}
                        onClick={() => handleNextStatus(trip)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <span>
                          {trip.status === 'tiba_tujuan'
                            ? 'Selesaikan Trip'
                            : 'Update Status Lanjut'}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access Hospital Directory */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center">
          <Phone className="w-3.5 h-3.5 text-red-600 mr-1.5" />
          Kontak Darurat Rujukan Terdekat (Rancaekek)
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            {
              nama: 'RS AMC Cileunyi',
              telp: '(022) 7781630',
              jarak: '6.5 km',
            },
            {
              nama: 'RSUD Cicalengka',
              telp: '(022) 7949118',
              jarak: '9.2 km',
            },
            {
              nama: 'RS Al-Islam Bandung',
              telp: '(022) 7565588',
              jarak: '14.5 km',
            },
            {
              nama: 'RSUP Dr. Hasan Sadikin',
              telp: '(022) 2034953',
              jarak: '25 km',
            },
          ].map((hosp, i) => (
            <a
              key={i}
              id={`quick-hosp-call-${i}`}
              href={`tel:${hosp.telp.replace(/[^0-9]/g, '')}`}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 flex flex-col justify-between transition-colors block"
            >
              <div>
                <p className="font-bold text-slate-900 truncate">{hosp.nama}</p>
                <p className="text-[10px] text-slate-500">{hosp.jarak} dari BPA</p>
              </div>
              <div className="flex items-center text-emerald-700 text-[11px] font-mono mt-1 font-bold">
                <Phone className="w-2.5 h-2.5 mr-1" />
                {hosp.telp}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Driver & Relawan On-Duty Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center">
            <User className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            Driver & Relawan Siaga BPA
          </h3>
          <span className="text-[10px] font-semibold text-slate-500">
            {drivers.filter((d) => d.status === 'siaga').length} Driver • {relawan.filter((r) => r.status === 'siaga').length} Relawan Siaga
          </span>
        </div>

        {/* Driver List */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            Daftar Driver Ambulance
          </p>
          <div className="space-y-1.5">
            {drivers.map((drv) => (
              <div
                key={drv.id}
                className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      drv.status === 'siaga'
                        ? 'bg-emerald-500'
                        : drv.status === 'bertugas'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <p className="font-bold text-slate-900">{drv.nama}</p>
                    <p className="text-[10px] text-slate-500">{drv.alamatBpa}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      drv.status === 'siaga'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {drv.status === 'siaga'
                      ? 'Siaga On-Call'
                      : drv.status === 'bertugas'
                      ? 'Bertugas'
                      : 'Off'}
                  </span>
                  <button
                    id={`btn-call-duty-${drv.id}`}
                    onClick={() => onQuickCallDriver(drv.noHp, drv.nama)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md cursor-pointer"
                    title="Hubungi Driver Siaga"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relawan List */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            Daftar Relawan Medis & Satgas Siaga
          </p>
          <div className="space-y-1.5">
            {relawan.map((rel) => (
              <div
                key={rel.id}
                className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      rel.status === 'siaga'
                        ? 'bg-emerald-500'
                        : rel.status === 'bertugas'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <p className="font-bold text-slate-900">{rel.nama}</p>
                    <p className="text-[10px] text-slate-500">
                      {rel.blokBpa} • <span className="text-emerald-700 font-medium">{rel.keahlian}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      rel.status === 'siaga'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {rel.status === 'siaga'
                      ? 'Siaga Relawan'
                      : rel.status === 'bertugas'
                      ? 'Bertugas'
                      : 'Off'}
                  </span>
                  <button
                    id={`btn-call-rel-${rel.id}`}
                    onClick={() => onQuickCallDriver(rel.noHp, rel.nama)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md cursor-pointer"
                    title="Hubungi Relawan Siaga"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
