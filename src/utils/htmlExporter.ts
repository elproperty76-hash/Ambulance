import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  CallCenterContact,
  TariffConfig,
} from '../types';
import { formatRupiah, formatDateIndo } from './storage';

export function generateStandaloneHtmlReport(data: {
  trips: AmbulanceTrip[];
  drivers: DriverMaster[];
  relawan: RelawanMaster[];
  fleet: FleetVehicle;
  fleets?: FleetVehicle[];
  callCenters: CallCenterContact[];
  tariffConfig: TariffConfig;
  exportedAt?: string;
}): string {
  const {
    trips,
    drivers,
    relawan,
    fleet,
    fleets = [fleet],
    callCenters,
    tariffConfig,
    exportedAt = new Date().toLocaleString('id-ID'),
  } = data;

  const totalBiayaBbm = trips.reduce((sum, t) => sum + (t.bbm?.biayaBbm || 0), 0);
  const totalInfaq = trips.reduce((sum, t) => sum + (t.biaya?.totalTagihan || 0), 0);
  const totalSubsidi = trips.reduce((sum, t) => sum + (t.biaya?.potonganSubsidi || 0), 0);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan & Data Ambulance FKW BPA Rancaekek</title>
  <style>
    :root {
      --primary: #dc2626;
      --primary-dark: #b91c1c;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --bg-alt: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f1f5f9; color: var(--text); padding: 20px; line-height: 1.5; }
    .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid var(--border); }
    .header { background: #dc2626; color: white; padding: 24px; text-align: center; position: relative; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.92; }
    .meta-bar { background: #fee2e2; color: #991b1b; padding: 8px 24px; font-size: 12px; display: flex; justify-content: space-between; font-weight: 600; border-bottom: 1px solid #fecaca; }
    .content { padding: 24px; }
    h2 { font-size: 16px; color: #1e293b; border-left: 4px solid var(--primary); padding-left: 10px; margin: 24px 0 12px; font-weight: 700; }
    h2:first-of-type { margin-top: 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: var(--bg-alt); border: 1px solid var(--border); border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-card .val { font-size: 20px; font-weight: 800; color: #dc2626; margin: 4px 0; }
    .kpi-card .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background-color: #fafafa; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .badge-selesai { background: #dcfce7; color: #166534; }
    .badge-siaga { background: #dbeafe; color: #1e40af; }
    .badge-darurat { background: #fee2e2; color: #991b1b; }
    .print-btn { background: #dc2626; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; float: right; margin-bottom: 15px; }
    .print-btn:hover { background: #b91c1c; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: var(--muted); border-top: 1px solid var(--border); background: var(--bg-alt); }
    @media print {
      body { background: white; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AMBULANCE FORUM KOMUNIKASI WARGA (FKW)</h1>
      <p>PERUMAHAN BUMI PESONA ASRI (BPA) RANCAEKEK - BANDUNG</p>
      <p style="font-size: 11px; margin-top: 4px;">Posko Siaga: Balai Warga RW 14 BPA | Call Center Siaga 24 Jam</p>
    </div>
    
    <div class="meta-bar">
      <span>DOKUMEN REKAPITULASI RESMI OPERASIONAL & KEUANGAN</span>
      <span>Diekspor: ${exportedAt}</span>
    </div>

    <div class="content">
      <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
      <div style="clear: both;"></div>

      <h2>Ringkasan Kinerja & Keuangan</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="lbl">Total Perjalanan</div>
          <div class="val">${trips.length} Trip</div>
        </div>
        <div class="kpi-card">
          <div class="lbl">Total Pengeluaran BBM</div>
          <div class="val">${formatRupiah(totalBiayaBbm)}</div>
        </div>
        <div class="kpi-card">
          <div class="lbl">Infaq Sukarela Masuk</div>
          <div class="val">${formatRupiah(totalInfaq)}</div>
        </div>
        <div class="kpi-card">
          <div class="lbl">Subsidi Kas Warga FKW</div>
          <div class="val">${formatRupiah(totalSubsidi)}</div>
        </div>
      </div>

      <h2>Daftar Armada Ambulance Siaga</h2>
      <table>
        <thead>
          <tr>
            <th>No. Plat</th>
            <th>Nama Unit & Merk</th>
            <th>Tahun</th>
            <th>Spidometer</th>
            <th>Kondisi BBM & Oksigen</th>
            <th>Penanggung Jawab</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${fleets
            .map(
              (f) => `
            <tr>
              <td><strong>${f.platNomor}</strong></td>
              <td>${f.namaUnit} (${f.merk})</td>
              <td>${f.tahun}</td>
              <td>${Number(f.kmSpidometer).toLocaleString('id-ID')} KM</td>
              <td>BBM: ${f.kondisiBbmPersen}% | ${f.kondisiOksigen}</td>
              <td>${f.penanggungJawab}</td>
              <td><span class="badge ${
                f.status === 'siaga' ? 'badge-siaga' : 'badge-darurat'
              }">${f.status}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>Roster Supir & Relawan Medis</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <h3 style="font-size: 13px; margin-bottom: 6px; color: #334155;">Daftar Supir Ambulance:</h3>
          <table>
            <thead>
              <tr>
                <th>Nama Supir</th>
                <th>Kontak HP</th>
                <th>Domisili BPA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${drivers
                .map(
                  (d) => `
                <tr>
                  <td><strong>${d.nama}</strong></td>
                  <td>${d.noHp}</td>
                  <td>${d.alamatBpa}</td>
                  <td>${d.status}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <div>
          <h3 style="font-size: 13px; margin-bottom: 6px; color: #334155;">Daftar Relawan Satgas Medis:</h3>
          <table>
            <thead>
              <tr>
                <th>Nama Relawan</th>
                <th>Kontak HP</th>
                <th>Domisili Blok</th>
                <th>Keahlian</th>
              </tr>
            </thead>
            <tbody>
              ${relawan
                .map(
                  (r) => `
                <tr>
                  <td><strong>${r.nama}</strong></td>
                  <td>${r.noHp}</td>
                  <td>${r.blokBpa}</td>
                  <td>${r.keahlian}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <h2>Log Riwayat Pelayanan Ambulance</h2>
      <table>
        <thead>
          <tr>
            <th>Tiket & Tanggal</th>
            <th>Nama Pasien</th>
            <th>Domisili BPA</th>
            <th>Tujuan RS / Lokasi</th>
            <th>Petugas</th>
            <th>BBM</th>
            <th>Biaya / Infaq</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${trips
            .map(
              (t) => `
            <tr>
              <td><strong>${t.ticketNumber}</strong><br><small style="color:#64748b">${t.requestDate}</small></td>
              <td><strong>${t.pasien.nama}</strong> (${t.pasien.usia} thn)<br><small>${t.pasien.diagnosaKeluhan}</small></td>
              <td>${t.pemohon.blokRumah}<br><small>${t.pemohon.rtRw}</small></td>
              <td>${t.tujuan.namaTujuan} (${t.tujuan.jarakKm} km)</td>
              <td>S: ${t.sopir.nama}<br>R: ${t.relawan.nama}</td>
              <td>${t.bbm.liter} L (${formatRupiah(t.bbm.biayaBbm)})</td>
              <td>${t.biaya.totalTagihan === 0 ? 'Subsidi Kas' : formatRupiah(t.biaya.totalTagihan)}</td>
              <td><span class="badge ${
                t.status === 'selesai'
                  ? 'badge-selesai'
                  : t.status === 'dibatalkan'
                  ? 'badge-darurat'
                  : 'badge-siaga'
              }">${t.status}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>Kontak Darurat & Call Center Posko</h2>
      <table>
        <thead>
          <tr>
            <th>Nama / Posko</th>
            <th>Nomor Telepon / WhatsApp</th>
            <th>Peran</th>
            <th>Jam Kesiagaan</th>
          </tr>
        </thead>
        <tbody>
          ${callCenters
            .map(
              (c) => `
            <tr>
              <td><strong>${c.nama}</strong></td>
              <td><a href="tel:${c.noHp}">${c.noHp}</a></td>
              <td>${c.jabatan || 'Koordinator Posko'}</td>
              <td>${c.tersedia24Jam ? '24 Jam Siaga' : 'Siaga Darurat'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Dokumen ini diterbitkan oleh Sistem Manajemen Operasional Ambulance Tanggap Darurat Forum Komunikasi Warga (FKW) Perumahan Bumi Pesona Asri (BPA) Rancaekek.
    </div>
  </div>
</body>
</html>`;
}

export function downloadHtmlFile(htmlContent: string, filename: string = 'laporan-ambulance-bpa.html') {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
