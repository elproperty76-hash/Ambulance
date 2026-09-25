import React, { useState, useEffect, useMemo } from 'react';
import {
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  CallCenterContact,
  TariffConfig,
  AmbulanceTrip,
} from '../types';
import { HOSPITAL_LIST, INITIAL_TARIFF_CONFIG } from '../data/mockData';
import { EditFleetModal } from './EditFleetModal';
import { AddDriverModal } from './AddDriverModal';
import { AddRelawanModal } from './AddRelawanModal';
import { AddCallCenterModal } from './AddCallCenterModal';
import { TariffSettingsModal } from './TariffSettingsModal';
import { formatRupiah } from '../utils/storage';
import {
  Users2,
  Car,
  Phone,
  PhoneCall,
  ShieldCheck,
  Fuel,
  HeartPulse,
  Wrench,
  Award,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Settings,
  Calculator,
  Shield,
  Clock,
  Zap,
  DollarSign,
  MessageCircle,
  Star,
  Gauge,
  Lock,
  X,
  AlertTriangle,
} from 'lucide-react';

interface TeamAndFleetTabProps {
  drivers: DriverMaster[];
  relawan: RelawanMaster[];
  fleet: FleetVehicle;
  fleets?: FleetVehicle[];
  trips?: AmbulanceTrip[];
  callCenters?: CallCenterContact[];
  tariffConfig?: TariffConfig;
  isPengurus?: boolean;
  onRequirePengurusAuth?: (actionTitle: string, callback?: () => void) => void;
  onUpdateDriverStatus: (
    driverId: string,
    newStatus: 'siaga' | 'bertugas' | 'libur'
  ) => void;
  onAddDriver?: (newDriver: DriverMaster) => void;
  onUpdateDriver?: (updatedDriver: DriverMaster) => void;
  onDeleteDriver?: (driverId: string) => void;
  onAddRelawan?: (newRelawan: RelawanMaster) => void;
  onUpdateRelawan?: (updatedRelawan: RelawanMaster) => void;
  onDeleteRelawan?: (relawanId: string) => void;
  onAddCallCenter?: (newContact: CallCenterContact) => void;
  onUpdateCallCenter?: (updatedContact: CallCenterContact) => void;
  onDeleteCallCenter?: (contactId: string) => void;
  onUpdateTariffConfig?: (newConfig: TariffConfig) => void;
  onUpdateFleet: (newFleet: FleetVehicle) => void;
  onAddFleet?: (newFleet: FleetVehicle) => void;
  onDeleteFleet?: (fleetId: string) => void;
  onQuickCall: (phone: string, name: string) => void;
}

export const TeamAndFleetTab: React.FC<TeamAndFleetTabProps> = ({
  drivers,
  relawan,
  fleet,
  fleets = [],
  trips = [],
  callCenters = [],
  tariffConfig = INITIAL_TARIFF_CONFIG,
  isPengurus = false,
  onRequirePengurusAuth,
  onUpdateDriverStatus,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  onAddRelawan,
  onUpdateRelawan,
  onDeleteRelawan,
  onAddCallCenter,
  onUpdateCallCenter,
  onDeleteCallCenter,
  onUpdateTariffConfig,
  onUpdateFleet,
  onAddFleet,
  onDeleteFleet,
  onQuickCall,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'callcenters' | 'tariff' | 'drivers' | 'relawan' | 'fleet' | 'hospitals'
  >('callcenters');

  // Cumulative Completed Mileage Calculation
  const completedTrips = useMemo(() => {
    return trips.filter((t) => t.status === 'selesai');
  }, [trips]);

  const totalCumulativeKm = useMemo(() => {
    return completedTrips.reduce((sum, t) => {
      if (t.bbm?.totalKm && t.bbm.totalKm > 0) return sum + t.bbm.totalKm;
      if (t.bbm?.kmAkhir && t.bbm?.kmAwal && t.bbm.kmAkhir > t.bbm.kmAwal) {
        return sum + (t.bbm.kmAkhir - t.bbm.kmAwal);
      }
      if (t.tujuan?.jarakKm && t.tujuan.jarakKm > 0) {
        return sum + (t.tujuan.jarakKm * (t.tujuan.isPulangPergi !== false ? 2 : 1));
      }
      return sum;
    }, 0);
  }, [completedTrips]);

  // Guard helper to enforce Pengurus authority
  const ensurePengurus = (actionTitle: string, actionFn: () => void) => {
    if (isPengurus) {
      actionFn();
    } else if (onRequirePengurusAuth) {
      onRequirePengurusAuth(actionTitle, actionFn);
    } else {
      actionFn();
    }
  };

  // Modal States
  const [showEditFleetModal, setShowEditFleetModal] = useState<boolean>(false);
  const [isAddingNewFleet, setIsAddingNewFleet] = useState<boolean>(false);
  const [editingFleet, setEditingFleet] = useState<FleetVehicle | null>(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<DriverMaster | null>(null);
  const [showAddRelawanModal, setShowAddRelawanModal] = useState<boolean>(false);
  const [editingRelawan, setEditingRelawan] = useState<RelawanMaster | null>(null);
  const [showCallCenterModal, setShowCallCenterModal] = useState<boolean>(false);
  const [editingCallCenter, setEditingCallCenter] = useState<CallCenterContact | null>(null);
  const [showTariffModal, setShowTariffModal] = useState<boolean>(false);

  // In-App Confirmation Dialog and Notification Toast
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Active Fleets List
  const currentFleets = fleets && fleets.length > 0 ? fleets : [fleet];

  // Fleet Handlers
  const handleSaveFleet = (savedFleet: FleetVehicle) => {
    if (isAddingNewFleet) {
      if (onAddFleet) {
        onAddFleet(savedFleet);
      } else {
        onUpdateFleet(savedFleet);
      }
      setToastMsg({
        text: `Armada ${savedFleet.namaUnit} (${savedFleet.platNomor}) berhasil ditambahkan & disimpan.`,
        isError: false,
      });
    } else {
      onUpdateFleet(savedFleet);
      setToastMsg({
        text: `Perubahan armada ${savedFleet.namaUnit} (${savedFleet.platNomor}) berhasil disimpan.`,
        isError: false,
      });
    }
    setShowEditFleetModal(false);
    setEditingFleet(null);
    setIsAddingNewFleet(false);
  };

  const handleDeleteFleet = (target: FleetVehicle) => {
    if (currentFleets.length <= 1) {
      setToastMsg({ text: 'Minimal harus tersisa 1 armada terdaftar dalam sistem.', isError: true });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Unit Armada',
      message: `Apakah Anda yakin ingin menghapus armada ${target.namaUnit} (${target.platNomor}) dari sistem?`,
      confirmLabel: 'Hapus Armada',
      onConfirm: () => {
        if (onDeleteFleet) {
          onDeleteFleet(target.id || target.platNomor);
        }
        setToastMsg({ text: `Armada ${target.namaUnit} berhasil dihapus.`, isError: false });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSetPrimaryFleet = (target: FleetVehicle) => {
    const updated = { ...target, isUtama: true };
    onUpdateFleet(updated);
    setToastMsg({
      text: `${target.namaUnit} (${target.platNomor}) sekarang menjadi Armada Utama BPA.`,
      isError: false,
    });
  };

  // Simulation calculator state in Tariff sub-tab
  const [simKm, setSimKm] = useState<number>(10);
  const [simPP, setSimPP] = useState<boolean>(true);
  const [simFuel, setSimFuel] = useState<'Pertalite' | 'Pertamax' | 'Solar' | 'Dexlite'>('Pertalite');
  const [simBiayaKendaraanTipe, setSimBiayaKendaraanTipe] = useState<'internal' | 'external'>('internal');

  // Driver Handlers
  const handleSaveDriver = (driver: DriverMaster) => {
    if (editingDriver) {
      if (onUpdateDriver) onUpdateDriver(driver);
      setToastMsg({
        text: `Data supir ${driver.nama} berhasil diperbarui & disimpan.`,
        isError: false,
      });
    } else {
      if (onAddDriver) onAddDriver(driver);
      setToastMsg({
        text: `Supir baru ${driver.nama} berhasil ditambahkan & disimpan.`,
        isError: false,
      });
    }
    setEditingDriver(null);
    setShowAddDriverModal(false);
  };

  const handleDeleteDriver = (driver: DriverMaster) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Supir',
      message: `Hapus data supir ${driver.nama} (${driver.noHp}) dari daftar roster operasional?`,
      confirmLabel: 'Hapus Supir',
      onConfirm: () => {
        if (onDeleteDriver) onDeleteDriver(driver.id);
        setToastMsg({ text: `Data supir ${driver.nama} berhasil dihapus.`, isError: false });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Relawan Handlers
  const handleSaveRelawan = (rel: RelawanMaster) => {
    if (editingRelawan) {
      if (onUpdateRelawan) onUpdateRelawan(rel);
      setToastMsg({
        text: `Data relawan ${rel.nama} berhasil diperbarui & disimpan.`,
        isError: false,
      });
    } else {
      if (onAddRelawan) onAddRelawan(rel);
      setToastMsg({
        text: `Relawan baru ${rel.nama} berhasil ditambahkan & disimpan.`,
        isError: false,
      });
    }
    setEditingRelawan(null);
    setShowAddRelawanModal(false);
  };

  const handleDeleteRelawan = (rel: RelawanMaster) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Relawan',
      message: `Hapus relawan ${rel.nama} (${rel.noHp}) dari daftar satgas medis BPA?`,
      confirmLabel: 'Hapus Relawan',
      onConfirm: () => {
        if (onDeleteRelawan) onDeleteRelawan(rel.id);
        setToastMsg({ text: `Relawan ${rel.nama} berhasil dihapus.`, isError: false });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Call Center Handlers
  const handleSaveCallCenter = (contact: CallCenterContact) => {
    if (editingCallCenter) {
      if (onUpdateCallCenter) onUpdateCallCenter(contact);
      setToastMsg({
        text: `Kontak ${contact.nama} berhasil diperbarui & disimpan.`,
        isError: false,
      });
    } else {
      if (onAddCallCenter) onAddCallCenter(contact);
      setToastMsg({
        text: `Kontak baru ${contact.nama} berhasil ditambahkan & disimpan.`,
        isError: false,
      });
    }
    setEditingCallCenter(null);
    setShowCallCenterModal(false);
  };

  const handleDeleteCallCenter = (contact: CallCenterContact) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Nomor Kontak',
      message: `Hapus nomor kontak ${contact.nama} (${contact.noHp}) dari daftar Call Center?`,
      confirmLabel: 'Hapus Kontak',
      onConfirm: () => {
        if (onDeleteCallCenter) onDeleteCallCenter(contact.id);
        setToastMsg({ text: `Kontak ${contact.nama} berhasil dihapus.`, isError: false });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Tariff Simulation Calculation
  const simTotalKm = simKm * (simPP ? 2 : 1);
  const simFuelPrice =
    simFuel === 'Pertalite'
      ? tariffConfig.hargaPertalite
      : simFuel === 'Pertamax'
      ? tariffConfig.hargaPertamax
      : simFuel === 'Solar'
      ? tariffConfig.hargaSolar
      : tariffConfig.hargaDexlite;
  const simLiters = Number((simTotalKm / tariffConfig.kmPerLiter).toFixed(1));
  const simBbmCost = Math.round(simLiters * simFuelPrice);
  const simDriverFee = Math.round(
    tariffConfig.jasaSupirPerTrip + simTotalKm * tariffConfig.jasaSupirPerKm
  );
  const simVolunteerFee = Math.round(
    tariffConfig.jasaRelawanPerTrip + simTotalKm * tariffConfig.jasaRelawanPerKm
  );
  const simTollFee = Math.round(simTotalKm * tariffConfig.biayaTolPerKm);
  const simBiayaKendaraan =
    simBiayaKendaraanTipe === 'external'
      ? (tariffConfig.biayaKendaraanExternal ?? 100000)
      : (tariffConfig.biayaKendaraanInternal ?? 50000);
  const simTotalTariff =
    simBbmCost +
    simDriverFee +
    simVolunteerFee +
    tariffConfig.biayaParkirDefault +
    simTollFee +
    tariffConfig.biayaOksigenSanitasi +
    simBiayaKendaraan;

  return (
    <div className="space-y-3 pb-24 pt-1 max-w-xl mx-auto">
      {/* Access Permission Notice Banner */}
      {!isPengurus ? (
        <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3 text-xs text-amber-950 flex items-start space-x-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[11px] text-amber-900">
                Mode Pemantauan (Admin Posko)
              </span>
              <span className="text-[9px] bg-amber-200/80 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                Lihat Data
              </span>
            </div>
            <p className="text-[10px] text-amber-800 leading-relaxed">
              Fitur kelola armada, supir, relawan, call center, dan tarif hanya dapat diubah oleh user login <strong>pengurus</strong>. Setiap aksi tambah, edit, atau hapus data akan diverifikasi melalui otorisasi pengurus.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-2.5 text-xs text-emerald-950 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-[11px] text-emerald-900 block">
                Otoritas Pengurus Aktif (@pengurus)
              </span>
              <p className="text-[10px] text-emerald-700">
                Akses penuh mengelola armada, supir, relawan, call center, dan konfigurasi tarif.
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
            Full Access
          </span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
        <button
          onClick={() => setActiveSubTab('callcenters')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'callcenters'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Call Center ({callCenters.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tariff')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'tariff'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tarif & BBM
        </button>
        <button
          onClick={() => setActiveSubTab('drivers')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'drivers'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sopir ({drivers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('relawan')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'relawan'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Relawan ({relawan.length})
        </button>
        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'fleet'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Armada ({currentFleets.length})
        </button>
        <button
          onClick={() => setActiveSubTab('hospitals')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] truncate ${
            activeSubTab === 'hospitals'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          RS Rujukan
        </button>
      </div>

      {/* 1. CALL CENTERS SUB-TAB */}
      {activeSubTab === 'callcenters' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <PhoneCall className="w-3.5 h-3.5 text-red-600 mr-1.5" />
                Manajemen Call Center & Posko Darurat
              </h3>
              <p className="text-[10px] text-slate-500">
                Kelola nomor telepon darurat & nama penanggung jawab hotline utama
              </p>
            </div>

            <button
              id="btn-add-call-center"
              onClick={() => {
                ensurePengurus('Kelola & Tambah Nomor Call Center', () => {
                  setEditingCallCenter(null);
                  setShowCallCenterModal(true);
                });
              }}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Nomor</span>
            </button>
          </div>

          <div className="space-y-2">
            {callCenters.map((cc) => (
              <div
                key={cc.id}
                className={`bg-white border rounded-xl p-3 shadow-xs space-y-2 transition-all ${
                  cc.isUtama
                    ? 'border-red-400 ring-1 ring-red-300 bg-gradient-to-br from-red-50/40 via-white to-white'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        cc.isUtama
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs text-slate-900">
                          {cc.nama}
                        </h4>
                        {cc.isUtama && (
                          <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-md flex items-center">
                            <Shield className="w-2.5 h-2.5 mr-0.5" />
                            CALL CENTER UTAMA
                          </span>
                        )}
                        {cc.tersedia24Jam && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                            24 JAM
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {cc.jabatan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        ensurePengurus('Edit Kontak Call Center', () => {
                          setEditingCallCenter(cc);
                          setShowCallCenterModal(true);
                        });
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Edit Kontak"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!cc.isUtama && (
                      <button
                        onClick={() => {
                          ensurePengurus('Hapus Kontak Call Center', () => {
                            handleDeleteCallCenter(cc);
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Hapus Kontak"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Nomor Telepon / WhatsApp:</span>
                    <span className="text-xs font-bold font-mono text-red-700">
                      {cc.noHp}
                    </span>
                    {cc.catatan && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">
                        {cc.catatan}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`https://wa.me/${cc.noHp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-[10px] flex items-center space-x-1 font-bold shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WA</span>
                    </a>
                    <a
                      href={`tel:${cc.noHp.replace(/[^0-9]/g, '')}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] flex items-center space-x-1 font-bold shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Panggil</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TARIFF & BBM SETTINGS SUB-TAB */}
      {activeSubTab === 'tariff' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                Konfigurasi Tarif, BBM & Biaya Jasa Operasional
              </h3>
              <p className="text-[10px] text-slate-500">
                Nilai BBM per liter, jasa supir/relawan, tarif tol, dan parkir sesuai jarak
              </p>
            </div>

            <button
              id="btn-edit-tariff-config"
              onClick={() => {
                ensurePengurus('Kelola & Ubah Konfigurasi Tarif', () => {
                  setShowTariffModal(true);
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ubah Tarif</span>
            </button>
          </div>

          {/* Current Fuel Prices Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center">
              <Fuel className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              Nilai Bahan Bakar (BBM) Saat Ini Per Liter
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center">
                <span className="text-[10px] font-bold text-emerald-800 block">Pertalite (RON 90)</span>
                <span className="text-xs font-black font-mono text-emerald-950">
                  {formatRupiah(tariffConfig.hargaPertalite)}/L
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-center">
                <span className="text-[10px] font-bold text-blue-800 block">Pertamax (RON 92)</span>
                <span className="text-xs font-black font-mono text-blue-950">
                  {formatRupiah(tariffConfig.hargaPertamax)}/L
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-center">
                <span className="text-[10px] font-bold text-amber-800 block">Solar / Biosolar</span>
                <span className="text-xs font-black font-mono text-amber-950">
                  {formatRupiah(tariffConfig.hargaSolar)}/L
                </span>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-2 rounded-lg text-center">
                <span className="text-[10px] font-bold text-purple-800 block">Dexlite (CN 51)</span>
                <span className="text-xs font-black font-mono text-purple-950">
                  {formatRupiah(tariffConfig.hargaDexlite)}/L
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>Konsumsi BBM Ambulance Rata-rata:</span>
              <strong className="text-slate-900 font-mono">1 Liter / {tariffConfig.kmPerLiter} KM</strong>
            </div>
          </div>

          {/* Operational, Driver & Volunteer Rates */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center">
              <Users2 className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              Komponen Biaya Jasa Operasional, Tol & Parkir
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Jasa Supir Bertugas:</span>
                <strong className="text-slate-900 text-xs font-mono">
                  {formatRupiah(tariffConfig.jasaSupirPerTrip)} dasar + {formatRupiah(tariffConfig.jasaSupirPerKm)}/KM
                </strong>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Jasa Relawan Medis:</span>
                <strong className="text-slate-900 text-xs font-mono">
                  {formatRupiah(tariffConfig.jasaRelawanPerTrip)} dasar + {formatRupiah(tariffConfig.jasaRelawanPerKm)}/KM
                </strong>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Biaya Parkir RS (Default):</span>
                <strong className="text-slate-900 text-xs font-mono">
                  {formatRupiah(tariffConfig.biayaParkirDefault)}
                </strong>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tarif Gerbang Tol (Rata-rata):</span>
                <strong className="text-slate-900 text-xs font-mono">
                  {formatRupiah(tariffConfig.biayaTolPerKm)} / KM
                </strong>
              </div>
            </div>
          </div>

          {/* Biaya Kendaraan Internal & External Card */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center">
                <Car className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                Biaya Kendaraan (Internal & External)
              </h4>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                Sesuai Domisili Pemohon
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">Internal (Warga BPA)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">50 Ribu</span>
                </div>
                <strong className="text-sm font-extrabold font-mono text-indigo-950 block">
                  {formatRupiah(tariffConfig.biayaKendaraanInternal ?? 50000)}
                </strong>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  Otomatis terpasang untuk pilihan domisili warga perumahan BPA & tercantum dalam total tagihan
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-indigo-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">External (Luar BPA)</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">100 Ribu</span>
                </div>
                <strong className="text-sm font-extrabold font-mono text-indigo-950 block">
                  {formatRupiah(tariffConfig.biayaKendaraanExternal ?? 100000)}
                </strong>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  Otomatis terpasang untuk pilihan domisili luar perumahan & tercantum dalam total tagihan
                </p>
              </div>
            </div>
          </div>

          {/* Kebijakan Subsidi Kas RT/RW & FKW Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-950 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                Skema Kebijakan Subsidi Biaya Operasional
              </h4>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Kas Sosial & Warga
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">Subsidi Kas RT/RW</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded">Nilai Tetap</span>
                </div>
                <strong className="text-sm font-extrabold font-mono text-blue-900 block">
                  {formatRupiah(tariffConfig.subsidiKasRtRw ?? 100000)}
                </strong>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  Potongan tetap senilai Rp 100.000 otomatis dialokasikan saat memilih skema Subsidi Kas RT/RW
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">Subsidi Kas FKW-BPA</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">100% Gratis</span>
                </div>
                <strong className="text-sm font-extrabold font-mono text-emerald-700 block">
                  Gratis Penuh
                </strong>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  Ditanggung 100% dari kas forum warga untuk layanan darurat warga perumahan BPA
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Simulation Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-xl p-3 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 flex items-center">
                <Calculator className="w-3.5 h-3.5 mr-1" />
                Simulasi Hitung Biaya Berdasarkan Jarak & Nilai BBM
              </h4>
              <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                Real-time Formula
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-300 block mb-0.5">
                  Jarak 1 Arah (KM)
                </label>
                <input
                  type="number"
                  value={simKm}
                  onChange={(e) => setSimKm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-300 block mb-0.5">
                  Mode Rute
                </label>
                <button
                  type="button"
                  onClick={() => setSimPP(!simPP)}
                  className={`w-full py-1 text-[10px] font-bold rounded border cursor-pointer ${
                    simPP
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-800 text-slate-300 border-slate-600'
                  }`}
                >
                  {simPP ? 'PP (2x Jarak)' : '1 Arah Saja'}
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-300 block mb-0.5">
                  Pilihan BBM
                </label>
                <select
                  value={simFuel}
                  onChange={(e) => setSimFuel(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-white text-[11px]"
                >
                  <option value="Pertalite">Pertalite</option>
                  <option value="Pertamax">Pertamax</option>
                  <option value="Solar">Solar</option>
                  <option value="Dexlite">Dexlite</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-300 block mb-0.5">
                  Biaya Kendaraan
                </label>
                <select
                  value={simBiayaKendaraanTipe}
                  onChange={(e) => setSimBiayaKendaraanTipe(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-white text-[11px]"
                >
                  <option value="internal">Internal (50 Ribu)</option>
                  <option value="external">External (100 Ribu)</option>
                </select>
              </div>
            </div>

            {/* Result Breakdown Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2.5 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Total Jarak & Konsumsi BBM:</span>
                <span className="font-mono text-white font-bold">{simTotalKm} KM ({simLiters} L)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>BBM ({simFuel} @ {formatRupiah(simFuelPrice)}/L):</span>
                <span className="font-mono text-amber-300 font-bold">{formatRupiah(simBbmCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Biaya Kendaraan ({simBiayaKendaraanTipe === 'external' ? 'External 100rb' : 'Internal 50rb'}):</span>
                <span className="font-mono text-indigo-300 font-bold">{formatRupiah(simBiayaKendaraan)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Jasa Supir ({formatRupiah(tariffConfig.jasaSupirPerTrip)} + {simTotalKm}km):</span>
                <span className="font-mono text-white font-bold">{formatRupiah(simDriverFee)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Jasa Relawan Medis:</span>
                <span className="font-mono text-white font-bold">{formatRupiah(simVolunteerFee)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Biaya Parkir & Tol (Estimasi):</span>
                <span className="font-mono text-white font-bold">{formatRupiah(tariffConfig.biayaParkirDefault + simTollFee)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Oksigen & Sanitasi:</span>
                <span className="font-mono text-white font-bold">{formatRupiah(tariffConfig.biayaOksigenSanitasi)}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-700 flex justify-between items-center">
                <span className="font-extrabold text-amber-400 text-xs uppercase">
                  Total Nilai Biaya Operasional:
                </span>
                <span className="font-black font-mono text-sm text-emerald-400">
                  {formatRupiah(simTotalTariff)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DRIVERS SUB-TAB */}
      {activeSubTab === 'drivers' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <Car className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                Roster Sopir Siaga Ambulance FKW-BPA
              </h3>
              <p className="text-[10px] text-slate-500">
                Warga relawan bersertifikasi pengemudi darurat
              </p>
            </div>

            <button
              id="btn-add-driver"
              onClick={() => {
                ensurePengurus('Kelola & Tambah Supir', () => {
                  setEditingDriver(null);
                  setShowAddDriverModal(true);
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Supir</span>
            </button>
          </div>

          <div className="space-y-2">
            {drivers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Belum Ada Data Supir Terdaftar
                </p>
                <p className="text-[10px] text-slate-500">
                  Tambahkan supir pertama untuk menangani penugasan operasional ambulance.
                </p>
                <button
                  onClick={() => {
                    ensurePengurus('Kelola & Tambah Supir', () => {
                      setEditingDriver(null);
                      setShowAddDriverModal(true);
                    });
                  }}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Supir Sekarang</span>
                </button>
              </div>
            ) : (
              drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-red-600 text-xs shrink-0">
                        {drv.nama.split(' ')[0][0]}
                        {drv.nama.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {drv.nama}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {drv.alamatBpa}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <select
                        value={drv.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'siaga' | 'bertugas' | 'libur';
                          ensurePengurus('Ubah Status Supir', () => {
                            onUpdateDriverStatus(drv.id, newStatus);
                          });
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border cursor-pointer ${
                          drv.status === 'siaga'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : drv.status === 'bertugas'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="siaga">🟢 Siaga On-Call</option>
                        <option value="bertugas">🟡 Sedang Bertugas</option>
                        <option value="libur">⚪ Sedang Libur</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">
                      No. SIM: <strong className="text-slate-800">{drv.nomorSim}</strong>
                    </span>
                    <span className="text-slate-500">
                      Total Tugas: <strong className="text-slate-800">{drv.totalTrip} Trip</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span className="font-mono font-medium">{drv.noHp}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          ensurePengurus('Edit Data Supir', () => {
                            setEditingDriver(drv);
                            setShowAddDriverModal(true);
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="Edit Data Supir"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          ensurePengurus('Hapus Data Supir', () => {
                            handleDeleteDriver(drv);
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="Hapus Supir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickCall(drv.noHp, drv.nama)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Panggil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. RELAWAN SUB-TAB */}
      {activeSubTab === 'relawan' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <HeartPulse className="w-3.5 h-3.5 text-red-600 mr-1.5" />
                Satgas Relawan & Tim Medis BPA
              </h3>
              <p className="text-[10px] text-slate-500">
                Pendamping medis & penanganan gawat darurat
              </p>
            </div>

            <button
              id="btn-add-relawan"
              onClick={() => {
                ensurePengurus('Kelola & Tambah Relawan', () => {
                  setEditingRelawan(null);
                  setShowAddRelawanModal(true);
                });
              }}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Relawan</span>
            </button>
          </div>

          <div className="space-y-2">
            {relawan.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Belum Ada Data Relawan Terdaftar
                </p>
                <p className="text-[10px] text-slate-500">
                  Tambahkan relawan pendamping untuk membantu pasien saat perjalanan ambulance.
                </p>
                <button
                  onClick={() => {
                    ensurePengurus('Kelola & Tambah Relawan', () => {
                      setEditingRelawan(null);
                      setShowAddRelawanModal(true);
                    });
                  }}
                  className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Relawan Sekarang</span>
                </button>
              </div>
            ) : (
              relawan.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-bold text-red-600 text-xs shrink-0">
                        {rel.nama.split(' ')[0][0]}
                        {rel.nama.split(' ')[1]?.[0] || 'R'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {rel.nama}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {rel.tim} • {rel.keahlian}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                        rel.status === 'siaga'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rel.status === 'bertugas'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rel.status === 'siaga'
                        ? '🟢 Siaga'
                        : rel.status === 'bertugas'
                        ? '🟡 Tugas'
                        : '⚪ Libur'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-700">
                      <Phone className="w-3 h-3 text-red-600" />
                      <span className="font-mono font-medium">{rel.noHp}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          ensurePengurus('Edit Data Relawan', () => {
                            setEditingRelawan(rel);
                            setShowAddRelawanModal(true);
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="Edit Data Relawan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          ensurePengurus('Hapus Data Relawan', () => {
                            handleDeleteRelawan(rel);
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="Hapus Relawan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickCall(rel.noHp, rel.nama)}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Panggil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. FLEET SUB-TAB */}
      {activeSubTab === 'fleet' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Cumulative Mileage Fleet Overview Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow-2xs">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pemantauan Jarak Tempuh Armada Kumulatif
                  </h4>
                  <p className="text-[9.5px] text-slate-300">
                    Akumulasi jarak tempuh riil dihitung dari seluruh perjalanan dinas selesai
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {completedTrips.length} Trip Selesai
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center">
              <div className="bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
                <span className="text-[9px] text-slate-400 block">Total KM Kumulatif:</span>
                <strong className="text-sm font-extrabold text-amber-300 font-mono">
                  {totalCumulativeKm.toLocaleString('id-ID')} KM
                </strong>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
                <span className="text-[9px] text-slate-400 block">Trip Selesai:</span>
                <strong className="text-sm font-extrabold text-white font-mono">
                  {completedTrips.length}
                </strong>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
                <span className="text-[9px] text-slate-400 block">Rata-rata Jarak:</span>
                <strong className="text-sm font-extrabold text-blue-300 font-mono">
                  {completedTrips.length > 0 ? (totalCumulativeKm / completedTrips.length).toFixed(1) : '0'} KM
                </strong>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-1.5 border border-slate-700/60">
                <span className="text-[9px] text-slate-400 block">Spido Terkini:</span>
                <strong className="text-sm font-extrabold text-emerald-300 font-mono">
                  {(fleet.kmSpidometer || 0).toLocaleString('id-ID')} KM
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <Car className="w-3.5 h-3.5 text-red-600 mr-1.5" />
                Manajemen Armada Ambulance FKW-BPA
              </h3>
              <p className="text-[10px] text-slate-500">
                Spesifikasi kendaraan, nomor plat, ketersediaan BBM & oksigen
              </p>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                id="btn-add-fleet"
                onClick={() => {
                  ensurePengurus('Kelola & Tambah Armada', () => {
                    setEditingFleet(null);
                    setIsAddingNewFleet(true);
                    setShowEditFleetModal(true);
                  });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Armada</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {currentFleets.map((veh, idx) => {
              const isUtama = veh.isUtama || (idx === 0 && !currentFleets.some(f => f.isUtama));
              return (
                <div
                  key={veh.id || veh.platNomor || idx}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-700 shadow-2xs tracking-wider uppercase">
                          {veh.platNomor}
                        </span>
                        {isUtama && (
                          <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 flex items-center space-x-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Armada Utama Posko</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        {veh.namaUnit}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {veh.merk} • Tahun {veh.tahun}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          veh.status === 'siaga'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : veh.status === 'beroperasi'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {veh.status === 'siaga'
                          ? '🟢 Siaga Posko'
                          : veh.status === 'beroperasi'
                          ? '🟡 Sedang Beroperasi'
                          : '🔴 Servis / Perawatan'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">
                        Kilometer Spidometer:
                      </span>
                      <strong className="text-slate-900 font-mono text-xs">
                        {(veh.kmSpidometer || 0).toLocaleString('id-ID')} KM
                      </strong>
                    </div>

                    <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-amber-900 font-semibold block flex items-center">
                        <Gauge className="w-3 h-3 text-amber-600 mr-1" />
                        Total KM Trip Selesai:
                      </span>
                      <strong className="text-amber-900 font-mono text-xs">
                        {totalCumulativeKm.toLocaleString('id-ID')} KM
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">
                        Kondisi Bahan Bakar (BBM):
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (veh.kondisiBbmPersen || 0) > 50
                                ? 'bg-emerald-500'
                                : (veh.kondisiBbmPersen || 0) > 20
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, veh.kondisiBbmPersen || 0)}%` }}
                          />
                        </div>
                        <strong className="text-amber-800 font-mono text-xs">
                          {veh.kondisiBbmPersen || 0}%
                        </strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">
                        Status Oksigen Medis:
                      </span>
                      <strong className="text-blue-700 text-xs">
                        {veh.kondisiOksigen || '2 Tabung Siaga'}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 sm:col-span-2">
                      <span className="text-[10px] text-slate-500 block">
                        Penanggung Jawab Unit:
                      </span>
                      <strong className="text-slate-900 text-xs truncate block">
                        {veh.penanggungJawab || 'Divisi Operasional FKW'}
                      </strong>
                    </div>
                  </div>

                  {veh.servisBerikutnya && (
                    <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2 text-[10px] text-purple-900 flex items-center justify-between">
                      <span className="font-semibold flex items-center">
                        <Wrench className="w-3 h-3 text-purple-700 mr-1" />
                        Jadwal Servis Berkala:
                      </span>
                      <span className="font-medium">{veh.servisBerikutnya}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">
                      Kelengkapan Medis & Peralatan Tetap di Dalam Unit:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(veh.kelengkapan || []).map((item, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions for this fleet */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      {!isUtama && (
                        <button
                          type="button"
                          onClick={() => {
                            ensurePengurus('Ubah Armada Utama Posko', () => {
                              handleSetPrimaryFleet(veh);
                            });
                          }}
                          className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Set sebagai armada utama"
                        >
                          <Star className="w-3 h-3" />
                          <span>Jadikan Armada Utama</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          ensurePengurus('Edit Data Armada', () => {
                            setEditingFleet({ ...veh, id: veh.id || `fleet-${idx + 1}` });
                            setIsAddingNewFleet(false);
                            setShowEditFleetModal(true);
                          });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Ubah Data Armada</span>
                      </button>

                      {currentFleets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            ensurePengurus('Hapus Data Armada', () => {
                              handleDeleteFleet(veh);
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer transition-colors"
                          title="Hapus Armada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. HOSPITALS SUB-TAB */}
      {activeSubTab === 'hospitals' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              Direktori Rumah Sakit & Faskes Rujukan Utama
            </h3>
            <p className="text-[10px] text-slate-500">
              Jarak tempuh dari Perumahan Bumi Pesona Asri Rancaekek
            </p>
          </div>

          <div className="space-y-2">
            {HOSPITAL_LIST.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {hosp.nama}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {hosp.alamat}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 shrink-0">
                    {hosp.jarakKm} KM
                  </span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Rute:</span>{' '}
                    {hosp.ruteRekomendasi}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Telepon IGD:</span>{' '}
                    <strong className="text-red-700 font-mono">{hosp.teleponUgd}</strong>
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onQuickCall(hosp.teleponUgd, hosp.nama)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Hubungi IGD</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showEditFleetModal && (
        <EditFleetModal
          isOpen={showEditFleetModal}
          fleet={editingFleet || (isAddingNewFleet ? null : fleet)}
          isNewFleet={isAddingNewFleet}
          onClose={() => {
            setShowEditFleetModal(false);
            setEditingFleet(null);
            setIsAddingNewFleet(false);
          }}
          onSave={handleSaveFleet}
        />
      )}

      {showAddDriverModal && (
        <AddDriverModal
          isOpen={showAddDriverModal}
          editDriver={editingDriver}
          editingDriver={editingDriver}
          onClose={() => {
            setShowAddDriverModal(false);
            setEditingDriver(null);
          }}
          onSaveDriver={handleSaveDriver}
          onSave={handleSaveDriver}
        />
      )}

      {showAddRelawanModal && (
        <AddRelawanModal
          isOpen={showAddRelawanModal}
          editRelawan={editingRelawan}
          editingRelawan={editingRelawan}
          onClose={() => {
            setShowAddRelawanModal(false);
            setEditingRelawan(null);
          }}
          onSaveRelawan={handleSaveRelawan}
          onSave={handleSaveRelawan}
        />
      )}

      {showCallCenterModal && (
        <AddCallCenterModal
          initialContact={editingCallCenter}
          onClose={() => {
            setShowCallCenterModal(false);
            setEditingCallCenter(null);
          }}
          onSave={handleSaveCallCenter}
        />
      )}

      {showTariffModal && onUpdateTariffConfig && (
        <TariffSettingsModal
          tariffConfig={tariffConfig}
          onClose={() => setShowTariffModal(false)}
          onSave={(newCfg) => {
            onUpdateTariffConfig(newCfg);
            setShowTariffModal(false);
          }}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold border ${
              toastMsg.isError
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-emerald-700 text-white border-emerald-800'
            }`}
          >
            {toastMsg.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            )}
            <span>{toastMsg.text}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="ml-2 p-0.5 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden my-auto">
            <div className="p-3.5 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs leading-tight">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-[10px] text-red-100">
                    Konfirmasi Tindakan Operasional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs text-slate-700">
              <p className="leading-relaxed">{confirmDialog.message}</p>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm"
                >
                  {confirmDialog.confirmLabel || 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
