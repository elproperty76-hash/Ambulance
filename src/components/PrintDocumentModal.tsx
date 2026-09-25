import React from 'react';
import { AmbulanceTrip, FleetVehicle } from '../types';
import { X, Printer, Download, ShieldCheck, Ambulance } from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import { downloadMonthlyReportPdf } from '../utils/pdfGenerator';

export type DocumentType = 'surat_jalan' | 'kuitansi' | 'laporan_bulanan';

interface PrintDocumentModalProps {
  docType: DocumentType;
  trip?: AmbulanceTrip | null;
  monthLabel?: string;
  monthlyTrips?: AmbulanceTrip[];
  fleet?: FleetVehicle;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  docType,
  trip,
  monthLabel,
  monthlyTrips,
  fleet,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (docType === 'laporan_bulanan' && monthlyTrips) {
      downloadMonthlyReportPdf({
        monthLabel: monthLabel || 'Bulanan',
        monthlyTrips,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:bg-white print:text-black">
        {/* Modal Toolbar (hidden during print) */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 print:hidden">
          <div className="flex items-center space-x-1.5">
            <Printer className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-xs text-slate-900">
              {docType === 'surat_jalan' && 'Cetak Surat Jalan Operasional'}
              {docType === 'kuitansi' && 'Cetak Kuitansi Infaq / Biaya'}
              {docType === 'laporan_bulanan' &&
                `Cetak Laporan Bulanan (${monthLabel})`}
            </h3>
          </div>

          <div className="flex items-center space-x-1.5">
            {docType === 'laporan_bulanan' && monthlyTrips && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer shadow-xs transition-colors"
                title="Unduh berkas PDF rekapitulasi data perjalanan bulan ini"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File PDF</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3 h-3" />
              <span>Cetak / Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTAINER */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans leading-relaxed print:p-4 print:text-black">
          {/* ================= 1. SURAT JALAN ================= */}
          {docType === 'surat_jalan' && trip && (
            <div className="space-y-6">
              {/* Kop Surat Resmi */}
              <div className="border-b-2 border-black pb-4 text-center relative">
                <div className="flex items-center justify-center space-x-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-black uppercase">
                      FORUM KOMUNIKASI WARGA (FKW) BUMI PESONA ASRI
                    </h1>
                    <h2 className="font-bold text-sm text-red-700 tracking-wide">
                      DIVISI OPERASIONAL AMBULANCE SIAGA WARGA
                    </h2>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Perumahan Bumi Pesona Asri, Kec. Rancaekek, Kab. Bandung 40394
                </p>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center">
                <h3 className="font-extrabold text-base uppercase tracking-wider underline">
                  SURAT TUGAS & SURAT JALAN AMBULANCE
                </h3>
                <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                  Nomor: {trip.ticketNumber}
                </p>
              </div>

              {/* Data Detail */}
              <div className="text-xs space-y-4">
                <p>
                  Yang bertanda tangan di bawah ini Pengurus Divisi Ambulance Forum Komunikasi Warga (FKW) Bumi Pesona Asri Rancaekek, menerangkan bahwa:
                </p>

                {/* Table Data Personel & Armada */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1.5 border-b border-slate-200 pb-1">
                    I. DATA ARMADA & PETUGAS
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Unit Kendaraan:</span>
                      <p className="font-bold">
                        {fleet
                          ? `${fleet.namaUnit} (${fleet.platNomor})`
                          : 'Daihatsu Gran Max (D 1945 BPA)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Tanggal / Jam Berangkat:</span>
                      <p className="font-bold">
                        {formatDateIndo(trip.requestDate)} / {trip.requestTime} WIB
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Sopir / Driver:</span>
                      <p className="font-bold">
                        {trip.sopir.nama} ({trip.sopir.nomorSim})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Relawan Pendamping:</span>
                      <p className="font-bold">
                        {trip.relawan.nama} ({trip.relawan.timPendamping})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table Data Pasien & Pemohon */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1.5 border-b border-slate-200 pb-1">
                    II. DATA PEMOHON & PASIEN
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Nama Pemohon:</span>
                      <p className="font-bold">
                        {trip.pemohon.nama} ({trip.pemohon.hubungan})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">No. Kontak Pemohon:</span>
                      <p className="font-bold">{trip.pemohon.noHp}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Nama Pasien:</span>
                      <p className="font-bold">
                        {trip.pasien.nama} ({trip.pasien.usia} th /{' '}
                        {trip.pasien.jenisKelamin})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Diagnosa / Keluhan:</span>
                      <p className="font-bold text-red-700">
                        {trip.pasien.diagnosaKeluhan}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Alamat Penjemputan:</span>
                      <p className="font-bold">{trip.pemohon.alamatLengkap}</p>
                    </div>
                  </div>
                </div>

                {/* Data Tujuan */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1.5 border-b border-slate-200 pb-1">
                    III. TUJUAN RUJUKAN & PERALATAN
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Tempat Tujuan:</span>
                      <p className="font-bold text-black">{trip.tujuan.namaTujuan}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Estimasi Jarak Tempuh:</span>
                      <p className="font-bold">{trip.tujuan.jarakKm} KM</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Peralatan Medis Terpasang:</span>
                      <p className="font-bold">
                        {(trip.pasien.kebutuhanAlat || []).join(', ') || 'Standar P3K'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tanda Tangan */}
                <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="text-slate-600">Pemohon / Keluarga</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{trip.pemohon.nama}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Sopir Bertugas</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{trip.sopir.nama}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Ketua FKW BPA</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">Susandi Haryadi</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. KUITANSI INFAQ / BIAYA ================= */}
          {docType === 'kuitansi' && trip && (
            <div className="space-y-6">
              {/* Kop Kuitansi */}
              <div className="border-b-2 border-black pb-3 text-center">
                <h1 className="font-extrabold text-base uppercase tracking-tight text-black">
                  FORUM KOMUNIKASI WARGA (FKW) BUMI PESONA ASRI
                </h1>
                <h2 className="font-bold text-xs text-red-700 uppercase">
                  TANDA TERIMA / KUITANSI OPERASIONAL AMBULANCE
                </h2>
                <p className="text-[10px] text-slate-600">
                  Sekretariat FKW Perumahan Bumi Pesona Asri, Rancaekek, Kab. Bandung
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono">
                  No. Kuitansi: <strong>{trip.biaya.noKuitansi || trip.ticketNumber}</strong>
                </span>
                <span>Tanggal: {formatDateIndo(trip.requestDate)}</span>
              </div>

              {/* Rincian Kuitansi */}
              <div className="text-xs space-y-3 bg-slate-50 p-4 border border-slate-300 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-500 col-span-1">Telah Diterima Dari:</span>
                  <span className="font-bold col-span-3">
                    {trip.pemohon.nama} ({trip.pemohon.blokRumah})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-500 col-span-1">Nama Pasien:</span>
                  <span className="font-bold col-span-3">
                    {trip.pasien.nama} (Tujuan: {trip.tujuan.namaTujuan})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span className="text-slate-500 col-span-1">Skema Layanan:</span>
                  <span className="font-bold col-span-3 uppercase text-emerald-700">
                    {trip.biaya.skemaTarif.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Komponen Biaya */}
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Operasional Dasar:</span>
                    <span>{formatRupiah(trip.biaya.biayaOperasional)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Biaya Kendaraan ({trip.biaya.tipeBiayaKendaraan === 'external' || trip.pemohon.tipeWarga === 'non_warga' ? 'External' : 'Internal'}):
                    </span>
                    <span>
                      {formatRupiah(trip.biaya.biayaKendaraan ?? (trip.pemohon.tipeWarga === 'non_warga' ? 100000 : 50000))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Bahan Bakar Minyak (BBM):</span>
                    <span>{formatRupiah(trip.bbm.biayaBbm)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Tol & Parkir:</span>
                    <span>{formatRupiah(trip.biaya.biayaTolParkir)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Subsidi Kas Sosial FKW-BPA:</span>
                    <span>- {formatRupiah(trip.biaya.potonganSubsidi)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-1.5 text-black">
                    <span>TOTAL DIBAYARKAN / INFAQ:</span>
                    <span className="font-mono text-base text-red-700">
                      {trip.biaya.totalTagihan === 0
                        ? 'Rp 0 (GRATIS SUBSIDI FKW)'
                        : formatRupiah(trip.biaya.totalTagihan)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 italic">
                  Catatan: {trip.biaya.catatanBiaya || 'Terima kasih atas partisipasi dan infaq untuk operasional ambulance warga.'}
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <p className="text-slate-600">Yang Menyerahkan</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{trip.pemohon.nama}</p>
                </div>

                <div>
                  <p className="text-slate-600">Bendahara / Petugas FKW-BPA</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">Bendahara FKW BPA</p>
                  <p className="text-[10px] text-slate-500">Cap Lunas</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. LAPORAN BULANAN ================= */}
          {docType === 'laporan_bulanan' && monthlyTrips && (
            <div className="space-y-6">
              {/* Kop Laporan */}
              <div className="border-b-2 border-black pb-3 text-center">
                <h1 className="font-extrabold text-base uppercase tracking-tight text-black">
                  FORUM KOMUNIKASI WARGA (FKW) BUMI PESONA ASRI
                </h1>
                <h2 className="font-bold text-sm text-red-700 uppercase">
                  LAPORAN BULANAN OPERASIONAL & ADMINISTRASI AMBULANCE
                </h2>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Periode: {monthLabel}
                </p>
              </div>

              {/* Ringkasan Rekapitulasi */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block text-[10px]">Total Trip:</span>
                  <strong className="text-sm">{monthlyTrips.length} Kali</strong>
                </div>
                <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block text-[10px]">Total Jarak:</span>
                  <strong className="text-sm">
                    {monthlyTrips.reduce((s, t) => s + (t.bbm?.totalKm || 0), 0)} KM
                  </strong>
                </div>
                <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block text-[10px]">Total BBM:</span>
                  <strong className="text-sm text-red-700">
                    {formatRupiah(
                      monthlyTrips.reduce((s, t) => s + (t.bbm?.biayaBbm || 0), 0)
                    )}
                  </strong>
                </div>
                <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block text-[10px]">Infaq Masuk:</span>
                  <strong className="text-sm text-emerald-700">
                    {formatRupiah(
                      monthlyTrips.reduce((s, t) => s + (t.biaya?.totalTagihan || 0), 0)
                    )}
                  </strong>
                </div>
              </div>

              {/* Tabel Perjalanan */}
              <div className="text-[10px]">
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 border-r border-slate-300">No. Tiket</th>
                      <th className="p-1.5 border-r border-slate-300">Tgl</th>
                      <th className="p-1.5 border-r border-slate-300">Pasien & Blok</th>
                      <th className="p-1.5 border-r border-slate-300">Tujuan</th>
                      <th className="p-1.5 border-r border-slate-300">Driver</th>
                      <th className="p-1.5 border-r border-slate-300">BBM</th>
                      <th className="p-1.5">Infaq</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrips.map((t, idx) => (
                      <tr key={t.id} className="border-b border-slate-200">
                        <td className="p-1.5 border-r border-slate-200 font-mono">
                          {t.ticketNumber}
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          {t.requestDate}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-semibold">
                          {t.pasien.nama} ({t.pemohon.blokRumah})
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          {t.tujuan.namaTujuan}
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          {t.sopir.nama.split(' ')[0]}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-mono">
                          {formatRupiah(t.bbm.biayaBbm)}
                        </td>
                        <td className="p-1.5 font-mono font-semibold">
                          {t.biaya.totalTagihan === 0
                            ? 'Subsidi'
                            : formatRupiah(t.biaya.totalTagihan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pengesahan */}
              <div className="pt-6 flex justify-end text-center text-xs pr-6">
                <div>
                  <p className="text-slate-600">Mengetahui & Menyetujui,</p>
                  <p className="font-semibold text-slate-700">Ketua Umum FKW-BPA</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">Susandi Haryadi</p>
                  <p className="text-[10px] text-slate-500">Forum Komunikasi Warga BPA</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
