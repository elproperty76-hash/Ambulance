import React, { useState, useEffect } from 'react';
import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  UrgencyLevel,
  HubunganPemohon,
  GenderType,
  KondisiPasienType,
  KategoriTujuan,
  JenisBBM,
  SkemaTarif,
  StatusPembayaran,
  MetodePembayaran,
  TariffConfig,
} from '../types';
import {
  DAFTAR_ALAT_MEDIS,
  HOSPITAL_LIST,
  INITIAL_TARIFF_CONFIG,
} from '../data/mockData';
import {
  generateTicketNumber,
  formatRupiah,
} from '../utils/storage';
import {
  User,
  HeartPulse,
  Truck,
  Users,
  MapPin,
  Fuel,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Clock,
  Car,
  ChevronRight,
  ChevronLeft,
  Navigation,
  FileCheck,
  ShieldCheck,
  Zap,
  Calculator,
  RotateCcw,
} from 'lucide-react';

interface NewTripFormTabProps {
  drivers: DriverMaster[];
  relawan: RelawanMaster[];
  fleet: FleetVehicle;
  tariffConfig?: TariffConfig;
  onSubmitNewTrip: (newTrip: AmbulanceTrip) => void;
  onCancel: () => void;
}

export const NewTripFormTab: React.FC<NewTripFormTabProps> = ({
  drivers,
  relawan,
  fleet,
  tariffConfig = INITIAL_TARIFF_CONFIG,
  onSubmitNewTrip,
  onCancel,
}) => {
  // Step state: 1 (Pemohon & Pasien), 2 (Driver, Relawan & Tujuan), 3 (BBM & Biaya)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [successSaved, setSuccessSaved] = useState<boolean>(false);

  // Form State
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const [urgency, setUrgency] = useState<UrgencyLevel>('darurat_kritis');
  const [requestDate, setRequestDate] = useState<string>(currentDate);
  const [requestTime, setRequestTime] = useState<string>(currentTime);

  // 1. Data Pemohon
  const [namaPemohon, setNamaPemohon] = useState<string>('');
  const [noHpPemohon, setNoHpPemohon] = useState<string>('');
  const [hubunganPemohon, setHubunganPemohon] =
    useState<HubunganPemohon>('Keluarga Inti');
  const [blokRumah, setBlokRumah] = useState<string>('');
  const [nomorRumah, setNomorRumah] = useState<string>('');
  const [rtRw, setRtRw] = useState<string>('RT 03 / RW 14');
  const [tipeWarga, setTipeWarga] = useState<'warga_bpa' | 'non_warga'>(
    'warga_bpa'
  );
  const [catatanPemohon, setCatatanPemohon] = useState<string>('');

  // 2. Data Pasien
  const [namaPasien, setNamaPasien] = useState<string>('');
  const [usiaPasien, setUsiaPasien] = useState<number>(45);
  const [genderPasien, setGenderPasien] = useState<GenderType>('L');
  const [kondisiPasien, setKondisiPasien] =
    useState<KondisiPasienType>('Sesak Napas / Butuh O2');
  const [diagnosaKeluhan, setDiagnosaKeluhan] = useState<string>('');
  const [kebutuhanAlat, setKebutuhanAlat] = useState<string[]>([
    'Tabung Oksigen & Regulator',
    'Brankar Ambulance (Tandu Dorong)',
  ]);
  const [catatanMedis, setCatatanMedis] = useState<string>('');

  // 3. Data Sopir
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    drivers[0]?.id || 'drv-01'
  );

  // 4. Data Relawan
  const [selectedRelawanId, setSelectedRelawanId] = useState<string>(
    relawan[0]?.id || 'rel-01'
  );

  // 5. Data Tujuan
  const [kategoriTujuan, setKategoriTujuan] =
    useState<KategoriTujuan>('rs_swasta');
  const [namaTujuan, setNamaTujuan] = useState<string>('RS AMC Cileunyi');
  const [alamatTujuan, setAlamatTujuan] = useState<string>(
    'Jl. Raya Cileunyi No. 2, Cileunyi, Kab. Bandung'
  );
  const [jarakKm, setJarakKm] = useState<number>(6.5);
  const [isPulangPergi, setIsPulangPergi] = useState<boolean>(true);
  const [ruteVia, setRuteVia] = useState<string>(
    'Via Jl. Raya Rancaekek -> Bunderan Cileunyi'
  );
  const [kontakTujuan, setKontakTujuan] = useState<string>('(022) 7781630');

  // 6. Data BBM
  const kmAwalDefault = fleet.kmSpidometer || 48250;
  const [kmAwal, setKmAwal] = useState<number>(kmAwalDefault);
  const [kmAkhir, setKmAkhir] = useState<number>(kmAwalDefault + 13);
  const [jenisBbm, setJenisBbm] = useState<JenisBBM>('Pertalite');
  const [hargaBbmPerLiter, setHargaBbmPerLiter] = useState<number>(
    tariffConfig.hargaPertalite
  );
  const [literBbm, setLiterBbm] = useState<number>(1.6);
  const [biayaBbm, setBiayaBbm] = useState<number>(16000);
  const [catatanBbm, setCatatanBbm] = useState<string>('Isi SPBU Rancaekek');

  // 7. Data Biaya & Infaq Pengguna
  const [skemaTarif, setSkemaTarif] =
    useState<SkemaTarif>('gratis_subsidi_fkw');
  const [jasaSupir, setJasaSupir] = useState<number>(53000);
  const [jasaRelawan, setJasaRelawan] = useState<number>(39750);
  const [biayaOperasional, setBiayaOperasional] = useState<number>(92750);
  const [biayaBbmPengguna, setBiayaBbmPengguna] = useState<number>(0);
  const [biayaParkir, setBiayaParkir] = useState<number>(5000);
  const [biayaTol, setBiayaTol] = useState<number>(0);
  const [biayaTolParkir, setBiayaTolParkir] = useState<number>(5000);
  const [biayaOksigenSanitasi, setBiayaOksigenSanitasi] = useState<number>(20000);
  const [tipeBiayaKendaraan, setTipeBiayaKendaraan] = useState<'internal' | 'external'>('internal');
  const [biayaKendaraan, setBiayaKendaraan] = useState<number>(
    tariffConfig.biayaKendaraanInternal ?? 50000
  );
  const [potonganSubsidi, setPotonganSubsidi] = useState<number>(183750);
  const [statusBayar, setStatusBayar] =
    useState<StatusPembayaran>('subsidi_penuh');
  const [metodeBayar, setMetodeBayar] =
    useState<MetodePembayaran>('subsidi_fkw');
  const [catatanBiaya, setCatatanBiaya] = useState<string>(
    'Layanan Darurat Warga Bumi Pesona Asri - Subsidi Penuh Kas FKW-BPA'
  );

  // Sync fuel and vehicle fees when tariffConfig changes
  useEffect(() => {
    if (jenisBbm === 'Pertalite') {
      setHargaBbmPerLiter(tariffConfig.hargaPertalite);
    } else if (jenisBbm === 'Pertamax') {
      setHargaBbmPerLiter(tariffConfig.hargaPertamax);
    } else if (jenisBbm === 'Solar') {
      setHargaBbmPerLiter(tariffConfig.hargaSolar);
    } else if (jenisBbm === 'Dexlite') {
      setHargaBbmPerLiter(tariffConfig.hargaDexlite);
    }
  }, [jenisBbm, tariffConfig]);

  // Handler for changing Domisili Pemohon with automatic Biaya Kendaraan synchronization
  const handleSelectTipeWarga = (tipe: 'warga_bpa' | 'non_warga') => {
    setTipeWarga(tipe);
    if (tipe === 'warga_bpa') {
      setTipeBiayaKendaraan('internal');
      const fee = tariffConfig.biayaKendaraanInternal ?? 50000;
      setBiayaKendaraan(fee);
      handleAutoCalculateTariff(jarakKm, isPulangPergi, hargaBbmPerLiter, skemaTarif, fee);
    } else {
      setTipeBiayaKendaraan('external');
      const fee = tariffConfig.biayaKendaraanExternal ?? 100000;
      setBiayaKendaraan(fee);
      handleAutoCalculateTariff(jarakKm, isPulangPergi, hargaBbmPerLiter, skemaTarif, fee);
    }
  };

  // Handler for manually toggling Biaya Kendaraan type in Step 3
  const handleSelectTipeBiayaKendaraan = (tipe: 'internal' | 'external') => {
    setTipeBiayaKendaraan(tipe);
    const fee =
      tipe === 'external'
        ? (tariffConfig.biayaKendaraanExternal ?? 100000)
        : (tariffConfig.biayaKendaraanInternal ?? 50000);
    setBiayaKendaraan(fee);
    handleAutoCalculateTariff(jarakKm, isPulangPergi, hargaBbmPerLiter, skemaTarif, fee);
  };

  // Function to calculate exact distance & smart cost engine
  const handleAutoCalculateTariff = (
    customJarak?: number,
    customIsPP?: boolean,
    customFuelPrice?: number,
    customSkema?: SkemaTarif,
    customBiayaKendaraan?: number
  ) => {
    const activeJarakOneWay =
      customJarak !== undefined ? customJarak : Number(jarakKm) || 5;
    const activeIsPP =
      customIsPP !== undefined ? customIsPP : isPulangPergi;
    const totalDistance = activeJarakOneWay * (activeIsPP ? 2 : 1);
    const activeFuelPrice =
      customFuelPrice !== undefined ? customFuelPrice : hargaBbmPerLiter || 10000;
    const activeSkema = customSkema || skemaTarif;
    const activeBiayaKendaraan =
      customBiayaKendaraan !== undefined
        ? customBiayaKendaraan
        : biayaKendaraan !== undefined
        ? biayaKendaraan
        : tipeWarga === 'non_warga'
        ? (tariffConfig.biayaKendaraanExternal ?? 100000)
        : (tariffConfig.biayaKendaraanInternal ?? 50000);

    // Fuel usage
    const kmPerL = tariffConfig.kmPerLiter || 8.0;
    const calculatedLiters = Number((totalDistance / kmPerL).toFixed(1));
    const calculatedBbmCost = Math.round(calculatedLiters * activeFuelPrice);

    // Operational fees
    const calcJasaSupir = Math.round(
      tariffConfig.jasaSupirPerTrip +
        totalDistance * tariffConfig.jasaSupirPerKm
    );
    const calcJasaRelawan = Math.round(
      tariffConfig.jasaRelawanPerTrip +
        totalDistance * tariffConfig.jasaRelawanPerKm
    );
    const calcBiayaOperasional = calcJasaSupir + calcJasaRelawan;

    // Toll & parking fees
    const isTolRoute =
      ruteVia.toLowerCase().includes('tol') ||
      namaTujuan.toLowerCase().includes('rshs') ||
      namaTujuan.toLowerCase().includes('edelweiss') ||
      namaTujuan.toLowerCase().includes('al-islam');
    const calcBiayaTol = isTolRoute
      ? Math.round(totalDistance * tariffConfig.biayaTolPerKm)
      : 0;
    const calcBiayaParkir = tariffConfig.biayaParkirDefault || 5000;
    const calcBiayaTolParkir = calcBiayaTol + calcBiayaParkir;
    const calcBiayaOksigen = tariffConfig.biayaOksigenSanitasi || 20000;

    // Apply calculated states
    setLiterBbm(calculatedLiters);
    setBiayaBbm(calculatedBbmCost);
    setKmAkhir(kmAwal + Math.round(totalDistance));
    setJasaSupir(calcJasaSupir);
    setJasaRelawan(calcJasaRelawan);
    setBiayaOperasional(calcBiayaOperasional);
    setBiayaTol(calcBiayaTol);
    setBiayaParkir(calcBiayaParkir);
    setBiayaTolParkir(calcBiayaTolParkir);
    setBiayaOksigenSanitasi(calcBiayaOksigen);

    // Total gross includes biayaKendaraan
    const totalGross =
      calcBiayaOperasional +
      calculatedBbmCost +
      calcBiayaTolParkir +
      calcBiayaOksigen +
      activeBiayaKendaraan;

    if (activeSkema === 'gratis_subsidi_fkw') {
      setBiayaBbmPengguna(0);
      setPotonganSubsidi(totalGross);
      setStatusBayar('subsidi_penuh');
      setMetodeBayar('subsidi_fkw');
    } else if (activeSkema === 'subsidi_kas_rt') {
      // Nilai tetap untuk subsidi kas RT/RW sebesar Rp 100.000
      setBiayaBbmPengguna(calculatedBbmCost);
      const fixedSubsidiRt = tariffConfig.subsidiKasRtRw ?? 100000;
      setPotonganSubsidi(fixedSubsidiRt);
      if (totalGross <= fixedSubsidiRt) {
        setStatusBayar('subsidi_penuh');
        setMetodeBayar('subsidi_fkw');
      } else {
        setStatusBayar('lunas');
        setMetodeBayar('tunai');
      }
    } else if (activeSkema === 'tarif_operasional_standar') {
      setBiayaBbmPengguna(calculatedBbmCost);
      setPotonganSubsidi(0);
      setStatusBayar('lunas');
      setMetodeBayar('transfer_qris');
    } else {
      // Fallback
      setBiayaBbmPengguna(calculatedBbmCost);
      setPotonganSubsidi(0);
      setStatusBayar('lunas');
      setMetodeBayar('tunai');
    }
  };

  // Calculated values
  const totalKmCalculated = Math.max(0, kmAkhir - kmAwal);
  const subtotalBiaya =
    biayaOperasional +
    biayaBbmPengguna +
    biayaTolParkir +
    biayaOksigenSanitasi +
    biayaKendaraan;
  const totalTagihanDikenakan = Math.max(0, subtotalBiaya - potonganSubsidi);

  // Reset Form to initial empty state
  const handleResetForm = () => {
    if (window.confirm('Bersihkan semua isian formulir input permohonan baru ini?')) {
      setUrgency('darurat_kritis');
      setRequestDate(currentDate);
      setRequestTime(currentTime);
      setNamaPemohon('');
      setNoHpPemohon('');
      setHubunganPemohon('Keluarga Inti');
      setBlokRumah('Blok A1');
      setNomorRumah('');
      setRtRw('RT 01 / RW 14');
      setTipeWarga('warga_bpa');
      setCatatanPemohon('');
      setNamaPasien('');
      setUsiaPasien(30);
      setGenderPasien('L');
      setKondisiPasien('Sesak Napas / Butuh O2');
      setDiagnosaKeluhan('');
      setKebutuhanAlat([
        'Tabung Oksigen & Regulator',
        'Brankar Ambulance (Tandu Dorong)',
      ]);
      setCatatanMedis('');
      setNamaTujuan('');
      setAlamatTujuan('');
      setJarakKm(5);
      setRuteVia('');
      setKontakTujuan('');
      setBiayaOperasional(50000);
      setBiayaBbmPengguna(0);
      setBiayaTolParkir(0);
      setBiayaOksigenSanitasi(20000);
      setTipeBiayaKendaraan('internal');
      setBiayaKendaraan(tariffConfig.biayaKendaraanInternal ?? 50000);
      setPotonganSubsidi(70000);
      setStatusBayar('subsidi_penuh');
      setMetodeBayar('subsidi_fkw');
      setCatatanBiaya('Layanan Siaga Warga BPA');
      setActiveStep(1);
    }
  };

  // Preset Handlers for Instant Filling
  const handleApplyPreset = (presetType: string) => {
    if (presetType === 'darurat_warga') {
      setUrgency('darurat_kritis');
      setNamaPemohon('Bpk. Kurniawan');
      setNoHpPemohon('0812-3344-5566');
      setBlokRumah('Blok B2');
      setNomorRumah('No. 15');
      setRtRw('RT 02 / RW 14');
      setTipeWarga('warga_bpa');
      setNamaPasien('Ibu Siti Halimah');
      setUsiaPasien(58);
      setGenderPasien('P');
      setDiagnosaKeluhan('Serangan Jantung / Nyeri Dada Hebat');
      setKondisiPasien('Sesak Napas / Butuh O2');
      setKebutuhanAlat([
        'Tabung Oksigen & Regulator',
        'Brankar Ambulance (Tandu Dorong)',
        'Kotak P3K & Tensimeter Digital',
      ]);
      setNamaTujuan('RS AMC Cileunyi');
      setAlamatTujuan('Jl. Raya Cileunyi No. 2');
      setJarakKm(6.5);
      setRuteVia('Via Jalan Raya Rancaekek');
      setSkemaTarif('gratis_subsidi_fkw');
      setBiayaBbmPengguna(0);
      setBiayaTolParkir(0);
      setPotonganSubsidi(70000);
      setStatusBayar('subsidi_penuh');
      setMetodeBayar('subsidi_fkw');
      setCatatanBiaya('Layanan Darurat Warga KTP BPA 100% Gratis disubsidi FKW');
    } else if (presetType === 'rujukan_rshs') {
      setUrgency('sedang');
      setNamaPemohon('Bpk. Bambang Sutrisno');
      setNoHpPemohon('0857-1122-3399');
      setBlokRumah('Blok A3');
      setNomorRumah('No. 08');
      setRtRw('RT 01 / RW 14');
      setTipeWarga('warga_bpa');
      setNamaPasien('Bpk. Bambang Sutrisno');
      setUsiaPasien(62);
      setGenderPasien('L');
      setDiagnosaKeluhan('Rujukan Bedah Saraf / Rawat Inap RSHS');
      setKondisiPasien('Lemah / Butuh Bantuan');
      setKebutuhanAlat([
        'Tabung Oksigen & Regulator',
        'Brankar Ambulance (Tandu Dorong)',
      ]);
      setNamaTujuan('RSUP Dr. Hasan Sadikin (RSHS)');
      setAlamatTujuan('Jl. Pasteur No. 38, Bandung');
      setJarakKm(25.0);
      setRuteVia('Tol Cileunyi -> Tol Pasteur');
      setSkemaTarif('subsidi_kas_rt');
      setBiayaOperasional(50000);
      setBiayaBbmPengguna(100000);
      setBiayaTolParkir(36000);
      setPotonganSubsidi(tariffConfig.subsidiKasRtRw ?? 100000);
      setStatusBayar('lunas');
      setMetodeBayar('transfer_qris');
      setCatatanBiaya('Subsidi kas RT/RW tetap Rp 100.000 & sisa biaya oleh pemohon');
    } else if (presetType === 'jenazah_bpa') {
      setUrgency('jenazah');
      setNamaPemohon('Bpk. H. Sukardi (Ketua RT)');
      setNoHpPemohon('0813-9988-7711');
      setBlokRumah('Blok D2');
      setNomorRumah('No. 04');
      setRtRw('RT 03 / RW 14');
      setTipeWarga('warga_bpa');
      setNamaPasien('Alm. Bpk. Suryadi');
      setUsiaPasien(71);
      setGenderPasien('L');
      setDiagnosaKeluhan('Meninggal Dunia karena Sakit');
      setKondisiPasien('Jenazah');
      setKebutuhanAlat([
        'Kantung Jenazah',
        'Brankar Ambulance (Tandu Dorong)',
      ]);
      setNamaTujuan('TPU BPA / Pemakaman Rancaekek');
      setAlamatTujuan('Bojongloa Rancaekek');
      setJarakKm(4.5);
      setRuteVia('Via Jalan Raya Kaum Rancaekek');
      setSkemaTarif('gratis_subsidi_fkw');
      setBiayaBbmPengguna(0);
      setBiayaTolParkir(0);
      setPotonganSubsidi(70000);
      setStatusBayar('subsidi_penuh');
      setMetodeBayar('subsidi_fkw');
      setCatatanBiaya('Layanan Jenazah Warga 100% Ditanggung FKW-BPA');
    }
  };

  const handleSelectHospitalPreset = (hosp: (typeof HOSPITAL_LIST)[0]) => {
    setNamaTujuan(hosp.nama);
    setAlamatTujuan(hosp.alamat);
    setJarakKm(hosp.jarakKm);
    setRuteVia(hosp.ruteRekomendasi);
    setKontakTujuan(hosp.teleponUgd);
    setKategoriTujuan(hosp.kategori);
  };

  const handleOpenGoogleMapsRoute = () => {
    const origin = encodeURIComponent(
      `Perumahan Bumi Pesona Asri Rancaekek Bandung ${blokRumah || ''}`
    );
    const destination = encodeURIComponent(`${namaTujuan} ${alamatTujuan}`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank');
  };

  const toggleAlatMedis = (item: string) => {
    if (kebutuhanAlat.includes(item)) {
      setKebutuhanAlat(kebutuhanAlat.filter((a) => a !== item));
    } else {
      setKebutuhanAlat([...kebutuhanAlat, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaPemohon.trim()) {
      alert('Mohon masukkan Nama Pemohon Ambulance');
      setActiveStep(1);
      return;
    }
    if (!namaPasien.trim()) {
      alert('Mohon masukkan Nama Pasien');
      setActiveStep(1);
      return;
    }
    if (!namaTujuan.trim()) {
      alert('Mohon masukkan Tujuan / Rumah Sakit Rujukan');
      setActiveStep(2);
      return;
    }

    const currentDriver =
      drivers.find((d) => d.id === selectedDriverId) || drivers[0];
    const currentRelawan =
      relawan.find((r) => r.id === selectedRelawanId) || relawan[0];

    const ticket = generateTicketNumber();
    const newTrip: AmbulanceTrip = {
      id: `trip-${Date.now()}`,
      ticketNumber: ticket,
      createdAt: new Date().toISOString(),
      requestDate: requestDate || currentDate,
      requestTime: requestTime || currentTime,
      status: 'disetujui',
      urgency: urgency,
      pemohon: {
        nama: namaPemohon.trim(),
        noHp: noHpPemohon.trim() || '-',
        hubungan: hubunganPemohon,
        blokRumah:
          [blokRumah.trim(), nomorRumah.trim()].filter(Boolean).join(' ') ||
          'BPA',
        rtRw: rtRw,
        alamatLengkap: `Perumahan Bumi Pesona Asri ${[
          blokRumah.trim(),
          nomorRumah.trim(),
        ]
          .filter(Boolean)
          .join(' ')}, ${rtRw}, Rancaekek`,
        tipeWarga: tipeWarga,
        catatanKhusus: catatanPemohon,
      },
      pasien: {
        nama: namaPasien.trim(),
        usia: Number(usiaPasien) || 0,
        jenisKelamin: genderPasien,
        diagnosaKeluhan:
          diagnosaKeluhan.trim() || 'Pemeriksaan / Rujukan Medis',
        kondisi: kondisiPasien,
        kebutuhanAlat: kebutuhanAlat,
        catatanMedis: catatanMedis,
      },
      sopir: {
        driverId: currentDriver.id,
        nama: currentDriver.nama,
        noHp: currentDriver.noHp,
        nomorSim: currentDriver.nomorSim,
      },
      relawan: {
        relawanId: currentRelawan.id,
        nama: currentRelawan.nama,
        noHp: currentRelawan.noHp,
        timPendamping: currentRelawan.tim,
        peran: currentRelawan.keahlian,
      },
      tujuan: {
        kategori: kategoriTujuan,
        namaTujuan: namaTujuan.trim(),
        alamat: alamatTujuan.trim(),
        jarakKm: Number(jarakKm) || 5,
        ruteVia: ruteVia.trim() || 'Rute Standar Rancaekek',
        kontakTujuan: kontakTujuan,
      },
      bbm: {
        kmAwal: Number(kmAwal),
        kmAkhir: Number(kmAkhir),
        totalKm: totalKmCalculated,
        jenisBbm: jenisBbm,
        hargaPerLiter: Number(hargaBbmPerLiter),
        liter: Number(literBbm),
        biayaBbm: Number(biayaBbm),
        catatan: catatanBbm,
      },
      biaya: {
        skemaTarif: skemaTarif,
        jasaSupir: Number(jasaSupir),
        jasaRelawan: Number(jasaRelawan),
        biayaOperasional: Number(biayaOperasional),
        biayaBbmPengguna: Number(biayaBbmPengguna),
        biayaParkir: Number(biayaParkir),
        biayaTol: Number(biayaTol),
        biayaTolParkir: Number(biayaTolParkir),
        biayaOksigenSanitasi: Number(biayaOksigenSanitasi),
        biayaKendaraan: Number(biayaKendaraan),
        tipeBiayaKendaraan: tipeBiayaKendaraan,
        potonganSubsidi: Number(potonganSubsidi),
        totalTagihan: totalTagihanDikenakan,
        statusBayar: statusBayar,
        metodeBayar: metodeBayar,
        catatanBiaya: catatanBiaya,
        noKuitansi: `KW-FKW-${new Date().getFullYear()}${String(
          new Date().getMonth() + 1
        ).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          time: requestTime,
          status: 'menunggu',
          title: 'Permintaan Masuk',
          note: `Permintaan ambulance dari ${namaPemohon} (${[blokRumah.trim(), nomorRumah.trim()].filter(Boolean).join(' ') || 'BPA'}) tercatat di sistem FKW-BPA.`,
          updatedBy: 'Sistem FKW-BPA',
        },
        {
          id: `tl-${Date.now()}-2`,
          time: requestTime,
          status: 'disetujui',
          title: 'Driver & Relawan Ditugaskan',
          note: `Driver ${currentDriver.nama} dan Relawan ${currentRelawan.nama} ditugaskan menuju lokasi.`,
          updatedBy: 'Koordinator Siaga',
        },
      ],
    };

    setSuccessSaved(true);
    setTimeout(() => {
      onSubmitNewTrip(newTrip);
    }, 600);
  };

  return (
    <div className="pb-24 pt-1 max-w-xl mx-auto">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">
                Formulir Input Data Baru
              </h2>
              <p className="text-[10px] text-slate-500">
                Pencatatan Permohonan & Tugas Ambulance FKW-BPA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            id="btn-reset-form-fields"
            title="Kosongkan / Bersihkan Form Input"
            className="text-[11px] font-semibold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
          >
            <span>🧹 Bersihkan Form</span>
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-600 mb-1 flex items-center">
            <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
            Isi Cepat Contoh Kasus (1-Tap Preset):
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              id="preset-btn-darurat"
              onClick={() => handleApplyPreset('darurat_warga')}
              className="text-[10px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              🚨 Darurat IGD (RS AMC)
            </button>
            <button
              type="button"
              id="preset-btn-rujukan"
              onClick={() => handleApplyPreset('rujukan_rshs')}
              className="text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              🏥 Rujukan RSHS Bandung
            </button>
            <button
              type="button"
              id="preset-btn-jenazah"
              onClick={() => handleApplyPreset('jenazah_bpa')}
              className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              🏴 Jenazah Warga BPA
            </button>
          </div>
        </div>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="flex items-center justify-between mb-3 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
        {[
          { step: 1, title: 'Pemohon & Pasien', icon: User },
          { step: 2, title: 'Driver, Relawan & RS', icon: Navigation },
          { step: 3, title: 'BBM & Tarif Operasional', icon: DollarSign },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          const isDone = activeStep > s.step;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 flex items-center justify-center py-1.5 px-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : isDone
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">
                {s.step}. {s.title}
              </span>
              <span className="sm:hidden">Step {s.step}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ================= STEP 1: PEMOHON & PASIEN ================= */}
        {activeStep === 1 && (
          <div className="space-y-3">
            {/* Tingkat Urgensi */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                Tingkat Urgensi Permintaan
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {[
                  {
                    id: 'darurat_kritis',
                    label: '🚨 Darurat Kritis',
                    desc: 'IGD / Butuh O2 Segera',
                    color: 'border-red-500 bg-red-50 text-red-700',
                  },
                  {
                    id: 'sedang',
                    label: '⚠️ Mendesak',
                    desc: 'Rujukan Rawat Inap',
                    color: 'border-amber-500 bg-amber-50 text-amber-800',
                  },
                  {
                    id: 'rutin',
                    label: 'ℹ️ Terjadwal',
                    desc: 'Kontrol Poli / Faskes',
                    color: 'border-blue-500 bg-blue-50 text-blue-700',
                  },
                  {
                    id: 'jenazah',
                    label: '🏴 Jenazah',
                    desc: 'Antar Rumah Duka/TPU',
                    color: 'border-slate-400 bg-slate-100 text-slate-800',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id as UrgencyLevel)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      urgency === item.id
                        ? `${item.color} ring-1 ring-red-500 font-bold shadow-xs`
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-[11px] font-bold">{item.label}</p>
                    <p className="text-[9px] opacity-75 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Tanggal & Waktu Permintaan */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Tanggal Permintaan
                  </label>
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Waktu / Jam
                  </label>
                  <input
                    type="time"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* 1. DATA PEMOHON */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                <User className="w-3.5 h-3.5 text-red-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase">
                  1. Data Pemohon Ambulance
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Hendra Gunawan"
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      No. WhatsApp / HP Pemohon *
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={noHpPemohon}
                      onChange={(e) => setNoHpPemohon(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Hubungan dg Pasien
                    </label>
                    <select
                      value={hubunganPemohon}
                      onChange={(e) =>
                        setHubunganPemohon(e.target.value as HubunganPemohon)
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    >
                      <option value="Keluarga Inti">Keluarga Inti</option>
                      <option value="Tetangga">Tetangga</option>
                      <option value="Pengurus RT/RW">Pengurus RT/RW</option>
                      <option value="Relawan BPA">Relawan BPA</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Lokasi Penjemputan di BPA */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Blok Perumahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Blok C1"
                      value={blokRumah}
                      onChange={(e) => setBlokRumah(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Nomor Rumah
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: No. 10"
                      value={nomorRumah}
                      onChange={(e) => setNomorRumah(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      RT / RW
                    </label>
                    <input
                      type="text"
                      placeholder="RT 03 / RW 14"
                      value={rtRw}
                      onChange={(e) => setRtRw(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <label className="text-slate-800 font-bold">
                      Domisili Pemohon:
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1 cursor-pointer text-slate-800">
                        <input
                          type="radio"
                          name="tipeWarga"
                          checked={tipeWarga === 'warga_bpa'}
                          onChange={() => handleSelectTipeWarga('warga_bpa')}
                          className="text-red-600 focus:ring-red-600"
                        />
                        <span className="font-semibold">Warga Perumahan BPA</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer text-slate-800">
                        <input
                          type="radio"
                          name="tipeWarga"
                          checked={tipeWarga === 'non_warga'}
                          onChange={() => handleSelectTipeWarga('non_warga')}
                          className="text-red-600 focus:ring-red-600"
                        />
                        <span className="font-semibold">Luar Perumahan</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-white px-2.5 py-1.5 rounded-md border border-indigo-200 text-indigo-950 shadow-2xs">
                    <span className="flex items-center space-x-1 font-medium">
                      <Car className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Biaya Kendaraan Otomatis:</span>
                    </span>
                    <span className="font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tipeWarga === 'warga_bpa'
                        ? `Internal (${formatRupiah(tariffConfig.biayaKendaraanInternal ?? 50000)})`
                        : `External (${formatRupiah(tariffConfig.biayaKendaraanExternal ?? 100000)})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DATA PASIEN */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                <HeartPulse className="w-3.5 h-3.5 text-red-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase">
                  2. Data Pasien Ambulance
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Nama Lengkap Pasien *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Hj. Siti Maryam"
                    value={namaPasien}
                    onChange={(e) => setNamaPasien(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Usia (Th)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={usiaPasien}
                      onChange={(e) => setUsiaPasien(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Gender
                    </label>
                    <select
                      value={genderPasien}
                      onChange={(e) =>
                        setGenderPasien(e.target.value as GenderType)
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Kondisi Fisik
                    </label>
                    <select
                      value={kondisiPasien}
                      onChange={(e) =>
                        setKondisiPasien(e.target.value as KondisiPasienType)
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    >
                      <option value="Sadar Penuh">Sadar Penuh</option>
                      <option value="Lemah / Butuh Bantuan">
                        Lemah / Butuh Bantuan
                      </option>
                      <option value="Sesak Napas / Butuh O2">
                        Sesak Napas / Butuh O2
                      </option>
                      <option value="Tidak Sadar / Kritis">
                        Tidak Sadar / Kritis
                      </option>
                      <option value="Patah Tulang / Trauma">
                        Patah Tulang / Trauma
                      </option>
                      <option value="Ibu Hamil / Bersalin">
                        Ibu Hamil / Bersalin
                      </option>
                      <option value="Jenazah">Jenazah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Keluhan Medis / Diagnosa Awal *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sesak Napas Berat, Saturasi Rendah, Rujukan Rawat Inap"
                    value={diagnosaKeluhan}
                    onChange={(e) => setDiagnosaKeluhan(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Checklist Kebutuhan Alat Medis */}
                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                    Kebutuhan Fasilitas & Alat Medis:
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {DAFTAR_ALAT_MEDIS.map((alat) => {
                      const checked = kebutuhanAlat.includes(alat);
                      return (
                        <label
                          key={alat}
                          className={`flex items-center space-x-1.5 p-1.5 rounded-md border text-[10px] cursor-pointer transition-colors ${
                            checked
                              ? 'bg-red-50 border-red-300 text-red-800 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAlatMedis(alat)}
                            className="rounded text-red-600 focus:ring-red-600"
                          />
                          <span className="truncate">{alat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                id="btn-next-to-step-2"
                onClick={() => {
                  if (!namaPemohon.trim()) {
                    alert('Mohon isi Nama Pemohon');
                    return;
                  }
                  if (!namaPasien.trim()) {
                    alert('Mohon isi Nama Pasien');
                    return;
                  }
                  setActiveStep(2);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
              >
                <span>Lanjut ke Driver & Tujuan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DRIVER, RELAWAN & TUJUAN ================= */}
        {activeStep === 2 && (
          <div className="space-y-3">
            {/* 3. DATA DRIVER & 4. DATA RELAWAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Data Sopir */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                  <Car className="w-3.5 h-3.5 text-emerald-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    3. Data Sopir Ambulance
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    Pilih Sopir Bertugas
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
                  >
                    {(drivers || []).map((drv) => (
                      <option key={drv.id} value={drv.id}>
                        {drv.nama} ({drv.status === 'siaga' ? 'Siaga' : 'Off'}) -{' '}
                        {drv.alamatBpa}
                      </option>
                    ))}
                  </select>

                  {/* Info driver terpilih */}
                  {(() => {
                    const drv =
                      (drivers || []).find((d) => d.id === selectedDriverId) ||
                      (drivers || [])[0];
                    if (!drv) return null;
                    return (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-700">Kontak:</span>{' '}
                          {drv.noHp}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Lisensi:</span>{' '}
                          {drv.nomorSim}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Domisili:</span>{' '}
                          {drv.alamatBpa}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Data Relawan */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    4. Data Relawan Pendamping
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    Pilih Relawan Siaga
                  </label>
                  <select
                    value={selectedRelawanId}
                    onChange={(e) => setSelectedRelawanId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
                  >
                    {(relawan || []).map((rel) => (
                      <option key={rel.id} value={rel.id}>
                        {rel.nama} ({rel.tim})
                      </option>
                    ))}
                  </select>

                  {/* Info relawan terpilih */}
                  {(() => {
                    const rel =
                      (relawan || []).find((r) => r.id === selectedRelawanId) ||
                      (relawan || [])[0];
                    if (!rel) return null;
                    return (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5 text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-700">Tim:</span> {rel.tim}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Peran:</span>{' '}
                          {rel.keahlian}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Kontak:</span>{' '}
                          {rel.noHp}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* 5. DATA TUJUAN AMBULANCE */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    5. Data Tujuan & Rute Ambulance
                  </h3>
                </div>
              </div>

              {/* Quick Preset Rumah Sakit & Rumah Duka Terdekat */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-600">
                    Pilih Cepat Rumah Sakit, Rumah Duka & Faskes:
                  </label>
                  <span className="text-[9px] text-emerald-700 font-bold">
                    Termasuk Rumah Duka & Rute Maps
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto p-0.5">
                  {HOSPITAL_LIST.map((hosp) => (
                    <button
                      key={hosp.id}
                      type="button"
                      onClick={() => handleSelectHospitalPreset(hosp)}
                      className={`p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        namaTujuan === hosp.nama
                          ? 'bg-red-50 border-red-400 text-red-800 font-bold ring-1 ring-red-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-[7.5px] px-1 py-0.2 rounded font-extrabold uppercase ${
                              hosp.kategori === 'rumah_duka'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {hosp.kategori === 'rumah_duka' ? 'Rumah Duka' : hosp.kategori}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-600">
                            {hosp.jarakKm} km
                          </span>
                        </div>
                        <p className="truncate font-bold text-[10.5px] leading-tight">
                          {hosp.nama}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Nama Tempat Tujuan / RS / Rumah Duka *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: RS AMC / Rumah Duka YDS"
                      value={namaTujuan}
                      onChange={(e) => setNamaTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Kategori
                    </label>
                    <select
                      value={kategoriTujuan}
                      onChange={(e) =>
                        setKategoriTujuan(e.target.value as KategoriTujuan)
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    >
                      <option value="rs_swasta">RS Swasta</option>
                      <option value="rsud">RSUD / Pem</option>
                      <option value="puskesmas">Puskesmas</option>
                      <option value="pemakaman">Pemakaman</option>
                      <option value="rumah_duka">Rumah Duka</option>
                      <option value="luar_kota">Luar Kota</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Alamat Lengkap Tujuan
                  </label>
                  <input
                    type="text"
                    placeholder="Alamat lengkap / patokan lokasi tujuan"
                    value={alamatTujuan}
                    onChange={(e) => setAlamatTujuan(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-slate-700 font-semibold text-[11px]">
                        Estimasi Jarak Tempuh (KM)
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenGoogleMapsRoute}
                        className="text-[9.5px] text-red-600 hover:text-red-700 font-bold flex items-center bg-red-50 px-1.5 py-0.5 rounded border border-red-200 cursor-pointer transition-colors"
                        title="Buka rute dan jarak sesuai Google Maps dari alamat dijemput sampai tujuan"
                      >
                        🗺️ Cek Google Maps
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={jarakKm}
                      onChange={(e) => setJarakKm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Kontak UGD / Narahubung
                    </label>
                    <input
                      type="text"
                      placeholder="(022) 7781630"
                      value={kontakTujuan}
                      onChange={(e) => setKontakTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Rute / Jalur Rekomendasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Via Tol Padaleunyi / ByPass Soekarno Hatta"
                    value={ruteVia}
                    onChange={(e) => setRuteVia(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                id="btn-next-to-step-3"
                onClick={() => {
                  if (!namaTujuan.trim()) {
                    alert('Mohon masukkan Tempat / RS Tujuan');
                    return;
                  }
                  setActiveStep(3);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
              >
                <span>Lanjut ke BBM & Tarif Operasional</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: BBM & TARIF OPERASIONAL ================= */}
        {activeStep === 3 && (
          <div className="space-y-3">
            {/* Quick Auto-Calculation Banner */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl p-3 shadow-md flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-amber-200" />
                  <h3 className="font-extrabold text-xs tracking-wide uppercase">
                    Kalkulator Biaya Otomatis
                  </h3>
                </div>
                <p className="text-[10px] text-red-100">
                  Hitung biaya BBM/liter, jasa supir, relawan, parkir & tol sesuai jarak ({jarakKm} KM {isPulangPergi ? 'PP' : '1 Arah'})
                </p>
              </div>
              <button
                type="button"
                id="btn-auto-calc-tariff"
                onClick={() => handleAutoCalculateTariff()}
                className="bg-white hover:bg-amber-50 text-red-700 font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer transition-transform active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>⚡ Hitung Otomatis</span>
              </button>
            </div>

            {/* 6. DATA PENGGUNAAN BAHAN BAKAR (BBM) & JARAK TEMPUH */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    6. Data BBM Sesuai Nilai Per Liter & Jarak Tempuh
                  </h3>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                  Rasio: 1L / {tariffConfig.kmPerLiter} KM
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Distance & Roundtrip Control */}
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Jarak Rute (1 Arah):</span>
                    <strong className="text-slate-900 text-xs">{jarakKm} KM</strong>
                    <p className="text-[9px] text-slate-500 truncate">{namaTujuan}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">
                      Mode Perjalanan:
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPulangPergi(true);
                          handleAutoCalculateTariff(jarakKm, true);
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md border cursor-pointer ${
                          isPulangPergi
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Pulang-Pergi (2x)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPulangPergi(false);
                          handleAutoCalculateTariff(jarakKm, false);
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md border cursor-pointer ${
                          !isPulangPergi
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        1 Arah Saja
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-md border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block">Total Jarak Dihitung:</span>
                    <span className="text-sm font-extrabold text-red-700 font-mono">
                      {(jarakKm * (isPulangPergi ? 2 : 1)).toFixed(1)} KM
                    </span>
                  </div>
                </div>

                {/* Spidometer Numbers */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      KM Awal Spido
                    </label>
                    <input
                      type="number"
                      value={kmAwal}
                      onChange={(e) => setKmAwal(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      KM Akhir Spido
                    </label>
                    <input
                      type="number"
                      value={kmAkhir}
                      onChange={(e) => setKmAkhir(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Selisih Total KM
                    </label>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-800 font-bold font-mono text-xs flex items-center justify-between">
                      <span>{totalKmCalculated} KM</span>
                    </div>
                  </div>
                </div>

                {/* Jenis BBM & Harga per Liter saat ini */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Jenis BBM
                    </label>
                    <select
                      value={jenisBbm}
                      onChange={(e) => setJenisBbm(e.target.value as JenisBBM)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
                    >
                      <option value="Pertalite">Pertalite (RON 90)</option>
                      <option value="Pertamax">Pertamax (RON 92)</option>
                      <option value="Dexlite">Dexlite (CN 51)</option>
                      <option value="Solar">Solar / Biosolar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Harga BBM / Liter Saat Ini
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        step="50"
                        value={hargaBbmPerLiter}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setHargaBbmPerLiter(val);
                          setBiayaBbm(Math.round(literBbm * val));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Liter Terpakai (Estimasi)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={literBbm}
                      onChange={(e) => {
                        const ltr = Number(e.target.value);
                        setLiterBbm(ltr);
                        setBiayaBbm(Math.round(ltr * hargaBbmPerLiter));
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                      Total Nilai BBM (Liter × Tarif)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={biayaBbm}
                      onChange={(e) => setBiayaBbm(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs text-amber-900 focus:outline-none focus:border-red-600 font-mono font-bold bg-amber-50/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Catatan / Lokasi Pengisian BBM
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SPBU Rancaekek KM 23 / Bon BBM Terlampir"
                    value={catatanBbm}
                    onChange={(e) => setCatatanBbm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* 7. DATA BIAYA JASA OPERASIONAL, PARKIR & GERBANG TOL */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    7. Rincian Biaya Operasional, Jasa & Tarif Pengguna
                  </h3>
                </div>
              </div>

              {/* Skema Tarif */}
              <div className="mb-2.5">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Skema Kebijakan Biaya FKW-BPA:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: 'gratis_subsidi_fkw',
                      label: '🛡️ Gratis 100% (Subsidi FKW)',
                      desc: 'Khusus Warga KTP / Domisili BPA',
                      badge: 'Gratis 100%',
                      badgeColor: 'bg-emerald-100 text-emerald-800',
                      onSelect: () => {
                        setSkemaTarif('gratis_subsidi_fkw');
                        handleAutoCalculateTariff(
                          jarakKm,
                          isPulangPergi,
                          hargaBbmPerLiter,
                          'gratis_subsidi_fkw'
                        );
                      },
                    },
                    {
                      id: 'subsidi_kas_rt',
                      label: '🏘️ Subsidi Kas RT/RW',
                      desc: 'Nilai tetap Rp 100.000 dari kas RT/RW',
                      badge: 'Tetap Rp 100.000',
                      badgeColor: 'bg-blue-100 text-blue-800',
                      onSelect: () => {
                        setSkemaTarif('subsidi_kas_rt');
                        const fixedSubsidi = tariffConfig.subsidiKasRtRw ?? 100000;
                        setPotonganSubsidi(fixedSubsidi);
                        handleAutoCalculateTariff(
                          jarakKm,
                          isPulangPergi,
                          hargaBbmPerLiter,
                          'subsidi_kas_rt'
                        );
                      },
                    },
                    {
                      id: 'tarif_operasional_standar',
                      label: '🏷️ Tarif Standar / Luar Kota',
                      desc: 'BBM, Jasa & Tol ditanggung pemohon',
                      badge: 'Biaya Standar',
                      badgeColor: 'bg-slate-100 text-slate-800',
                      onSelect: () => {
                        setSkemaTarif('tarif_operasional_standar');
                        handleAutoCalculateTariff(
                          jarakKm,
                          isPulangPergi,
                          hargaBbmPerLiter,
                          'tarif_operasional_standar'
                        );
                      },
                    },
                  ].map((skm) => (
                    <button
                      key={skm.id}
                      type="button"
                      onClick={skm.onSelect}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        skemaTarif === skm.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-[11px] leading-tight">
                            {skm.label}
                          </p>
                          <span
                            className={`text-[8.5px] px-1.5 py-0.2 rounded font-extrabold font-mono ${skm.badgeColor}`}
                          >
                            {skm.badge}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 leading-snug">
                          {skm.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rincian Komponen Biaya Detail: Jasa Supir, Relawan, Parkir, Gerbang Tol */}
              <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {/* 1. Jasa Supir & Relawan */}
                <div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    A. Jasa Operasional Kru (Sesuai Jarak Tempuh):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-slate-700 text-[10px] font-semibold">
                          Jasa Supir Bertugas
                        </label>
                        <span className="text-[9px] text-slate-400">
                          {formatRupiah(tariffConfig.jasaSupirPerTrip)} + {tariffConfig.jasaSupirPerKm}/km
                        </span>
                      </div>
                      <input
                        type="number"
                        step="1000"
                        value={jasaSupir}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setJasaSupir(val);
                          setBiayaOperasional(val + jasaRelawan);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-slate-700 text-[10px] font-semibold">
                          Jasa Relawan Medis
                        </label>
                        <span className="text-[9px] text-slate-400">
                          {formatRupiah(tariffConfig.jasaRelawanPerTrip)} + {tariffConfig.jasaRelawanPerKm}/km
                        </span>
                      </div>
                      <input
                        type="number"
                        step="1000"
                        value={jasaRelawan}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setJasaRelawan(val);
                          setBiayaOperasional(jasaSupir + val);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Biaya BBM Pengguna, Parkir & Gerbang Tol */}
                <div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    B. Biaya BBM, Parkir & Gerbang Tol Sesuai Rute:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <label className="block text-slate-700 text-[10px] font-semibold mb-0.5">
                        BBM Dibebankan ke User
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={biayaBbmPengguna}
                        onChange={(e) =>
                          setBiayaBbmPengguna(Number(e.target.value))
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <label className="block text-slate-700 text-[10px] font-semibold mb-0.5">
                        Biaya Parkir RS / Faskes
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={biayaParkir}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          setBiayaParkir(p);
                          setBiayaTolParkir(p + biayaTol);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <label className="block text-slate-700 text-[10px] font-semibold mb-0.5">
                        Biaya Gerbang Tol
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={biayaTol}
                        onChange={(e) => {
                          const t = Number(e.target.value);
                          setBiayaTol(t);
                          setBiayaTolParkir(biayaParkir + t);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* C. Biaya Kendaraan (Internal 50rb / External 100rb) */}
                <div className="bg-indigo-50/70 border border-indigo-200 p-2.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider flex items-center">
                      <Car className="w-3.5 h-3.5 text-indigo-600 mr-1" />
                      C. Biaya Kendaraan (Internal & External):
                    </span>
                    <span className="text-[9.5px] bg-white border border-indigo-200 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                      Domisili: {tipeWarga === 'warga_bpa' ? 'Warga BPA (Internal)' : 'Luar Perumahan (External)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTipeBiayaKendaraan('internal')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        tipeBiayaKendaraan === 'internal'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[11px]">Internal (Warga BPA)</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            tipeBiayaKendaraan === 'internal'
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          50 Ribu
                        </span>
                      </div>
                      <p
                        className={`text-[10px] font-mono font-bold ${
                          tipeBiayaKendaraan === 'internal'
                            ? 'text-indigo-100'
                            : 'text-slate-900'
                        }`}
                      >
                        {formatRupiah(tariffConfig.biayaKendaraanInternal ?? 50000)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTipeBiayaKendaraan('external')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        tipeBiayaKendaraan === 'external'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[11px]">External (Luar BPA)</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            tipeBiayaKendaraan === 'external'
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          100 Ribu
                        </span>
                      </div>
                      <p
                        className={`text-[10px] font-mono font-bold ${
                          tipeBiayaKendaraan === 'external'
                            ? 'text-indigo-100'
                            : 'text-slate-900'
                        }`}
                      >
                        {formatRupiah(tariffConfig.biayaKendaraanExternal ?? 100000)}
                      </p>
                    </button>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-indigo-200 flex items-center justify-between">
                    <div className="text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-800">Nominal Biaya Kendaraan:</span>
                      <span className="text-[9px] text-slate-500 block">Tercantum dalam jumlah total tagihan</span>
                    </div>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-[11px]">Rp</span>
                      <input
                        type="number"
                        step="5000"
                        value={biayaKendaraan}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBiayaKendaraan(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2 py-1 text-xs text-indigo-950 font-mono font-bold text-right focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Oksigen Medis & Total Biaya */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="block text-slate-700 text-[10px] font-semibold mb-0.5">
                      Oksigen & Sterilisasi
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={biayaOksigenSanitasi}
                      onChange={(e) =>
                        setBiayaOksigenSanitasi(Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-emerald-800 font-bold text-[10px]">
                        {skemaTarif === 'subsidi_kas_rt'
                          ? 'Potongan Subsidi Kas RT/RW'
                          : 'Potongan Subsidi Kas FKW'}
                      </label>
                      {skemaTarif === 'subsidi_kas_rt' && (
                        <span className="text-[8.5px] bg-blue-100 text-blue-800 font-bold px-1 rounded">
                          Tetap 100k
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="5000"
                      value={potonganSubsidi}
                      onChange={(e) =>
                        setPotonganSubsidi(Number(e.target.value))
                      }
                      className="w-full bg-white border border-emerald-400 rounded-md px-2 py-1 text-xs text-emerald-800 font-mono font-black"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border-2 border-red-400 shadow-xs flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold text-slate-700 block">
                      TOTAL TAGIHAN USER:
                    </span>
                    <div className="text-red-700 font-mono font-black text-sm flex items-center justify-between">
                      <span>{formatRupiah(totalTagihanDikenakan)}</span>
                      {totalTagihanDikenakan === 0 && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                          100% GRATIS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Metode Bayar */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Status Pembayaran
                  </label>
                  <select
                    value={statusBayar}
                    onChange={(e) =>
                      setStatusBayar(e.target.value as StatusPembayaran)
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
                  >
                    <option value="subsidi_penuh">
                      🛡️ Ditanggung Penuh Kas FKW
                    </option>
                    <option value="lunas">✅ Lunas (Tunai/Transfer)</option>
                    <option value="donasi_kas">
                      🤲 Infaq Masuk Kas Ambulance
                    </option>
                    <option value="belum_lunas">⏳ Belum Lunas / Tertunda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-[11px] mb-0.5">
                    Metode Pembayaran
                  </label>
                  <select
                    value={metodeBayar}
                    onChange={(e) =>
                      setMetodeBayar(e.target.value as MetodePembayaran)
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                  >
                    <option value="subsidi_fkw">Kas FKW-BPA (Subsidi)</option>
                    <option value="tunai">Tunai / Cash</option>
                    <option value="transfer_qris">Transfer Bank / QRIS FKW</option>
                  </select>
                </div>
              </div>

              <div className="mt-1.5 text-xs">
                <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">
                  Catatan Administrasi / Kuitansi
                </label>
                <input
                  type="text"
                  placeholder="Keterangan tambahan untuk pelaporan bulanan"
                  value={catatanBiaya}
                  onChange={(e) => setCatatanBiaya(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                id="btn-submit-ambulance-trip"
                disabled={successSaved}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {successSaved
                    ? 'Menyimpan ke Sistem...'
                    : 'Simpan & Tugaskan Ambulance'}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
