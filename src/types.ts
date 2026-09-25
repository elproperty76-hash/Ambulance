export type RequestStatus =
  | 'menunggu'
  | 'disetujui'
  | 'menuju_lokasi'
  | 'membawa_pasien'
  | 'tiba_tujuan'
  | 'selesai'
  | 'dibatalkan';

export type UrgencyLevel = 'darurat_kritis' | 'sedang' | 'rutin' | 'jenazah';

export type WargaType = 'warga_bpa' | 'non_warga';

export type HubunganPemohon =
  | 'Keluarga Inti'
  | 'Tetangga'
  | 'Pengurus RT/RW'
  | 'Relawan BPA'
  | 'Lainnya';

export type GenderType = 'L' | 'P';

export type KondisiPasienType =
  | 'Sadar Penuh'
  | 'Lemah / Butuh Bantuan'
  | 'Sesak Napas / Butuh O2'
  | 'Tidak Sadar / Kritis'
  | 'Patah Tulang / Trauma'
  | 'Ibu Hamil / Bersalin'
  | 'Jenazah';

export type KategoriTujuan =
  | 'rsud'
  | 'rs_swasta'
  | 'puskesmas'
  | 'klinik'
  | 'rumah_duka'
  | 'pemakaman'
  | 'luar_kota'
  | 'lainnya';

export type JenisBBM = 'Pertalite' | 'Pertamax' | 'Dexlite' | 'Solar';

export type SkemaTarif =
  | 'gratis_subsidi_fkw'
  | 'infaq_sukarela'
  | 'tarif_operasional_standar'
  | 'subsidi_kas_rt';

export type StatusPembayaran =
  | 'lunas'
  | 'subsidi_penuh'
  | 'belum_lunas'
  | 'donasi_kas';

export type MetodePembayaran = 'tunai' | 'transfer_qris' | 'subsidi_fkw';

export interface TimelineLog {
  id: string;
  time: string;
  status: RequestStatus;
  title: string;
  note: string;
  updatedBy: string;
}

export interface CallCenterContact {
  id: string;
  nama: string;
  jabatan: string;
  noHp: string;
  isUtama: boolean;
  tersedia24Jam: boolean;
  catatan?: string;
}

export interface TariffConfig {
  hargaPertalite: number;
  hargaPertamax: number;
  hargaSolar: number;
  hargaDexlite: number;
  kmPerLiter: number;
  jasaSupirPerTrip: number;
  jasaSupirPerKm: number;
  jasaRelawanPerTrip: number;
  jasaRelawanPerKm: number;
  biayaParkirDefault: number;
  biayaTolPerKm: number;
  biayaOksigenSanitasi: number;
  diskonWargaBpaPersen: number;
  biayaKendaraanInternal: number;
  biayaKendaraanExternal: number;
  subsidiKasRtRw?: number;
}

export interface AmbulanceTrip {
  id: string;
  ticketNumber: string; // e.g. AMB-BPA-202608-001
  createdAt: string;
  requestDate: string;
  requestTime: string;
  status: RequestStatus;
  urgency: UrgencyLevel;

  // 1. Data Pemohon
  pemohon: {
    nama: string;
    noHp: string;
    hubungan: HubunganPemohon;
    blokRumah: string; // e.g. "Blok C2 No. 14"
    rtRw: string; // e.g. "RT 03 / RW 14"
    alamatLengkap: string;
    tipeWarga: WargaType;
    catatanKhusus?: string;
  };

  // 2. Data Pasien
  pasien: {
    nama: string;
    usia: number;
    jenisKelamin: GenderType;
    diagnosaKeluhan: string;
    kondisi: KondisiPasienType;
    kebutuhanAlat: string[]; // e.g. ['Tabung Oksigen', 'Brankar Ambulance']
    catatanMedis?: string;
  };

  // 3. Data Sopir & Armada
  sopir: {
    driverId: string;
    nama: string;
    noHp: string;
    nomorSim?: string;
  };

  // 4. Data Relawan
  relawan: {
    relawanId: string;
    nama: string;
    noHp: string;
    timPendamping: string;
    peran: string;
  };

  // 5. Data Tujuan
  tujuan: {
    kategori: KategoriTujuan;
    namaTujuan: string;
    alamat: string;
    jarakKm: number;
    ruteVia: string;
    kontakTujuan?: string;
    isPulangPergi?: boolean;
  };

  // 6. Data Penggunaan Bahan Bakar (BBM)
  bbm: {
    kmAwal: number;
    kmAkhir: number;
    totalKm: number;
    jenisBbm: JenisBBM;
    liter: number;
    hargaPerLiter?: number;
    biayaBbm: number;
    catatan?: string;
  };

  // 7. Data Biaya & Infaq
  biaya: {
    skemaTarif: SkemaTarif;
    biayaOperasional: number;
    jasaSupir?: number;
    jasaRelawan?: number;
    biayaBbmPengguna: number;
    hargaBbmPerLiter?: number;
    literBbmTerpakai?: number;
    biayaTol?: number;
    biayaParkir?: number;
    biayaTolParkir: number;
    biayaOksigenSanitasi: number;
    biayaKendaraan?: number;
    tipeBiayaKendaraan?: 'internal' | 'external';
    potonganSubsidi: number;
    totalTagihan: number;
    statusBayar: StatusPembayaran;
    metodeBayar: MetodePembayaran;
    catatanBiaya?: string;
    noKuitansi?: string;
  };

  // 8. Histori Timeline Tracking Real-time
  timeline: TimelineLog[];
}

export interface DriverMaster {
  id: string;
  nama: string;
  noHp: string;
  alamatBpa: string;
  nomorSim: string;
  status: 'siaga' | 'bertugas' | 'libur';
  totalTrip: number;
  rating: number;
  foto?: string;
}

export interface RelawanMaster {
  id: string;
  nama: string;
  noHp: string;
  blokBpa: string;
  tim: string;
  keahlian: string;
  status: 'siaga' | 'bertugas' | 'tidak_aktif';
  totalPendampingan: number;
}

export interface HospitalDestination {
  id: string;
  nama: string;
  kategori: KategoriTujuan;
  jarakKm: number;
  estimasiMenit: number;
  alamat: string;
  teleponUgd: string;
  ruteRekomendasi: string;
}

export interface FleetVehicle {
  id?: string;
  platNomor: string;
  namaUnit: string;
  merk: string;
  tahun: number;
  status: 'siaga' | 'beroperasi' | 'perawatan';
  kmSpidometer: number;
  kondisiBbmPersen: number;
  kondisiOksigen: string;
  penanggungJawab: string;
  servisBerikutnya?: string;
  kelengkapan?: string[];
  isUtama?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  namaLengkap: string;
  jabatan: string;
  noHp: string;
  role: 'admin' | 'pengurus' | 'super_admin' | 'pengurus_fkw' | 'koordinator_posko';
  passwordHash: string;
  avatarColor?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loginTimestamp?: string;
}
