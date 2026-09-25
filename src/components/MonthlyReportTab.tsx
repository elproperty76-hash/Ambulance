import React, { useState, useMemo } from 'react';
import { AmbulanceTrip, AuthSession } from '../types';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Fuel,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  Users,
  Lock,
  Unlock,
  ShieldCheck,
  Shield,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  LogOut,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { downloadMonthlyReportPdf } from '../utils/pdfGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatRupiah, formatDateIndo } from '../utils/storage';

interface MonthlyReportTabProps {
  trips: AmbulanceTrip[];
  onExportMonthlyReportPrint: (monthLabel: string, filteredTrips: AmbulanceTrip[]) => void;
  onShareMonthlyWhatsApp: (monthLabel: string, stats: any) => void;
  authSession?: AuthSession;
  onLogin?: (username: string, password: string) => { success: boolean; message?: string };
  onLogout?: () => void;
  onNavigateHome?: () => void;
}

export const MonthlyReportTab: React.FC<MonthlyReportTabProps> = ({
  trips,
  onExportMonthlyReportPrint,
  onShareMonthlyWhatsApp,
  authSession,
  onLogin,
  onLogout,
  onNavigateHome,
}) => {
  // Login form state for protected access
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // Select Month & Year (defaults to latest available trip or current month/2026-08)
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    if (trips && trips.length > 0) {
      const sorted = [...trips].sort((a, b) =>
        (b.requestDate || '').localeCompare(a.requestDate || '')
      );
      if (sorted[0]?.requestDate && sorted[0].requestDate.length >= 7) {
        return sorted[0].requestDate.substring(0, 7);
      }
    }
    return '2026-08';
  });

  // Dynamic Month & Year options up to December 2035 + any saved trip data
  const availableMonthOptions = useMemo(() => {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    // Count trips per month YYYY-MM from saved data
    const tripCountMap: Record<string, number> = {};
    let minYear = 2024;
    let maxYear = 2035;

    trips.forEach((t) => {
      if (t.requestDate && t.requestDate.length >= 7) {
        const ym = t.requestDate.substring(0, 7);
        tripCountMap[ym] = (tripCountMap[ym] || 0) + 1;
        const y = parseInt(ym.substring(0, 4), 10);
        if (!isNaN(y)) {
          if (y < minYear) minYear = y;
          if (y > maxYear) maxYear = y;
        }
      }
    });

    const groups: {
      year: number;
      months: { value: string; label: string; count: number }[];
    }[] = [];

    for (let year = maxYear; year >= minYear; year--) {
      const yearMonths: { value: string; label: string; count: number }[] = [];
      for (let m = 12; m >= 1; m--) {
        const mStr = m.toString().padStart(2, '0');
        const val = `${year}-${mStr}`;
        const count = tripCountMap[val] || 0;
        const countSuffix = count > 0 ? ` (${count} Trip)` : '';
        yearMonths.push({
          value: val,
          label: `${monthNames[m - 1]} ${year}${countSuffix}`,
          count,
        });
      }
      groups.push({
        year,
        months: yearMonths,
      });
    }

    return groups;
  }, [trips]);

  // Filter trips by month (Hooks must be called in the exact same order on every render)
  const monthlyTrips = useMemo(() => {
    return trips.filter((t) => t.requestDate.startsWith(selectedMonthYear));
  }, [trips, selectedMonthYear]);

  // Calculations
  const totalTrips = monthlyTrips.length;
  const completedTrips = monthlyTrips.filter((t) => t.status === 'selesai').length;
  const activeTrips = monthlyTrips.filter(
    (t) => t.status !== 'selesai' && t.status !== 'dibatalkan'
  ).length;

  const totalKmTraveled = monthlyTrips.reduce(
    (sum, t) => sum + (t.bbm?.totalKm || t.tujuan?.jarakKm * 2 || 0),
    0
  );

  const totalLiterBbm = monthlyTrips.reduce(
    (sum, t) => sum + (t.bbm?.liter || 0),
    0
  );

  const totalBiayaBbm = monthlyTrips.reduce(
    (sum, t) => sum + (t.bbm?.biayaBbm || 0),
    0
  );

  const totalInfaqPemasukan = monthlyTrips.reduce(
    (sum, t) => sum + (t.biaya?.totalTagihan || 0),
    0
  );

  const totalBiayaKendaraan = monthlyTrips.reduce((sum, t) => {
    const fee =
      t.biaya?.biayaKendaraan ??
      (t.pemohon?.tipeWarga === 'non_warga' ? 100000 : 50000);
    return sum + fee;
  }, 0);

  const totalJasaDriver = monthlyTrips.reduce(
    (sum, t) => sum + (t.biaya?.jasaSupir || 0),
    0
  );

  const totalJasaRelawan = monthlyTrips.reduce(
    (sum, t) => sum + (t.biaya?.jasaRelawan || 0),
    0
  );

  const totalSubsidiKasFkw = monthlyTrips.reduce(
    (sum, t) => sum + (t.biaya?.potonganSubsidi || 0),
    0
  );

  const totalBiayaTolParkir = monthlyTrips.reduce(
    (sum, t) => sum + (t.biaya?.biayaTolParkir || 0),
    0
  );

  const totalBiayaOperasional = monthlyTrips.reduce(
    (sum, t) =>
      sum +
      (t.biaya?.biayaOperasional || 0) +
      (t.biaya?.biayaOksigenSanitasi || 0),
    0
  );

  // Cases breakdown
  const casesBreakdown = useMemo(() => {
    const counts = {
      darurat_kritis: 0,
      sedang: 0,
      jenazah: 0,
      rutin: 0,
    };
    monthlyTrips.forEach((t) => {
      if (counts[t.urgency] !== undefined) {
        counts[t.urgency]++;
      }
    });
    return [
      { name: 'Darurat Kritis', value: counts.darurat_kritis, color: '#ef4444' },
      { name: 'Rujukan Mendesak', value: counts.sedang, color: '#f59e0b' },
      { name: 'Pengantaran Jenazah', value: counts.jenazah, color: '#64748b' },
      { name: 'Kontrol / Rutin', value: counts.rutin, color: '#3b82f6' },
    ];
  }, [monthlyTrips]);

  // Destination category breakdown
  const destinationData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTrips.forEach((t) => {
      const name = t.tujuan?.namaTujuan || 'Lainnya';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  }, [monthlyTrips]);

  // Month formatted label
  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [selectedMonthYear]);

  const reportStats = {
    totalTrips,
    completedTrips,
    totalKmTraveled,
    totalLiterBbm,
    totalBiayaBbm,
    totalInfaqPemasukan,
    totalSubsidiKasFkw,
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      downloadMonthlyReportPdf({
        monthLabel,
        monthlyTrips,
        reportStats: {
          totalTrips,
          completedTrips,
          activeTrips,
          totalKm: totalKmTraveled,
          totalLiter: totalLiterBbm,
          totalBbm: totalBiayaBbm,
          totalInfaq: totalInfaqPemasukan,
          totalSubsidi: totalSubsidiKasFkw,
          totalBiayaKendaraan,
        },
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const u = loginUsername.trim();
    const p = loginPassword.trim();

    if (!u || !p) {
      setLoginError('Harap isi username dan kata sandi pengurus.');
      return;
    }

    if (!onLogin) {
      setLoginError('Layanan otentikasi sistem tidak tersedia.');
      return;
    }

    setIsSubmittingLogin(true);
    const res = onLogin(u, p);
    setIsSubmittingLogin(false);
    if (!res.success) {
      setLoginError(res.message || 'Username atau kata sandi pengurus salah.');
    } else {
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  // If user is not authenticated, render Login Access Screen (all hooks already called)
  if (!authSession?.isAuthenticated || !authSession?.user) {
    return (
      <div className="space-y-3 pb-24 pt-1 max-w-lg mx-auto">
        {/* Header Banner Login Laporan */}
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
                Login Akses Fitur Laporan
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Data rekapitulasi bulanan, rincian keuangan kas, infaq warga, pengeluaran BBM, dan cetak dokumen resmi ambulance terproteksi. Silakan masuk menggunakan <strong>akun pengurus</strong> (user dan kata sandi yang sama dengan Fitur Personal).
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
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
                  id="input-report-username"
                  placeholder="Masukkan username pengurus"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
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
                  id="input-report-password"
                  placeholder="Masukkan kata sandi..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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
              id="btn-submit-report-login"
              disabled={isSubmittingLogin}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-400 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all mt-2"
            >
              <Unlock className="w-4 h-4" />
              <span>
                {isSubmittingLogin ? 'Memverifikasi...' : 'Buka Fitur Laporan'}
              </span>
            </button>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Operasional</span>
              </button>
            )}
          </form>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[10px] text-amber-800 flex items-start space-x-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Hak akses ini mengamankan data rekapitulasi operasional, rincian keuangan kas, infaq warga, pengeluaran BBM, dan cetak dokumen resmi ambulance dari akses yang tidak berwenang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24 pt-1 max-w-xl mx-auto">
      {/* Authenticated Pengurus User Banner */}
      {authSession?.user && (
        <div className="bg-slate-900 text-white rounded-xl px-3 py-2 flex items-center justify-between shadow-xs border border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white">
                  {authSession.user.namaLengkap}
                </span>
                <span className="text-[9px] bg-red-600/80 text-white px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                  {authSession.user.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {authSession.user.jabatan} • Akses Laporan Terverifikasi
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700"
              title="Kunci Akses Laporan / Logout"
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span>Kunci</span>
            </button>
          )}
        </div>
      )}

      {/* Month Selector & Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-3.5 h-3.5 text-red-600 mr-1.5" />
              Pelaporan Bulanan Operasional & Keuangan
            </h2>
            <p className="text-[10px] text-slate-500">
              Divisi Ambulance Forum Komunikasi Warga (FKW) Bumi Pesona Asri
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-semibold max-w-[210px]"
            >
              {availableMonthOptions.map((grp) => (
                <optgroup key={grp.year} label={`Tahun ${grp.year}`}>
                  {grp.months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            id="btn-download-pdf-monthly-report"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-75 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Unduh berkas PDF rekapitulasi data perjalanan bulan ini"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
            <span>
              {isDownloadingPdf ? 'Membuat PDF...' : 'Unduh Rekapitulasi PDF'}
            </span>
          </button>

          <button
            type="button"
            id="btn-print-monthly-report"
            onClick={() =>
              onExportMonthlyReportPrint(monthLabel, monthlyTrips)
            }
            className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Pratinjau dan cetak dokumen resmi laporan bulanan"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak / Pratinjau</span>
          </button>

          <button
            type="button"
            id="btn-share-monthly-wa"
            onClick={() => onShareMonthlyWhatsApp(monthLabel, reportStats)}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Kirim ringkasan laporan bulanan ke WhatsApp Pengurus"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Total Perjalanan */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center">
            <Activity className="w-3 h-3 text-red-600 mr-1" />
            Total Trip
          </span>
          <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
            {totalTrips} <span className="text-[10px] text-slate-500 font-sans">Trip</span>
          </p>
          <p className="text-[9px] text-emerald-700 font-medium mt-0.5">
            {completedTrips} Selesai • {activeTrips} Aktif
          </p>
        </div>

        {/* Total Jarak KM */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center">
            <TrendingUp className="w-3 h-3 text-blue-600 mr-1" />
            Jarak Tempuh
          </span>
          <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
            {totalKmTraveled}{' '}
            <span className="text-[10px] text-slate-500 font-sans">KM</span>
          </p>
        </div>

        {/* Total Biaya BBM */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center">
            <Fuel className="w-3 h-3 text-amber-600 mr-1" />
            Pengeluaran BBM
          </span>
          <p className="text-xs font-bold text-amber-800 font-mono mt-0.5">
            {formatRupiah(totalBiayaBbm)}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            Total {totalLiterBbm} Liter
          </p>
        </div>

        {/* Pemasukan Infaq Warga */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center">
            <DollarSign className="w-3 h-3 text-emerald-600 mr-1" />
            Infaq Warga
          </span>
          <p className="text-xs font-bold text-emerald-800 font-mono mt-0.5">
            {formatRupiah(totalInfaqPemasukan)}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            Kas Sosial Ambulance
          </p>
        </div>
      </div>

      {/* Financial Reconciliation Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 mr-1" />
          Rekapitulasi Keuangan Operasional ({monthLabel})
        </h3>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>1. Pemasukkan Infaq dari Pengguna</span>
            <span className="font-bold text-emerald-700 font-mono">
              + {formatRupiah(totalInfaqPemasukan)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>2. Pemasukkan Biaya Kendaraan Internal/External</span>
            <span className="font-bold text-emerald-700 font-mono">
              + {formatRupiah(totalBiayaKendaraan)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>3. Pengeluaran BBM</span>
            <span className="font-bold text-red-600 font-mono">
              - {formatRupiah(totalBiayaBbm)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>4. Pengeluaran Jasa Driver</span>
            <span className="font-bold text-red-600 font-mono">
              - {formatRupiah(totalJasaDriver)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>5. Pengeluaran Jasa Relawan</span>
            <span className="font-bold text-red-600 font-mono">
              - {formatRupiah(totalJasaRelawan)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>Pengeluaran Tol & Parkir Rumah Sakit</span>
            <span className="font-bold text-red-600 font-mono">
              - {formatRupiah(totalBiayaTolParkir)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
            <span>Biaya Pemeliharaan, Oksigen & Sanitasi</span>
            <span className="font-bold text-red-600 font-mono">
              - {formatRupiah(totalBiayaOperasional)}
            </span>
          </div>

          <div className="flex justify-between py-1.5 text-slate-900 font-bold bg-slate-50 px-2.5 rounded-lg border border-slate-200 mt-1">
            <span className="flex items-center">
              Total Subsidi Dikeluarkan Kas FKW-BPA
            </span>
            <span className="font-mono text-emerald-700">
              {formatRupiah(totalSubsidiKasFkw)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center">
          <HeartPulse className="w-3.5 h-3.5 text-red-600 mr-1" />
          Komposisi Kasus & Kebutuhan Pasien
        </h3>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={casesBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {casesBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-[10px] text-slate-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trip Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Daftar Perjalanan Bulan {monthLabel}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              {monthlyTrips.length} Catatan Operasional
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="text-[11px] text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
            title="Unduh rekapitulasi data perjalanan bulan ini dalam format PDF"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span>Unduh PDF</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-1.5 px-2">No. Tiket / Tgl</th>
                <th className="py-1.5 px-2">Pasien & Alamat</th>
                <th className="py-1.5 px-2">Tujuan RS</th>
                <th className="py-1.5 px-2">Jasa Driver</th>
                <th className="py-1.5 px-2">Jasa Relawan</th>
                <th className="py-1.5 px-2">BBM</th>
                <th className="py-1.5 px-2">Infaq/Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 px-2 font-mono">
                    <p className="font-bold text-red-600 text-[11px]">
                      {trip.ticketNumber}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {trip.requestDate}
                    </p>
                  </td>
                  <td className="py-1.5 px-2">
                    <p className="font-semibold text-slate-900 text-[11px]">
                      {trip.pasien.nama}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {trip.pemohon.blokRumah}
                    </p>
                  </td>
                  <td className="py-1.5 px-2">
                    <p className="font-medium text-slate-800 text-[11px]">
                      {trip.tujuan.namaTujuan}
                    </p>
                    <p className="text-[9px] text-amber-700 font-mono">
                      {trip.tujuan.jarakKm} KM
                    </p>
                  </td>
                  <td className="py-1.5 px-2 text-[10px]">
                    <p className="text-slate-900 font-bold">{trip.sopir.nama}</p>
                    <p className="text-amber-800 font-mono font-semibold">
                      {formatRupiah(trip.biaya?.jasaSupir || 0)}
                    </p>
                  </td>
                  <td className="py-1.5 px-2 text-[10px]">
                    <p className="text-slate-900 font-bold">{trip.relawan.nama}</p>
                    <p className="text-indigo-800 font-mono font-semibold">
                      {formatRupiah(trip.biaya?.jasaRelawan || 0)}
                    </p>
                  </td>
                  <td className="py-1.5 px-2 font-mono text-[10px]">
                    <p className="text-slate-800">{trip.bbm.liter} L</p>
                    <p className="text-slate-500">
                      {formatRupiah(trip.bbm.biayaBbm)}
                    </p>
                  </td>
                  <td className="py-1.5 px-2 font-mono text-[10px]">
                    <p className="font-bold text-emerald-700">
                      {trip.biaya.totalTagihan === 0
                        ? 'Subsidi Penuh'
                        : formatRupiah(trip.biaya.totalTagihan)}
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase">
                      {trip.biaya.statusBayar}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
