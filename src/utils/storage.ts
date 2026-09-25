import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  CallCenterContact,
  TariffConfig,
  AdminUser,
  AuthSession,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_DRIVERS,
  INITIAL_RELAWAN,
  INITIAL_FLEET,
  INITIAL_CALL_CENTERS,
  INITIAL_TARIFF_CONFIG,
  DEFAULT_ADMIN_USERS,
} from '../data/mockData';

const TRIPS_STORAGE_KEY = 'bpa_ambulance_trips_v1';
const DRIVERS_STORAGE_KEY = 'bpa_ambulance_drivers_v1';
const RELAWAN_STORAGE_KEY = 'bpa_ambulance_relawan_v1';
const FLEET_STORAGE_KEY = 'bpa_ambulance_fleet_v1';
const FLEETS_STORAGE_KEY = 'bpa_ambulance_fleets_v2';
const CALL_CENTERS_STORAGE_KEY = 'bpa_ambulance_call_centers_v1';
const TARIFF_STORAGE_KEY = 'bpa_ambulance_tariff_config_v1';
const ADMIN_USERS_STORAGE_KEY = 'bpa_ambulance_admin_users_v1';
const AUTH_SESSION_STORAGE_KEY = 'bpa_ambulance_auth_session_v1';

export function loadTrips(): AmbulanceTrip[] {
  try {
    const data = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => ({
          ...t,
          peralatan: Array.isArray(t.peralatan) ? t.peralatan : [],
          timeline: Array.isArray(t.timeline) ? t.timeline : [],
          bbm: t.bbm || {
            kmAwal: 0,
            kmAkhir: 0,
            totalKm: 0,
            jenisBbm: 'Pertalite',
            hargaPerLiter: 10000,
            liter: 0,
            biayaBbm: 0,
            catatan: '',
          },
          biaya: t.biaya || {
            skemaTarif: 'gratis_subsidi_fkw',
            biayaOperasional: 0,
            biayaBbmPengguna: 0,
            biayaTolParkir: 0,
            biayaOksigenSanitasi: 0,
            potonganSubsidi: 0,
            totalTagihan: 0,
            statusBayar: 'subsidi_penuh',
            metodeBayar: 'subsidi_fkw',
            catatanBiaya: '',
          },
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load trips from localStorage:', err);
  }
  return INITIAL_TRIPS;
}

export function saveTrips(trips: AmbulanceTrip[]): void {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips || []));
  } catch (err) {
    console.error('Failed to save trips to localStorage:', err);
  }
}

export function loadDrivers(): DriverMaster[] {
  try {
    const data = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load drivers from localStorage:', err);
  }
  return INITIAL_DRIVERS;
}

export function saveDrivers(drivers: DriverMaster[]): void {
  try {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers || []));
  } catch (err) {
    console.error('Failed to save drivers to localStorage:', err);
  }
}

export function loadRelawan(): RelawanMaster[] {
  try {
    const data = localStorage.getItem(RELAWAN_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load relawan from localStorage:', err);
  }
  return INITIAL_RELAWAN;
}

export function saveRelawan(relawan: RelawanMaster[]): void {
  try {
    localStorage.setItem(RELAWAN_STORAGE_KEY, JSON.stringify(relawan || []));
  } catch (err) {
    console.error('Failed to save relawan to localStorage:', err);
  }
}

export function loadFleet(): FleetVehicle {
  try {
    const fleets = loadFleets();
    const primary = fleets.find((f) => f.isUtama) || fleets[0];
    if (primary) return primary;
    const data = localStorage.getItem(FLEET_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_FLEET,
        ...parsed,
        id: parsed.id || 'fleet-01',
        kelengkapan: Array.isArray(parsed.kelengkapan)
          ? parsed.kelengkapan
          : INITIAL_FLEET.kelengkapan,
      };
    }
  } catch (err) {
    console.error('Failed to load fleet from localStorage:', err);
  }
  return INITIAL_FLEET;
}

export function saveFleet(fleet: FleetVehicle): void {
  try {
    localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet || INITIAL_FLEET));
  } catch (err) {
    console.error('Failed to save fleet to localStorage:', err);
  }
}

export function loadFleets(): FleetVehicle[] {
  try {
    const data = localStorage.getItem(FLEETS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          ...INITIAL_FLEET,
          ...item,
          id: item.id || `fleet-${String(idx + 1).padStart(2, '0')}`,
          platNomor: item.platNomor || INITIAL_FLEET.platNomor,
          namaUnit: item.namaUnit || INITIAL_FLEET.namaUnit,
          kelengkapan: Array.isArray(item.kelengkapan)
            ? item.kelengkapan
            : INITIAL_FLEET.kelengkapan,
        }));
      }
    }
    // Fallback if existing single fleet
    const singleRaw = localStorage.getItem(FLEET_STORAGE_KEY);
    if (singleRaw) {
      const parsedSingle = JSON.parse(singleRaw);
      return [{ ...INITIAL_FLEET, ...parsedSingle, id: parsedSingle.id || 'fleet-01', isUtama: true }];
    }
    return [{ ...INITIAL_FLEET, id: 'fleet-01', isUtama: true }];
  } catch (err) {
    console.error('Failed to load fleets from localStorage:', err);
    return [{ ...INITIAL_FLEET, id: 'fleet-01', isUtama: true }];
  }
}

export function saveFleets(fleets: FleetVehicle[]): void {
  try {
    localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(fleets || []));
    if (fleets && fleets.length > 0) {
      const primary = fleets.find((f) => f.isUtama) || fleets[0];
      saveFleet(primary);
    }
  } catch (err) {
    console.error('Failed to save fleets to localStorage:', err);
  }
}

export function loadCallCenters(): CallCenterContact[] {
  try {
    const data = localStorage.getItem(CALL_CENTERS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load call centers from localStorage:', err);
  }
  return INITIAL_CALL_CENTERS;
}

export function saveCallCenters(contacts: CallCenterContact[]): void {
  try {
    localStorage.setItem(CALL_CENTERS_STORAGE_KEY, JSON.stringify(contacts || []));
  } catch (err) {
    console.error('Failed to save call centers to localStorage:', err);
  }
}

export function loadTariffConfig(): TariffConfig {
  try {
    const data = localStorage.getItem(TARIFF_STORAGE_KEY);
    if (data) {
      return { ...INITIAL_TARIFF_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to load tariff config from localStorage:', err);
  }
  return INITIAL_TARIFF_CONFIG;
}

export function saveTariffConfig(config: TariffConfig): void {
  try {
    localStorage.setItem(TARIFF_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save tariff config to localStorage:', err);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(INITIAL_DRIVERS));
  localStorage.setItem(RELAWAN_STORAGE_KEY, JSON.stringify(INITIAL_RELAWAN));
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(INITIAL_FLEET));
  localStorage.setItem(
    FLEETS_STORAGE_KEY,
    JSON.stringify([{ ...INITIAL_FLEET, id: 'fleet-01', isUtama: true }])
  );
  localStorage.setItem(CALL_CENTERS_STORAGE_KEY, JSON.stringify(INITIAL_CALL_CENTERS));
  localStorage.setItem(TARIFF_STORAGE_KEY, JSON.stringify(INITIAL_TARIFF_CONFIG));
}

export function clearAllTripsData(): void {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify([]));
}

export function loadAdminUsers(): AdminUser[] {
  try {
    const data = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure standard users (admin & pengurus) have updated passwords
        const hasAdmin = parsed.some((u) => u.username.toLowerCase() === 'admin');
        const hasPengurus = parsed.some((u) => u.username.toLowerCase() === 'pengurus');
        if (hasAdmin && hasPengurus) {
          const synced = parsed.map((u) => {
            if (u.username.toLowerCase() === 'admin') {
              return { ...u, role: 'admin' as const, passwordHash: u.passwordHash === 'bpa2025' ? 'fkw123' : u.passwordHash };
            }
            if (u.username.toLowerCase() === 'pengurus') {
              return { ...u, role: 'pengurus' as const, passwordHash: u.passwordHash === 'fkwbpa' ? 'bpa123fkw' : u.passwordHash };
            }
            return u;
          });
          return synced;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load admin users from localStorage:', err);
  }
  return DEFAULT_ADMIN_USERS;
}

export function saveAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save admin users to localStorage:', err);
  }
}

export function loadAuthSession(): AuthSession {
  try {
    const data = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.isAuthenticated === 'boolean') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load auth session:', err);
  }
  return {
    isAuthenticated: false,
    user: null,
  };
}

export function saveAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

export function authenticateUser(username: string, password: string): { success: boolean; user?: AdminUser; message?: string } {
  const users = loadAdminUsers();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Primary Check for system credentials requested by user
  if (cleanUsername === 'admin' && (cleanPassword === 'fkw123' || cleanPassword === 'fkw-123')) {
    const foundAdmin = users.find((u) => u.username.toLowerCase() === 'admin') || DEFAULT_ADMIN_USERS[0];
    const userAdmin: AdminUser = { ...foundAdmin, role: 'admin', passwordHash: 'fkw123' };
    return { success: true, user: userAdmin };
  }

  if (cleanUsername === 'pengurus' && (cleanPassword === 'bpa123fkw' || cleanPassword === 'bpa-123-fkw')) {
    const foundPengurus = users.find((u) => u.username.toLowerCase() === 'pengurus') || DEFAULT_ADMIN_USERS[1];
    const userPengurus: AdminUser = { ...foundPengurus, role: 'pengurus', passwordHash: 'bpa123fkw' };
    return { success: true, user: userPengurus };
  }

  const found = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!found) {
    return {
      success: false,
      message: 'Username pengurus tidak ditemukan. Gunakan username "admin" atau "pengurus".',
    };
  }

  if (found.passwordHash !== cleanPassword) {
    return {
      success: false,
      message: 'Kata sandi / Password salah.',
    };
  }

  return {
    success: true,
    user: found,
  };
}

export function updateAdminPassword(userId: string, newPassword: string): boolean {
  try {
    const users = loadAdminUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, passwordHash: newPassword } : u));
    saveAdminUsers(updated);
    return true;
  } catch (e) {
    console.error('Failed to update password:', e);
    return false;
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `AMB-BPA-${year}${month}-${randomNum}`;
}

export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

export interface AutomatedWhatsAppPayload {
  recipientName: string;
  phone: string;
  cleanPhone: string;
  statusType: 'disetujui' | 'selesai';
  title: string;
  message: string;
  waUrl: string;
  ticketNumber: string;
}

export function generateAutomatedWhatsAppNotification(
  trip: AmbulanceTrip,
  newStatus: 'disetujui' | 'selesai',
  fleetPlat: string = 'D 8974 FQ'
): AutomatedWhatsAppPayload {
  const cleanPhone = formatPhoneForWhatsApp(trip.pemohon.noHp);
  let message = '';
  let title = '';

  if (newStatus === 'disetujui') {
    title = 'Konfirmasi Penugasan Driver';
    message = `🚑 *KONFIRMASI PENUGASAN AMBULANCE FKW-BPA* 🚑\n*Perumahan Bumi Pesona Asri Rancaekek*\n\nYth. Bapak/Ibu *${trip.pemohon.nama}* (Blok ${trip.pemohon.blokRumah || '-'}),\n\nPermintaan layanan ambulance untuk Pasien *${trip.pasien.nama}* telah *DISETUJUI* dan sedang dalam penanganan petugas operasional FKW-BPA.\n\n📋 *DATA TIKET & PENUGASAN:*\n• No. Tiket: *${trip.ticketNumber}*\n• Driver Bertugas: *${trip.sopir.nama}* (${trip.sopir.noHp})\n• Relawan Pendamping: *${trip.relawan.nama || '-'}*\n• Unit Armada: *${fleetPlat}*\n• Tujuan Rujukan: *${trip.tujuan.namaTujuan}*\n• Estimasi Jarak: *${trip.tujuan.jarakKm} KM* (${trip.tujuan.ruteVia})\n\n💡 *PANDUAN PEMOHON/KELUARGA:*\n1. Driver sedang bersiap/menuju lokasi Anda.\n2. Mohon siapkan surat rujukan, KTP, BPJS, atau perlengkapan pasien.\n3. Anda dapat menghubungi driver via telp/WA jika membutuhkan panduan rute masuk blok.\n\nSemoga perjalanan lancar dan pasien segera mendapat penanganan medis terbaik.\n\n_Divisi Ambulance & Kemanusiaan_\n*Forum Komunikasi Warga (FKW) Bumi Pesona Asri*`;
  } else {
    title = 'Layanan Operasional Selesai';
    const tagihanStr =
      trip.biaya.totalTagihan === 0
        ? 'Gratis / 100% Subsidi Kas FKW-BPA'
        : formatRupiah(trip.biaya.totalTagihan);

    message = `✅ *LAYANAN AMBULANCE FKW-BPA TELAH SELESAI* ✅\n*Perumahan Bumi Pesona Asri Rancaekek*\n\nYth. Bapak/Ibu *${trip.pemohon.nama}*,\n\nLayanan ambulance untuk Pasien *${trip.pasien.nama}* dengan No. Tiket *${trip.ticketNumber}* telah dinyatakan *SELESAI* dengan rincian sebagai berikut:\n\n📋 *RINGKASAN OPERASIONAL:*\n• No. Tiket: *${trip.ticketNumber}*\n• Tujuan: *${trip.tujuan.namaTujuan}*\n• Driver Bertugas: *${trip.sopir.nama}*\n• Unit Armada: *${fleetPlat}*\n• Biaya Layanan: *${tagihanStr}*\n\nKami segenap pengurus FKW-BPA mendoakan semoga Bapak/Ibu dan keluarga, khususnya pasien *${trip.pasien.nama}*, senantiasa lekas pulih, sehat walafiat, dan selalu dalam lindungan Tuhan YME.\n\nTerima kasih atas kerja sama dan kepercayaan warga terhadap layanan ambulance siaga FKW-BPA.\n\n_Salam Hangat,_\n*Forum Komunikasi Warga (FKW) Bumi Pesona Asri*`;
  }

  const encoded = encodeURIComponent(message);
  const waUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  return {
    recipientName: trip.pemohon.nama,
    phone: trip.pemohon.noHp,
    cleanPhone,
    statusType: newStatus,
    title,
    message,
    waUrl,
    ticketNumber: trip.ticketNumber,
  };
}

export function sendAutomatedWhatsAppMessage(
  trip: AmbulanceTrip,
  newStatus: 'disetujui' | 'selesai',
  fleetPlat: string = 'D 8974 FQ'
): { success: boolean; payload: AutomatedWhatsAppPayload } {
  const payload = generateAutomatedWhatsAppNotification(
    trip,
    newStatus,
    fleetPlat
  );
  try {
    if (payload.waUrl) {
      window.open(payload.waUrl, '_blank');
      return { success: true, payload };
    }
    return { success: false, payload };
  } catch (err) {
    console.error('Failed to trigger automatic WhatsApp message API:', err);
    return { success: false, payload };
  }
}

