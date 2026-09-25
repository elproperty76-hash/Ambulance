import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmbulanceTrip } from '../types';
import { formatRupiah, formatDateIndo } from './storage';

export interface MonthlyReportPdfOptions {
  monthLabel: string;
  monthlyTrips: AmbulanceTrip[];
  reportStats?: {
    totalTrips: number;
    completedTrips: number;
    activeTrips: number;
    totalKm: number;
    totalLiter: number;
    totalBbm: number;
    totalInfaq: number;
    totalSubsidi: number;
    totalInternalKendaraan?: number;
    totalExternalKendaraan?: number;
    totalBiayaKendaraan?: number;
  };
}

export function downloadMonthlyReportPdf(options: MonthlyReportPdfOptions): void {
  const { monthLabel, monthlyTrips, reportStats } = options;

  // Initialize jsPDF in landscape A4 format (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary palette
  const redPrimary = [185, 28, 28]; // #b91c1c
  const slateDark = [30, 41, 59]; // #1e293b
  const slateMuted = [100, 116, 139]; // #64748b

  // 1. Top Decorative Red Banner
  doc.setFillColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('FORUM KOMUNIKASI WARGA (FKW) BUMI PESONA ASRI', pageWidth / 2, 13, {
    align: 'center',
  });

  doc.setFontSize(11);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text('DIVISI OPERASIONAL AMBULANCE SIAGA WARGA 24 JAM', pageWidth / 2, 18, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(
    'Perumahan Bumi Pesona Asri, Kec. Rancaekek, Kab. Bandung 40394 | Hotline Dispatcher Posko FKW-BPA',
    pageWidth / 2,
    22.5,
    { align: 'center' }
  );

  // Line Divider under Kop
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.setLineWidth(0.6);
  doc.line(14, 25, pageWidth - 14, 25);

  // 3. Document Title & Period
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('REKAPITULASI DATA PERJALANAN & OPERASIONAL AMBULANCE', pageWidth / 2, 31, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(redPrimary[0], redPrimary[1], redPrimary[2]);
  doc.text(`Periode: ${monthLabel}`, pageWidth / 2, 35.5, {
    align: 'center',
  });

  // Calculate stats if not passed
  const totalTrips = reportStats?.totalTrips ?? monthlyTrips.length;
  const completedTrips =
    reportStats?.completedTrips ??
    monthlyTrips.filter((t) => t.status === 'selesai').length;
  const totalKm =
    reportStats?.totalKm ??
    monthlyTrips.reduce((acc, t) => acc + (t.bbm?.totalKm || 0), 0);
  const totalLiter =
    reportStats?.totalLiter ??
    monthlyTrips.reduce((acc, t) => acc + (t.bbm?.liter || 0), 0);
  const totalBbm =
    reportStats?.totalBbm ??
    monthlyTrips.reduce((acc, t) => acc + (t.bbm?.biayaBbm || 0), 0);
  const totalInfaq =
    reportStats?.totalInfaq ??
    monthlyTrips.reduce((acc, t) => acc + (t.biaya?.totalTagihan || 0), 0);
  const totalSubsidi =
    reportStats?.totalSubsidi ??
    monthlyTrips.reduce((acc, t) => acc + (t.biaya?.potonganSubsidi || 0), 0);

  const internalTrips = monthlyTrips.filter(
    (t) => t.pemohon?.tipeWarga === 'warga_bpa'
  ).length;
  const externalTrips = monthlyTrips.filter(
    (t) => t.pemohon?.tipeWarga === 'non_warga'
  ).length;
  const totalBiayaKendaraan = monthlyTrips.reduce((acc, t) => {
    const fee =
      t.biaya?.biayaKendaraan ??
      (t.pemohon?.tipeWarga === 'non_warga' ? 100000 : 50000);
    return acc + fee;
  }, 0);

  // 4. Summary KPI Cards (Horizontal 4-box layout)
  const cardY = 38.5;
  const cardHeight = 13;
  const cardSpacing = 3;
  const numCards = 4;
  const totalCardWidth = pageWidth - 28;
  const cardWidth = (totalCardWidth - cardSpacing * (numCards - 1)) / numCards;

  const kpis = [
    {
      label: 'TOTAL OPERASIONAL',
      value: `${totalTrips} Perjalanan`,
      sub: `${completedTrips} Selesai • ${totalTrips - completedTrips} Berlangsung`,
      bg: [241, 245, 249],
      border: [203, 213, 225],
    },
    {
      label: 'JARAK & KONSUMSI BBM',
      value: `${totalKm} KM (${totalLiter.toFixed(1)} L)`,
      sub: `Biaya: ${formatRupiah(totalBbm)}`,
      bg: [254, 243, 199], // amber light
      border: [251, 191, 36],
    },
    {
      label: 'BIAYA KENDARAAN (INT/EXT)',
      value: `${formatRupiah(totalBiayaKendaraan)}`,
      sub: `Internal: ${internalTrips} | External: ${externalTrips}`,
      bg: [238, 242, 255], // indigo light
      border: [199, 210, 254],
    },
    {
      label: 'INFAQ & SUBSIDI KAS',
      value: `${formatRupiah(totalInfaq)}`,
      sub: `Subsidi FKW: ${formatRupiah(totalSubsidi)}`,
      bg: [236, 253, 245], // emerald light
      border: [110, 231, 183],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + cardSpacing);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 3.8, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(kpi.value, x + cardWidth / 2, cardY + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(kpi.sub, x + cardWidth / 2, cardY + 11.5, { align: 'center' });
  });

  // 5. Table Data Generation
  const tableHead = [
    [
      'No',
      'No. Tiket',
      'Tgl & Jam',
      'Pasien & Tujuan',
      'Jasa Driver',
      'Jasa Relawan',
      'BBM',
      'Biaya Kendaraan',
      'Infaq',
      'Status',
    ],
  ];

  const tableBody = monthlyTrips.map((trip, index) => {
    const feeKendaraan =
      trip.biaya?.biayaKendaraan ??
      (trip.pemohon?.tipeWarga === 'non_warga' ? 100000 : 50000);

    const infaqText =
      trip.biaya?.totalTagihan === 0
        ? 'Subsidi'
        : formatRupiah(trip.biaya?.totalTagihan || 0);

    const statusLabel =
      trip.status === 'selesai'
        ? 'Selesai'
        : trip.status === 'dibatalkan'
        ? 'Batal'
        : trip.status.replace(/_/g, ' ');

    return [
      String(index + 1),
      trip.ticketNumber || '-',
      `${formatDateIndo(trip.requestDate)}\n${trip.requestTime || ''} WIB`,
      `${trip.pasien?.nama || '-'}\n(${trip.tujuan?.namaTujuan || '-'})`,
      `${trip.sopir?.nama || '-'}\n${formatRupiah(trip.biaya?.jasaSupir || 0)}`,
      `${trip.relawan?.nama || '-'}\n${formatRupiah(trip.biaya?.jasaRelawan || 0)}`,
      `${trip.bbm?.liter || 0} L\n${formatRupiah(trip.bbm?.biayaBbm || 0)}`,
      formatRupiah(feeKendaraan),
      infaqText,
      statusLabel.toUpperCase(),
    ];
  });

  // 6. Render Table using jspdf-autotable
  autoTable(doc, {
    startY: cardY + cardHeight + 3.5,
    margin: { left: 14, right: 14 },
    head: tableHead,
    body: tableBody.length > 0 ? tableBody : [['-', '-', '-', '-', 'Tidak ada riwayat perjalanan pada periode ini', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.8,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [185, 28, 28], // Red 700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 }, // No
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' }, // Tiket
      2: { halign: 'center', cellWidth: 22 }, // Tgl & Jam
      3: { halign: 'left', cellWidth: 42 }, // Pasien & Tujuan
      4: { halign: 'left', cellWidth: 32 }, // Jasa Driver
      5: { halign: 'left', cellWidth: 32 }, // Jasa Relawan
      6: { halign: 'right', cellWidth: 22 }, // BBM
      7: { halign: 'center', cellWidth: 22 }, // Biaya Kendaraan
      8: { halign: 'right', cellWidth: 24, fontStyle: 'bold' }, // Infaq
      9: { halign: 'center', cellWidth: 17, fontStyle: 'bold' }, // Status
    },
    didDrawPage: (data) => {
      // Footer page numbering on each page
      const str = `Halaman ${data.pageNumber}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 14, pageHeight - 6, { align: 'right' });
      doc.text(
        `Dokumen Resmi Rekapitulasi Operasional Ambulance FKW-BPA • Dicetak: ${new Date().toLocaleString('id-ID')}`,
        14,
        pageHeight - 6
      );
    },
  });

  // 7. Signature Section at the bottom of the last page (or new page if tight)
  // @ts-ignore
  let finalY = doc.lastAutoTable?.finalY || 150;

  if (finalY > pageHeight - 45) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 6;
  }

  const signWidth = (pageWidth - 28) / 2;
  const signY = finalY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  // Sign 1: Bendahara
  doc.text('Diverifikasi oleh,', 14 + signWidth * 0.5, signY, { align: 'center' });
  doc.text('Bendahara FKW BPA', 14 + signWidth * 0.5, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Bendahara FKW BPA', 14 + signWidth * 0.5, signY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Bidang Pengelolaan Kas Sosial', 14 + signWidth * 0.5, signY + 25.5, { align: 'center' });

  // Sign 2: Ketua FKW BPA
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Mengetahui & Menyetujui,', 14 + signWidth * 1.5, signY, { align: 'center' });
  doc.text('Ketua FKW BPA', 14 + signWidth * 1.5, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Susandi Haryadi', 14 + signWidth * 1.5, signY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Forum Komunikasi Warga BPA', 14 + signWidth * 1.5, signY + 25.5, { align: 'center' });

  // 8. Save / Download PDF
  const sanitizedPeriod = monthLabel.replace(/[^a-zA-Z0-9]/g, '-');
  doc.save(`Rekapitulasi-Perjalanan-Ambulance-FKW-BPA-${sanitizedPeriod}.pdf`);
}
