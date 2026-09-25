import React, { useState, useMemo } from 'react';
import {
  AuthSession,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  CallCenterContact,
  TariffConfig,
  AmbulanceTrip,
} from '../types';
import { TeamAndFleetTab } from './TeamAndFleetTab';
import { RequirePengurusModal } from './RequirePengurusModal';
import { generateStandaloneHtmlReport, downloadHtmlFile } from '../utils/htmlExporter';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  User,
  LogOut,
  Settings,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Users2,
  Car,
  PhoneCall,
  Sliders,
  FileText,
  Eye,
  EyeOff,
  Clock,
  Shield,
  Download,
  Database,
  Cloud,
  Gauge,
  TrendingUp,
  Activity,
  Sparkles,
  Navigation,
  Fuel,
} from 'lucide-react';

interface PersonalTabProps {
  authSession: AuthSession;
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onLogout: () => void;
  onChangePassword: (newPassword: string) => boolean;
  drivers: DriverMaster[];
  relawan: RelawanMaster[];
  fleet: FleetVehicle;
  fleets?: FleetVehicle[];
  callCenters: CallCenterContact[];
  tariffConfig: TariffConfig;
  trips: AmbulanceTrip[];
  onUpdateDriverStatus: (
    driverId: string,
    newStatus: 'siaga' | 'bertugas' | 'libur'
  ) => void;
  onAddDriver: (newDriver: DriverMaster) => void;
  onUpdateDriver: (updatedDriver: DriverMaster) => void;
  onDeleteDriver: (driverId: string) => void;
  onAddRelawan: (newRelawan: RelawanMaster) => void;
  onUpdateRelawan: (updatedRelawan: RelawanMaster) => void;
  onDeleteRelawan: (relawanId: string) => void;
  onAddCallCenter: (newContact: CallCenterContact) => void;
  onUpdateCallCenter: (updatedContact: CallCenterContact) => void;
  onDeleteCallCenter: (contactId: string) => void;
  onUpdateTariffConfig: (newConfig: TariffConfig) => void;
  onUpdateFleet: (newFleet: FleetVehicle) => void;
  onAddFleet?: (newFleet: FleetVehicle) => void;
  onDeleteFleet?: (fleetId: string) => void;
  onQuickCall: (phone: string, name: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onSelectTrip: (trip: AmbulanceTrip) => void;
  onClearAllTrips: () => void;
  onResetToDefault: () => void;
  onResetFleetDriversOnly: () => void;
  onOpenResetModal: () => void;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  authSession,
  onLogin,
  onLogout,
  onChangePassword,
  drivers,
  relawan,
  fleet,
  fleets,
  callCenters,
  tariffConfig,
  trips,
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
  onDeleteTrip,
  onSelectTrip,
  onClearAllTrips,
  onResetToDefault,
  onResetFleetDriversOnly,
  onOpenResetModal,
}) => {
  // Login Form States
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sub-Navigation when logged in
  const [adminMenu, setAdminMenu] = useState<'kelola' | 'trips' | 'reset' | 'password'>('kelola');

  // Change Password States
  const [oldPasswordInput, setOldPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Trips Management Filter
  const [tripSearch, setTripSearch] = useState<string>('');

  // Cumulative Mileage (KM) Calculation from COMPLETED trips
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

  const totalCompletedBbmLiter = useMemo(() => {
    return completedTrips.reduce((sum, t) => sum + (t.bbm?.liter || 0), 0);
  }, [completedTrips]);

  const totalCompletedBbmBiaya = useMemo(() => {
    return completedTrips.reduce((sum, t) => sum + (t.bbm?.biayaBbm || 0), 0);
  }, [completedTrips]);

  const avgKmPerCompletedTrip = completedTrips.length > 0
    ? (totalCumulativeKm / completedTrips.length).toFixed(1)
    : '0';

  // Role Authentication Guard: Authenticated users in Personal feature have operational management authority
  const isPengurus =
    authSession.isAuthenticated &&
    (authSession.user?.role === 'pengurus' ||
      authSession.user?.role === 'admin' ||
      authSession.user?.role === 'super_admin');

  const [pengurusAuthModal, setPengurusAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    onSuccess: () => {},
  });

  const requirePengurus = (title: string, action: () => void) => {
    if (isPengurus) {
      action();
    } else {
      setPengurusAuthModal({
        isOpen: true,
        title,
        onSuccess: action,
      });
    }
  };

  const handleDownloadHtml = () => {
    const html = generateStandaloneHtmlReport({
      trips,
      drivers,
      relawan,
      fleet,
      fleets,
      callCenters,
      tariffConfig,
    });
    downloadHtmlFile(
      html,
      `laporan-ambulance-fkw-bpa-${new Date().toISOString().slice(0, 10)}.html`
    );
  };

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Harap isi username dan password pengurus.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = onLogin(username, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Username atau password tidak valid.');
      } else {
        setUsername('');
        setPassword('');
      }
    }, 300);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setPasswordMsg({ text: 'Semua kolom kata sandi wajib diisi.', isError: true });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMsg({ text: 'Konfirmasi kata sandi baru tidak cocok.', isError: true });
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordMsg({ text: 'Kata sandi minimal 4 karakter.', isError: true });
      return;
    }

    const success = onChangePassword(newPasswordInput);
    if (success) {
      setPasswordMsg({ text: 'Kata sandi berhasil diperbarui!', isError: false });
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setPasswordMsg({ text: 'Gagal memperbarui kata sandi.', isError: true });
    }
  };

  // If NOT authenticated, show Login Screen
  if (!authSession.isAuthenticated || !authSession.user) {
    return (
      <div className="space-y-3 pb-24 pt-1 max-w-lg mx-auto">
        {/* Header Banner Login */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Akses Terproteksi
              </span>
              <h2 className="text-sm font-bold text-white leading-tight">
                Login Fitur Personal Pengurus
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Masuk dengan kredensial pengurus / administrator FKW-BPA untuk mengakses fitur kelola armada, supir, relawan, call center, tarif, edit, hapus data, dan reset sistem.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleLoginFormSubmit} className="space-y-3">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Pengurus
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-personal-username"
                  placeholder="Masukkan username (contoh: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  autoCapitalize="none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-personal-password"
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-personal-login"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-400 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all mt-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Fitur Personal'}</span>
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[10px] text-amber-800 flex items-start space-x-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Hak akses ini mengamankan data operasional darurat warga, pembagian tugas driver, kontak hotline, tarif kas, dan reset database dari perubahan tidak sengaja.
          </p>
        </div>
      </div>
    );
  }

  // If AUTHENTICATED, show full Personal / Admin Dashboard
  const activeUser = authSession.user;

  return (
    <div className="space-y-3 pb-24 pt-1 max-w-2xl mx-auto">
      {/* Active Admin Profile Card */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-sm shadow-md border border-red-400/30">
              {activeUser.namaLengkap ? activeUser.namaLengkap[0] : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-xs font-bold text-white">
                  {activeUser.namaLengkap}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-bold px-1.5 py-0.2 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Aktif
                </span>
              </div>
              <p className="text-[10px] text-slate-300">{activeUser.jabatan}</p>
              <p className="text-[9px] text-slate-400 font-mono">
                @{activeUser.username} • Role: {activeUser.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setAdminMenu('password')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
              title="Ganti Kata Sandi"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Sandi</span>
            </button>

            <button
              onClick={onLogout}
              id="btn-personal-logout"
              className="bg-red-600/90 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-500 flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              title="Keluar dari Fitur Personal"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Database Synchronization Status Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-sky-950">Cloud Firestore Aktif</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">Sinkron Real-time</span>
            </div>
            <p className="text-[10px] text-sky-800 leading-tight mt-0.5">
              Perubahan data supir, armada, relawan, call center, dan tiket tersimpan permanen di cloud dan otomatis tersinkronisasi di semua browser & perangkat baru.
            </p>
          </div>
        </div>
      </div>

      {/* Cumulative Vehicle Mileage (KM) Monitoring Dashboard Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-red-500/30 rounded-2xl p-3.5 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow-xs">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Pemantauan Jarak Tempuh Kendaraan Kumulatif
                </h3>
                <span className="text-[8.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                  Trip Selesai
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Total akumulasi jarak tempuh dinas dari seluruh perjalanan ambulance yang berstatus selesai
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
            {fleet.platNomor}
          </span>
        </div>

        {/* Big Number & KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex flex-col justify-between">
            <span className="text-[9.5px] text-slate-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 text-red-400 mr-1" />
              Total KM Kumulatif
            </span>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
                {totalCumulativeKm.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">KM</span>
            </div>
            <span className="text-[8.5px] text-emerald-400 font-medium mt-0.5">
              ✓ Terverifikasi Operasional
            </span>
          </div>

          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex flex-col justify-between">
            <span className="text-[9.5px] text-slate-400 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              Total Trip Selesai
            </span>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                {completedTrips.length}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">Trip</span>
            </div>
            <span className="text-[8.5px] text-slate-400 font-medium mt-0.5">
              dari {trips.length} total tiket
            </span>
          </div>

          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex flex-col justify-between">
            <span className="text-[9.5px] text-slate-400 font-medium flex items-center">
              <Activity className="w-3 h-3 text-blue-400 mr-1" />
              Rata-rata / Trip
            </span>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-blue-300 font-mono tracking-tight">
                {avgKmPerCompletedTrip}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">KM</span>
            </div>
            <span className="text-[8.5px] text-slate-400 font-medium mt-0.5">
              perjalanan pulang pergi
            </span>
          </div>

          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex flex-col justify-between">
            <span className="text-[9.5px] text-slate-400 font-medium flex items-center">
              <Fuel className="w-3 h-3 text-amber-400 mr-1" />
              Akumulasi BBM
            </span>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-amber-200 font-mono tracking-tight">
                {totalCompletedBbmLiter.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">Liter</span>
            </div>
            <span className="text-[8.5px] text-slate-400 font-medium mt-0.5 truncate">
              {formatRupiah(totalCompletedBbmBiaya)}
            </span>
          </div>
        </div>

        {/* Comparison Strip: Odometer Spidometer vs Cumulative Km */}
        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between text-[10.5px] text-slate-300 gap-1.5">
          <div className="flex items-center space-x-2">
            <Car className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>
              Armada: <strong className="text-white">{fleet.namaUnit}</strong> ({fleet.platNomor})
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="text-slate-400">
              Spidometer Odometer: <strong className="text-white">{(fleet.kmSpidometer || 0).toLocaleString('id-ID')} KM</strong>
            </span>
            <span className="text-amber-400">
              Total Tempuh Selesai: <strong className="text-amber-300">{totalCumulativeKm.toLocaleString('id-ID')} KM</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Personal */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminMenu('kelola')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all whitespace-nowrap ${
            adminMenu === 'kelola'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kelola Tim & Tarif</span>
        </button>

        <button
          onClick={() => setAdminMenu('trips')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all whitespace-nowrap ${
            adminMenu === 'trips'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Kelola Perjalanan ({trips.length})</span>
        </button>

        <button
          onClick={() => setAdminMenu('reset')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all whitespace-nowrap ${
            adminMenu === 'reset'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Pusat Reset</span>
        </button>
      </div>

      {/* SUB TAB 1: KELOLA TIM, ARMADA, CALL CENTER & TARIF */}
      {adminMenu === 'kelola' && (
        <div className="space-y-3">
          <TeamAndFleetTab
            drivers={drivers}
            relawan={relawan}
            fleet={fleet}
            fleets={fleets}
            trips={trips}
            callCenters={callCenters}
            tariffConfig={tariffConfig}
            isPengurus={isPengurus}
            onRequirePengurusAuth={requirePengurus}
            onUpdateDriverStatus={onUpdateDriverStatus}
            onAddDriver={onAddDriver}
            onUpdateDriver={onUpdateDriver}
            onDeleteDriver={onDeleteDriver}
            onAddRelawan={onAddRelawan}
            onUpdateRelawan={onUpdateRelawan}
            onDeleteRelawan={onDeleteRelawan}
            onAddCallCenter={onAddCallCenter}
            onUpdateCallCenter={onUpdateCallCenter}
            onDeleteCallCenter={onDeleteCallCenter}
            onUpdateTariffConfig={onUpdateTariffConfig}
            onUpdateFleet={onUpdateFleet}
            onAddFleet={onAddFleet}
            onDeleteFleet={onDeleteFleet}
            onQuickCall={onQuickCall}
          />
        </div>
      )}

      {/* SUB TAB 2: KELOLA & HAPUS DATA PERJALANAN */}
      {adminMenu === 'trips' && (
        <div className="space-y-2.5">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center">
                  <Trash2 className="w-3.5 h-3.5 text-red-600 mr-1.5" />
                  Pusat Kelola & Hapus Tiket Perjalanan
                </h3>
                <p className="text-[10px] text-slate-500">
                  Hapus atau kelola rekaman operasional perorangan secara terpusat.
                </p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                Total: {trips.length} Trip
              </span>
            </div>

            <input
              type="text"
              placeholder="Cari tiket/pasien untuk dihapus atau dikelola..."
              value={tripSearch}
              onChange={(e) => setTripSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            {trips
              .filter((t) =>
                t.ticketNumber.toLowerCase().includes(tripSearch.toLowerCase()) ||
                t.pasien.nama.toLowerCase().includes(tripSearch.toLowerCase()) ||
                t.pemohon.nama.toLowerCase().includes(tripSearch.toLowerCase()) ||
                t.tujuan.namaTujuan.toLowerCase().includes(tripSearch.toLowerCase())
              )
              .map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {trip.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {trip.pasien.nama} ({trip.pasien.usia} th)
                      </span>
                      <span className="text-[9px] text-slate-500">
                        • {formatDateIndo(trip.requestDate)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Tujuan: <strong className="text-slate-800">{trip.tujuan.namaTujuan}</strong> • Driver: {trip.sopir.nama}
                    </p>
                    <div className="text-[9px] text-slate-500 flex items-center space-x-2">
                      <span>Status: <strong className="uppercase">{trip.status}</strong></span>
                      <span>• Total Biaya: {trip.biaya.totalTagihan === 0 ? 'Gratis (Kas BPA)' : formatRupiah(trip.biaya.totalTagihan)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => onSelectTrip(trip)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Buka
                    </button>
                    <button
                      onClick={() => {
                        requirePengurus('Hapus Data Perjalanan', () => {
                          if (
                            window.confirm(
                              `Hapus permanen data perjalanan tiket ${trip.ticketNumber} (${trip.pasien.nama})?`
                            )
                          ) {
                            onDeleteTrip(trip.id);
                          }
                        });
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Hapus Tiket Ini (Khusus Pengurus)"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}

            {trips.length === 0 && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 text-xs">
                Tidak ada data perjalanan yang tersimpan saat ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 3: PUSAT RESET DATA (HANYA ADA DI PERSONAL) */}
      {adminMenu === 'reset' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Pusat Reset & Pembersihan Basis Data
                </h3>
                <p className="text-[10px] text-slate-500">
                  Fitur eksklusif pengurus untuk mengatur ulang kondisi sistem operasional BPA.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Opsi 1: Buka Dialog Reset Lengkap */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center">
                    <Sliders className="w-3.5 h-3.5 text-blue-600 mr-1" />
                    Panel Dialog Reset Terpadu
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    Buka jendela panduan opsi reset lengkap dengan rincian status saat ini.
                  </p>
                </div>
                <button
                  onClick={() => {
                    requirePengurus('Buka Panel Reset Terpadu', onOpenResetModal);
                  }}
                  id="btn-personal-open-reset-modal"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  Buka Modal Reset
                </button>
              </div>

              {/* Opsi 2: Reset Driver & Armada ke Siaga */}
              <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center">
                    <Car className="w-3.5 h-3.5 text-amber-600 mr-1" />
                    Reset Status Siaga Armada & Supir
                  </h4>
                  <p className="text-[10px] text-amber-800">
                    Mengembalikan status seluruh supir dan armada mobil ke status 'Siaga' tanpa menghapus riwayat trip.
                  </p>
                </div>
                <button
                  onClick={() => {
                    requirePengurus('Reset Status Supir & Armada ke Siaga', () => {
                      if (window.confirm('Kembalikan status semua armada dan supir ke status SIAGA?')) {
                        onResetFleetDriversOnly();
                        alert('Status armada dan supir berhasil dikembalikan ke Siaga!');
                      }
                    });
                  }}
                  id="btn-personal-reset-siaga"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs shrink-0 ml-2"
                >
                  Set Siaga
                </button>
              </div>

              {/* Opsi 3: Kosongkan Seluruh Riwayat Trip */}
              <div className="border border-rose-200 rounded-xl p-3 bg-rose-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 mr-1" />
                    Kosongkan Semua Data Riwayat Trip ({trips.length} Data)
                  </h4>
                  <p className="text-[10px] text-rose-800">
                    Menghapus seluruh catatan perjalanan, BBM, dan kuitansi menjadi 0 (bersih).
                  </p>
                </div>
                <button
                  onClick={() => {
                    requirePengurus('Kosongkan Seluruh Riwayat Perjalanan', () => {
                      if (
                        window.confirm(
                          'PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH catatan riwayat perjalanan?'
                        )
                      ) {
                        onClearAllTrips();
                        alert('Seluruh data riwayat perjalanan berhasil dikosongkan.');
                      }
                    });
                  }}
                  id="btn-personal-clear-trips"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs shrink-0 ml-2"
                >
                  Kosongkan Trip
                </button>
              </div>

              {/* Opsi 4: Reset Default Pabrik BPA */}
              <div className="border border-red-300 rounded-xl p-3 bg-red-50/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-red-950 flex items-center">
                    <RotateCcw className="w-3.5 h-3.5 text-red-700 mr-1" />
                    Reset ke Data Default Pabrik BPA
                  </h4>
                  <p className="text-[10px] text-red-900">
                    Mengembalikan seluruh susunan supir, relawan, kontak call center, armada, dan sampel trip ke kondisi awal resmi FKW-BPA.
                  </p>
                </div>
                <button
                  onClick={() => {
                    requirePengurus('Reset ke Data Default Pabrik BPA', () => {
                      if (
                        window.confirm(
                          'Kembalikan seluruh data sistem ke konfigurasi default resmi FKW-BPA?'
                        )
                      ) {
                        onResetToDefault();
                        alert('Sistem berhasil direset ke data default awal FKW-BPA.');
                      }
                    });
                  }}
                  id="btn-personal-reset-all-default"
                  className="bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs shrink-0 ml-2"
                >
                  Reset Default
                </button>
              </div>

              {/* Opsi 5: Unduh Dokumen / Kode HTML Mandiri */}
              <div className="border border-emerald-300 rounded-xl p-3 bg-emerald-50/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center">
                    <Download className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                    Unduh Dokumen & Rekap Format HTML
                  </h4>
                  <p className="text-[10px] text-emerald-900">
                    Ekspor seluruh data sistem, armada, supir, dan riwayat trip ke file dokumen .html standalone offline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  id="btn-personal-download-html"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs shrink-0 ml-2 flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: GANTI PASSWORD */}
      {adminMenu === 'password' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Ganti Kata Sandi Akun Pengurus
                </h3>
                <p className="text-[10px] text-slate-500">
                  Perbarui kata sandi untuk akun <strong className="text-slate-800">@{activeUser.username}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-2.5">
              {passwordMsg && (
                <div
                  className={`text-xs px-3 py-2 rounded-xl flex items-center space-x-2 ${
                    passwordMsg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {passwordMsg.isError ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi saat ini..."
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi baru (min. 4 karakter)..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi baru..."
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Kata Sandi Baru
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMenu('kelola')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl cursor-pointer transition-colors"
                >
                  Kembali ke Kelola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pengurusAuthModal.isOpen && (
        <RequirePengurusModal
          isOpen={pengurusAuthModal.isOpen}
          title={pengurusAuthModal.title}
          onClose={() =>
            setPengurusAuthModal((prev) => ({ ...prev, isOpen: false }))
          }
          onSuccess={() => {
            const action = pengurusAuthModal.onSuccess;
            setPengurusAuthModal((prev) => ({ ...prev, isOpen: false }));
            action();
          }}
        />
      )}
    </div>
  );
};
