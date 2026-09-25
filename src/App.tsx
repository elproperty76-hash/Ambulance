import React, { useState, useEffect } from 'react';
import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  RequestStatus,
  CallCenterContact,
  TariffConfig,
  AuthSession,
} from './types';
import {
  loadTrips,
  saveTrips,
  loadDrivers,
  saveDrivers,
  loadRelawan,
  saveRelawan,
  loadFleet,
  saveFleet,
  loadFleets,
  saveFleets,
  loadCallCenters,
  saveCallCenters,
  loadTariffConfig,
  saveTariffConfig,
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  authenticateUser,
  updateAdminPassword,
  resetAllDataToDefault,
  clearAllTripsData,
  formatDateIndo,
  formatRupiah,
  sendAutomatedWhatsAppMessage,
  AutomatedWhatsAppPayload,
} from './utils/storage';
import { AndroidHeader } from './components/AndroidHeader';
import {
  initializeFirestoreData,
  subscribeFleets,
  subscribeDrivers,
  subscribeRelawan,
  subscribeCallCenters,
  subscribeTrips,
  subscribeTariff,
  saveFleetCloud,
  deleteFleetCloud,
  saveDriverCloud,
  deleteDriverCloud,
  saveRelawanCloud,
  deleteRelawanCloud,
  saveCallCenterCloud,
  deleteCallCenterCloud,
  saveTripCloud,
  deleteTripCloud,
  saveTariffCloud,
  clearAllTripsCloud,
  resetAllDataCloud,
} from './firebase';
import { BottomNav, NavTab } from './components/BottomNav';
import { LiveOperationsTab } from './components/LiveOperationsTab';
import { NewTripFormTab } from './components/NewTripFormTab';
import { TripHistoryTab } from './components/TripHistoryTab';
import { MonthlyReportTab } from './components/MonthlyReportTab';
import { PersonalTab } from './components/PersonalTab';
import { TripDetailModal } from './components/TripDetailModal';
import {
  PrintDocumentModal,
  DocumentType,
} from './components/PrintDocumentModal';
import { EmergencyHotlineModal } from './components/EmergencyHotlineModal';
import { DataResetModal } from './components/DataResetModal';
import { AutoWhatsAppNotificationToast } from './components/AutoWhatsAppNotificationToast';
import { Plus, ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('live');

  // Automated WhatsApp dispatch toast notification state
  const [autoWaPayload, setAutoWaPayload] =
    useState<AutomatedWhatsAppPayload | null>(null);

  // Authentication State for Personal / Admin access
  const [authSession, setAuthSession] = useState<AuthSession>(() =>
    loadAuthSession()
  );

  // Core persistent states
  const [trips, setTrips] = useState<AmbulanceTrip[]>(() => loadTrips());
  const [drivers, setDrivers] = useState<DriverMaster[]>(() => loadDrivers());
  const [relawan, setRelawan] = useState<RelawanMaster[]>(() => loadRelawan());
  const [fleets, setFleets] = useState<FleetVehicle[]>(() => loadFleets());
  const [fleet, setFleet] = useState<FleetVehicle>(() => {
    const list = loadFleets();
    return list.find((f) => f.isUtama) || list[0] || loadFleet();
  });
  const [callCenters, setCallCenters] = useState<CallCenterContact[]>(() =>
    loadCallCenters()
  );
  const [tariffConfig, setTariffConfig] = useState<TariffConfig>(() =>
    loadTariffConfig()
  );

  // Modals state
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [selectedTripForDetail, setSelectedTripForDetail] =
    useState<AmbulanceTrip | null>(null);
  const [showEmergencyHotline, setShowEmergencyHotline] =
    useState<boolean>(false);
  const [printModalConfig, setPrintModalConfig] = useState<{
    isOpen: boolean;
    docType: DocumentType;
    trip?: AmbulanceTrip | null;
    monthLabel?: string;
    monthlyTrips?: AmbulanceTrip[];
  }>({
    isOpen: false,
    docType: 'surat_jalan',
  });

  // Sync with storage on state updates
  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  useEffect(() => {
    saveDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    saveRelawan(relawan);
  }, [relawan]);

  useEffect(() => {
    saveFleets(fleets);
    const primary = fleets.find((f) => f.isUtama) || fleets[0];
    if (primary) {
      setFleet(primary);
      saveFleet(primary);
    }
  }, [fleets]);

  useEffect(() => {
    saveFleet(fleet);
  }, [fleet]);

  // Helper to keep active fleet and fleets array fully synchronized
  const updateActiveFleetAndList = (updater: (prev: FleetVehicle) => FleetVehicle) => {
    setFleet((prevFleet) => {
      const updated = updater(prevFleet);
      saveFleet(updated);
      saveFleetCloud(updated);

      setFleets((prevFleets) => {
        const newFleets = prevFleets.map((f) => {
          if (
            f.id === updated.id ||
            f.platNomor === updated.platNomor ||
            (f.isUtama && updated.isUtama)
          ) {
            return updated;
          }
          return f;
        });
        saveFleets(newFleets);
        return newFleets;
      });

      return updated;
    });
  };

  // Sync active fleet status with active trips
  useEffect(() => {
    const hasActive = trips.some(
      (t) => t.status !== 'selesai' && t.status !== 'dibatalkan'
    );
    if (hasActive) {
      if (fleet.status === 'siaga') {
        updateActiveFleetAndList((prev) => ({ ...prev, status: 'beroperasi' }));
      }
    } else {
      if (fleet.status === 'beroperasi') {
        updateActiveFleetAndList((prev) => ({ ...prev, status: 'siaga' }));
      }
    }
  }, [trips]);

  useEffect(() => {
    saveCallCenters(callCenters);
  }, [callCenters]);

  useEffect(() => {
    saveTariffConfig(tariffConfig);
  }, [tariffConfig]);

  useEffect(() => {
    saveAuthSession(authSession);
  }, [authSession]);

  // Connect to Cloud Firestore: Bootstrap data if fresh, and subscribe to real-time updates across all browsers
  useEffect(() => {
    initializeFirestoreData();

    const unsubFleets = subscribeFleets((cloudFleets) => {
      if (Array.isArray(cloudFleets) && cloudFleets.length > 0) {
        setFleets(cloudFleets);
        saveFleets(cloudFleets);
        const primary = cloudFleets.find((f) => f.isUtama) || cloudFleets[0];
        if (primary) {
          setFleet(primary);
          saveFleet(primary);
        }
      }
    });

    const unsubDrivers = subscribeDrivers((cloudDrivers) => {
      if (Array.isArray(cloudDrivers)) {
        setDrivers(cloudDrivers);
        saveDrivers(cloudDrivers);
      }
    });

    const unsubRelawan = subscribeRelawan((cloudRelawan) => {
      if (Array.isArray(cloudRelawan)) {
        setRelawan(cloudRelawan);
        saveRelawan(cloudRelawan);
      }
    });

    const unsubCallCenters = subscribeCallCenters((cloudCC) => {
      if (Array.isArray(cloudCC)) {
        setCallCenters(cloudCC);
        saveCallCenters(cloudCC);
      }
    });

    const unsubTrips = subscribeTrips((cloudTrips) => {
      if (Array.isArray(cloudTrips)) {
        setTrips(cloudTrips);
        saveTrips(cloudTrips);
      }
    });

    const unsubTariff = subscribeTariff((cloudTariff) => {
      if (cloudTariff) {
        setTariffConfig(cloudTariff);
        saveTariffConfig(cloudTariff);
      }
    });

    return () => {
      unsubFleets();
      unsubDrivers();
      unsubRelawan();
      unsubCallCenters();
      unsubTrips();
      unsubTariff();
    };
  }, []);

  // Auth Action Handlers
  const handleLogin = (username: string, password: string) => {
    const res = authenticateUser(username, password);
    if (res.success && res.user) {
      const newSession: AuthSession = {
        isAuthenticated: true,
        user: res.user,
        loginTimestamp: new Date().toISOString(),
      };
      setAuthSession(newSession);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login gagal' };
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession({ isAuthenticated: false, user: null });
  };

  const handleChangePassword = (newPassword: string): boolean => {
    if (authSession.user) {
      const ok = updateAdminPassword(authSession.user.id, newPassword);
      if (ok) {
        setAuthSession((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, passwordHash: newPassword } : null,
        }));
      }
      return ok;
    }
    return false;
  };

  // Active trips count
  const activeTripsCount = trips.filter(
    (t) => t.status !== 'selesai' && t.status !== 'dibatalkan'
  ).length;

  const pendingTripsCount = trips.filter((t) => t.status === 'menunggu').length;

  // Handler: Add new trip
  const handleAddNewTrip = (newTrip: AmbulanceTrip) => {
    const updated = [newTrip, ...trips];
    setTrips(updated);
    saveTrips(updated);
    saveTripCloud(newTrip);

    // Update fleet odometer and driver status
    updateActiveFleetAndList((prev) => ({
      ...prev,
      kmSpidometer: newTrip.bbm.kmAkhir || prev.kmSpidometer + 20,
      status: 'beroperasi',
    }));

    setDrivers((prev) => {
      const updatedDrivers = prev.map((d) => {
        if (d.id === newTrip.sopir.driverId) {
          const mod: DriverMaster = { ...d, status: 'bertugas', totalTrip: d.totalTrip + 1 };
          saveDriverCloud(mod);
          return mod;
        }
        return d;
      });
      saveDrivers(updatedDrivers);
      return updatedDrivers;
    });

    setActiveTab('live');
  };

  // Handler: Update trip status real-time
  const handleUpdateTripStatus = (
    tripId: string,
    newStatus: RequestStatus,
    note?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusTitleMap: Record<RequestStatus, string> = {
      menunggu: 'Permintaan Masuk',
      disetujui: 'Driver & Armada Ditugaskan',
      menuju_lokasi: 'Ambulance Berangkat Menuju Lokasi Pasien',
      membawa_pasien: 'Pasien Berangkat Menuju RS',
      tiba_tujuan: 'Ambulance Tiba di RS / Lokasi Tujuan',
      selesai: 'Operasional Selesai & Kembali ke Pool BPA',
      dibatalkan: 'Permintaan Dibatalkan',
    };

    setTrips((prevTrips) => {
      const updated = prevTrips.map((t) => {
        if (t.id === tripId) {
          const updatedTimeline = [
            ...(t.timeline || []),
            {
              id: `tl-${Date.now()}`,
              time: nowTime,
              status: newStatus,
              title: statusTitleMap[newStatus] || newStatus,
              note: note || `Status diperbarui menjadi ${newStatus}`,
              updatedBy: 'Petugas FKW-BPA',
            },
          ];

          const updatedTrip: AmbulanceTrip = {
            ...t,
            status: newStatus,
            timeline: updatedTimeline,
          };
          saveTripCloud(updatedTrip);
          return updatedTrip;
        }
        return t;
      });
      saveTrips(updated);
      return updated;
    });

    // If finished, free driver and fleet status
    if (newStatus === 'selesai' || newStatus === 'dibatalkan') {
      const targetTrip = trips.find((t) => t.id === tripId);
      if (targetTrip) {
        setDrivers((prev) => {
          const updated = prev.map((d) => {
            if (d.id === targetTrip.sopir.driverId) {
              const mod: DriverMaster = { ...d, status: 'siaga' };
              saveDriverCloud(mod);
              return mod;
            }
            return d;
          });
          saveDrivers(updated);
          return updated;
        });
        updateActiveFleetAndList((prev) => ({
          ...prev,
          status: 'siaga',
        }));
      }
    }

    // Trigger automated WhatsApp message to applicant (Pemohon) for 'disetujui' and 'selesai' status
    if (newStatus === 'disetujui' || newStatus === 'selesai') {
      const targetTrip = trips.find((t) => t.id === tripId);
      if (targetTrip) {
        const dispatchResult = sendAutomatedWhatsAppMessage(
          targetTrip,
          newStatus,
          fleet.platNomor
        );
        if (dispatchResult && dispatchResult.payload) {
          setAutoWaPayload(dispatchResult.payload);
        }
      }
    }

    // Also update selected modal trip if open
    if (selectedTripForDetail && selectedTripForDetail.id === tripId) {
      setSelectedTripForDetail((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  };

  // Handler: Update driver status
  const handleUpdateDriverStatus = (
    driverId: string,
    newStatus: 'siaga' | 'bertugas' | 'libur'
  ) => {
    setDrivers((prev) => {
      const updated = prev.map((d) => {
        if (d.id === driverId) {
          const mod: DriverMaster = { ...d, status: newStatus };
          saveDriverCloud(mod);
          return mod;
        }
        return d;
      });
      saveDrivers(updated);
      return updated;
    });
  };

  // Handler: Add new driver
  const handleAddDriver = (newDriver: DriverMaster) => {
    const driverWithId: DriverMaster = {
      ...newDriver,
      id: newDriver.id || `drv-${Date.now()}`,
    };
    setDrivers((prev) => {
      const updated = [driverWithId, ...prev.filter((d) => d.id !== driverWithId.id)];
      saveDrivers(updated);
      return updated;
    });
    saveDriverCloud(driverWithId);
  };

  // Handler: Update driver details
  const handleUpdateDriver = (updatedDriver: DriverMaster) => {
    setDrivers((prev) => {
      const updated = prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d));
      saveDrivers(updated);
      return updated;
    });
    saveDriverCloud(updatedDriver);
  };

  // Handler: Delete driver
  const handleDeleteDriver = (driverId: string) => {
    setDrivers((prev) => {
      const updated = prev.filter((d) => d.id !== driverId);
      saveDrivers(updated);
      return updated;
    });
    deleteDriverCloud(driverId);
  };

  // Handler: Add new relawan
  const handleAddRelawan = (newRelawan: RelawanMaster) => {
    const relawanWithId: RelawanMaster = {
      ...newRelawan,
      id: newRelawan.id || `rel-${Date.now()}`,
    };
    setRelawan((prev) => {
      const updated = [relawanWithId, ...prev.filter((r) => r.id !== relawanWithId.id)];
      saveRelawan(updated);
      return updated;
    });
    saveRelawanCloud(relawanWithId);
  };

  // Handler: Update relawan details
  const handleUpdateRelawan = (updatedRelawan: RelawanMaster) => {
    setRelawan((prev) => {
      const updated = prev.map((r) => (r.id === updatedRelawan.id ? updatedRelawan : r));
      saveRelawan(updated);
      return updated;
    });
    saveRelawanCloud(updatedRelawan);
  };

  // Handler: Delete relawan
  const handleDeleteRelawan = (relawanId: string) => {
    setRelawan((prev) => {
      const updated = prev.filter((r) => r.id !== relawanId);
      saveRelawan(updated);
      return updated;
    });
    deleteRelawanCloud(relawanId);
  };

  // Handler: Add new Call Center contact
  const handleAddCallCenter = (newContact: CallCenterContact) => {
    const ccWithId: CallCenterContact = {
      ...newContact,
      id: newContact.id || `cc-${Date.now()}`,
    };
    setCallCenters((prev) => {
      let updated = prev.filter((c) => c.id !== ccWithId.id);
      if (ccWithId.isUtama) {
        updated = updated.map((c) => {
          const mod: CallCenterContact = { ...c, isUtama: false };
          saveCallCenterCloud(mod);
          return mod;
        });
      }
      const combined = [ccWithId, ...updated];
      saveCallCenters(combined);
      return combined;
    });
    saveCallCenterCloud(ccWithId);
  };

  // Handler: Update Call Center contact
  const handleUpdateCallCenter = (updatedContact: CallCenterContact) => {
    setCallCenters((prev) => {
      let updated = prev.map((c) =>
        c.id === updatedContact.id ? updatedContact : c
      );
      if (updatedContact.isUtama) {
        updated = updated.map((c) => {
          const mod: CallCenterContact = c.id === updatedContact.id ? c : { ...c, isUtama: false };
          if (c.id !== updatedContact.id) {
            saveCallCenterCloud(mod);
          }
          return mod;
        });
      }
      saveCallCenters(updated);
      return updated;
    });
    saveCallCenterCloud(updatedContact);
  };

  // Handler: Delete Call Center contact
  const handleDeleteCallCenter = (contactId: string) => {
    setCallCenters((prev) => {
      const updated = prev.filter((c) => c.id !== contactId);
      saveCallCenters(updated);
      return updated;
    });
    deleteCallCenterCloud(contactId);
  };

  // Handler: Update Tariff Config
  const handleUpdateTariffConfig = (newConfig: TariffConfig) => {
    setTariffConfig(newConfig);
    saveTariffConfig(newConfig);
    saveTariffCloud(newConfig);
  };

  // Handler: Update fleet
  const handleUpdateFleet = (newFleet: FleetVehicle) => {
    setFleets((prev) => {
      const targetId = newFleet.id;
      // Match by ID, or by platNomor, or if only 1 vehicle exists match index 0
      let matchIdx = -1;
      if (targetId) {
        matchIdx = prev.findIndex((f) => f.id === targetId);
      }
      if (matchIdx < 0 && newFleet.platNomor) {
        matchIdx = prev.findIndex((f) => f.platNomor === newFleet.platNomor);
      }
      if (matchIdx < 0 && prev.length === 1) {
        matchIdx = 0;
      }

      let updatedList: FleetVehicle[];
      if (matchIdx >= 0) {
        updatedList = prev.map((f, idx) => {
          if (idx === matchIdx) {
            const mod: FleetVehicle = {
              ...f,
              ...newFleet,
              id: newFleet.id || f.id || `fleet-${String(idx + 1).padStart(2, '0')}`,
            };
            saveFleetCloud(mod);
            return mod;
          }
          if (newFleet.isUtama) {
            const mod: FleetVehicle = { ...f, isUtama: false };
            saveFleetCloud(mod);
            return mod;
          }
          return f;
        });
      } else {
        if (newFleet.isUtama) {
          updatedList = prev.map((f) => {
            const mod: FleetVehicle = { ...f, isUtama: false };
            saveFleetCloud(mod);
            return mod;
          });
          updatedList.push(newFleet);
        } else {
          updatedList = [...prev, newFleet];
        }
        saveFleetCloud(newFleet);
      }

      // Ensure at least one vehicle has isUtama
      if (!updatedList.some((f) => f.isUtama) && updatedList.length > 0) {
        updatedList[0].isUtama = true;
        saveFleetCloud(updatedList[0]);
      }

      const activePrimary = updatedList.find((f) => f.isUtama) || updatedList[0];
      if (activePrimary) {
        setFleet(activePrimary);
        saveFleet(activePrimary);
      }
      saveFleets(updatedList);
      return updatedList;
    });
  };

  // Handler: Add new fleet
  const handleAddFleet = (newFleet: FleetVehicle) => {
    const fleetWithId: FleetVehicle = {
      ...newFleet,
      id: newFleet.id || `fleet-${Date.now()}`,
    };
    setFleets((prev) => {
      let updated = [...prev];
      if (fleetWithId.isUtama) {
        updated = updated.map((f) => {
          const mod: FleetVehicle = { ...f, isUtama: false };
          saveFleetCloud(mod);
          return mod;
        });
      }
      const combined = [...updated, fleetWithId];
      if (!combined.some((f) => f.isUtama) && combined.length > 0) {
        combined[0].isUtama = true;
      }
      const activePrimary = combined.find((f) => f.isUtama) || combined[0];
      if (activePrimary) {
        setFleet(activePrimary);
        saveFleet(activePrimary);
      }
      saveFleets(combined);
      return combined;
    });
    saveFleetCloud(fleetWithId);
  };

  // Handler: Delete fleet
  const handleDeleteFleet = (fleetIdOrPlat: string) => {
    setFleets((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      const target = prev.find((f) => f.id === fleetIdOrPlat || f.platNomor === fleetIdOrPlat);
      const filtered = prev.filter(
        (f) => f.id !== fleetIdOrPlat && f.platNomor !== fleetIdOrPlat
      );
      if (!filtered.some((f) => f.isUtama) && filtered.length > 0) {
        filtered[0].isUtama = true;
        saveFleetCloud(filtered[0]);
      }
      const activePrimary = filtered.find((f) => f.isUtama) || filtered[0];
      if (activePrimary) {
        setFleet(activePrimary);
        saveFleet(activePrimary);
      }
      saveFleets(filtered);
      if (target?.id) {
        deleteFleetCloud(target.id);
      }
      return filtered;
    });
  };

  // Print handlers
  const handlePrintSuratJalan = (trip: AmbulanceTrip) => {
    setPrintModalConfig({
      isOpen: true,
      docType: 'surat_jalan',
      trip,
    });
  };

  const handlePrintKuitansi = (trip: AmbulanceTrip) => {
    setPrintModalConfig({
      isOpen: true,
      docType: 'kuitansi',
      trip,
    });
  };

  const handleExportMonthlyReportPrint = (
    monthLabel: string,
    monthlyTrips: AmbulanceTrip[]
  ) => {
    setPrintModalConfig({
      isOpen: true,
      docType: 'laporan_bulanan',
      monthLabel,
      monthlyTrips,
    });
  };

  // WhatsApp Share handler for trip
  const handleShareWhatsAppTrip = (trip: AmbulanceTrip) => {
    const text = `🚑 *LAPORAN OPERASIONAL AMBULANCE FKW-BPA* 🚑\n*Perumahan Bumi Pesona Asri Rancaekek*\n\n📋 *No. Tiket:* ${trip.ticketNumber}\n⏱ *Waktu:* ${formatDateIndo(trip.requestDate)}, ${trip.requestTime} WIB\n🚨 *Status:* ${trip.status.toUpperCase()}\n\n👤 *DATA PASIEN & PEMOHON:*\n• Pasien: ${trip.pasien.nama} (${trip.pasien.usia} th / ${trip.pasien.jenisKelamin})\n• Kondisi: ${trip.pasien.diagnosaKeluhan}\n• Pemohon: ${trip.pemohon.nama} (${trip.pemohon.noHp})\n• Alamat BPA: ${trip.pemohon.blokRumah}\n\n🏥 *TUJUAN RUJUKAN:*\n• Tempat: ${trip.tujuan.namaTujuan}\n• Jarak: ${trip.tujuan.jarakKm} KM (${trip.tujuan.ruteVia})\n\n🚗 *ARMADA & PETUGAS:*\n• Driver: ${trip.sopir.nama}\n• Relawan: ${trip.relawan.nama}\n• Unit: ${fleet.platNomor}\n\n⛽ *BBM & KEUANGAN:*\n• BBM: ${trip.bbm.liter} L (${formatRupiah(trip.bbm.biayaBbm)})\n• Biaya Pengguna: ${trip.biaya.totalTagihan === 0 ? 'Gratis (Subsidi Kas FKW-BPA)' : formatRupiah(trip.biaya.totalTagihan)}\n\n_Divisi Ambulance - Forum Komunikasi Warga Bumi Pesona Asri (FKW-BPA)_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // WhatsApp Share handler for monthly report
  const handleShareMonthlyWhatsApp = (monthLabel: string, stats: any) => {
    const text = `📊 *REKAPITULASI BULANAN AMBULANCE FKW-BPA* 📊\n*Periode: ${monthLabel}*\n*Perumahan Bumi Pesona Asri Rancaekek*\n\n• Total Trip Layanan: *${stats.totalTrips} Kali Perjalanan*\n• Selesai Terlayani: *${stats.completedTrips} Pasien*\n• Total Jarak Tempuh: *${stats.totalKmTraveled} KM*\n• Pengeluaran BBM: *${formatRupiah(stats.totalBiayaBbm)}* (${stats.totalLiterBbm} Liter)\n• Infaq Warga Masuk: *${formatRupiah(stats.totalInfaqPemasukan)}*\n• Total Subsidi Kas FKW: *${formatRupiah(stats.totalSubsidiKasFkw)}*\n\nTerima kasih kepada seluruh warga BPA, para donatur, dan tim driver relawan atas kelancaran operasional kemanusiaan warga.\n\n_Forum Komunikasi Warga (FKW) Bumi Pesona Asri_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Quick Call handler
  const handleQuickCall = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // Delete single trip
  const handleDeleteSingleTrip = (tripId: string) => {
    const target = trips.find((t) => t.id === tripId);
    if (target && target.status !== 'selesai' && target.status !== 'dibatalkan') {
      // Revert driver & fleet if deleting an active trip
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === target.sopir.driverId) {
            const mod: DriverMaster = { ...d, status: 'siaga' };
            saveDriverCloud(mod);
            return mod;
          }
          return d;
        })
      );
      updateActiveFleetAndList((prev) => ({ ...prev, status: 'siaga' }));
    }

    const updated = trips.filter((t) => t.id !== tripId);
    setTrips(updated);
    saveTrips(updated);
    deleteTripCloud(tripId);

    if (selectedTripForDetail && selectedTripForDetail.id === tripId) {
      setSelectedTripForDetail(null);
    }
  };

  // Reset Data Handler 1: Clear All Trips (0 items)
  const handleClearAllTrips = () => {
    clearAllTripsData();
    clearAllTripsCloud();
    setTrips([]);
    // Free fleet and drivers
    setDrivers((prev) => {
      const updated = prev.map((d) => {
        const mod: DriverMaster = { ...d, status: 'siaga' };
        saveDriverCloud(mod);
        return mod;
      });
      saveDrivers(updated);
      return updated;
    });
    updateActiveFleetAndList((prev) => ({ ...prev, status: 'siaga' }));
    setSelectedTripForDetail(null);
  };

  // Reset Data Handler 2: Restore All Default Demo BPA Data
  const handleResetToDefault = () => {
    resetAllDataToDefault();
    resetAllDataCloud();
    setTrips(loadTrips());
    setDrivers(loadDrivers());
    setRelawan(loadRelawan());
    setFleet(loadFleet());
    setFleets(loadFleets());
    setCallCenters(loadCallCenters());
    setTariffConfig(loadTariffConfig());
    setSelectedTripForDetail(null);
  };

  // Reset Data Handler 3: Reset Drivers & Fleet to 'siaga' only
  const handleResetFleetDriversOnly = () => {
    setDrivers((prev) => {
      const updated = prev.map((d) => {
        const mod: DriverMaster = { ...d, status: 'siaga' };
        saveDriverCloud(mod);
        return mod;
      });
      saveDrivers(updated);
      return updated;
    });
    updateActiveFleetAndList((prev) => ({ ...prev, status: 'siaga' }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-red-600 selection:text-white">
      {/* Android Top App Bar */}
      <AndroidHeader
        onQuickEmergency={() => setShowEmergencyHotline(true)}
        onNavigateToInput={() => setActiveTab('input')}
        onNavigateToPersonal={() => setActiveTab('personal')}
        activeTripsCount={activeTripsCount}
        pendingTripsCount={pendingTripsCount}
        fleetPlatNomor={fleet.platNomor}
        isAuthenticated={authSession.isAuthenticated}
      />

      {/* Main Screen Container (High Density Android Layout) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-2.5 sm:px-4 pt-2.5">
        {activeTab === 'live' && (
          <LiveOperationsTab
            trips={trips}
            drivers={drivers}
            relawan={relawan}
            fleet={fleet}
            onUpdateTripStatus={handleUpdateTripStatus}
            onSelectTrip={(trip) => setSelectedTripForDetail(trip)}
            onNavigateToInput={() => setActiveTab('input')}
            onQuickCallDriver={handleQuickCall}
          />
        )}

        {activeTab === 'input' && (
          <NewTripFormTab
            drivers={drivers}
            relawan={relawan}
            fleet={fleet}
            tariffConfig={tariffConfig}
            onSubmitNewTrip={handleAddNewTrip}
            onCancel={() => setActiveTab('live')}
          />
        )}

        {activeTab === 'history' && (
          <TripHistoryTab
            trips={trips}
            onSelectTrip={(trip) => setSelectedTripForDetail(trip)}
            onPrintSuratJalan={handlePrintSuratJalan}
            onPrintKuitansi={handlePrintKuitansi}
            onShareWhatsApp={handleShareWhatsAppTrip}
            onDeleteTrip={handleDeleteSingleTrip}
            onNavigateToInput={() => setActiveTab('input')}
            isAuthenticated={authSession.isAuthenticated}
            isPengurus={authSession.isAuthenticated && authSession.user?.role === 'pengurus'}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportTab
            trips={trips}
            onExportMonthlyReportPrint={handleExportMonthlyReportPrint}
            onShareMonthlyWhatsApp={handleShareMonthlyWhatsApp}
            authSession={authSession}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigateHome={() => setActiveTab('live')}
          />
        )}

        {activeTab === 'personal' && (
          <PersonalTab
            authSession={authSession}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onChangePassword={handleChangePassword}
            drivers={drivers}
            relawan={relawan}
            fleet={fleet}
            fleets={fleets}
            callCenters={callCenters}
            tariffConfig={tariffConfig}
            trips={trips}
            onUpdateDriverStatus={handleUpdateDriverStatus}
            onAddDriver={handleAddDriver}
            onUpdateDriver={handleUpdateDriver}
            onDeleteDriver={handleDeleteDriver}
            onAddRelawan={handleAddRelawan}
            onUpdateRelawan={handleUpdateRelawan}
            onDeleteRelawan={handleDeleteRelawan}
            onAddCallCenter={handleAddCallCenter}
            onUpdateCallCenter={handleUpdateCallCenter}
            onDeleteCallCenter={handleDeleteCallCenter}
            onUpdateTariffConfig={handleUpdateTariffConfig}
            onUpdateFleet={handleUpdateFleet}
            onAddFleet={handleAddFleet}
            onDeleteFleet={handleDeleteFleet}
            onQuickCall={handleQuickCall}
            onDeleteTrip={handleDeleteSingleTrip}
            onSelectTrip={(trip) => setSelectedTripForDetail(trip)}
            onClearAllTrips={handleClearAllTrips}
            onResetToDefault={handleResetToDefault}
            onResetFleetDriversOnly={handleResetFleetDriversOnly}
            onOpenResetModal={() => setShowResetModal(true)}
          />
        )}

        {/* Footer Identity & Status Helper */}
        <div className="text-center py-5 text-[11px] text-slate-500 space-y-1 mb-16">
          <p className="font-medium text-slate-600">
            Sistem Operasional Ambulance Warga Perumahan Bumi Pesona Asri
            Rancaekek
          </p>
          <p className="text-[10px] text-slate-400">
            Dikelola oleh Forum Komunikasi Warga (FKW-BPA) Kab. Bandung
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('input')}
              className="inline-flex items-center text-[10px] text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-xs cursor-pointer transition-colors font-semibold"
            >
              <Plus className="w-3 h-3 mr-1" />
              + Input Data Baru
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`inline-flex items-center text-[10px] px-2.5 py-1 rounded-md border shadow-xs cursor-pointer transition-colors font-semibold ${
                authSession.isAuthenticated
                  ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                  : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
              }`}
            >
              {authSession.isAuthenticated ? (
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              ) : (
                <Lock className="w-3 h-3 mr-1 text-slate-500" />
              )}
              {authSession.isAuthenticated
                ? 'Fitur Personal (Aktif)'
                : 'Login Personal'}
            </button>
          </div>
        </div>
      </main>

      {/* Android Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        activeTripsCount={activeTripsCount}
        pendingTripsCount={pendingTripsCount}
        isAuthenticated={authSession.isAuthenticated}
      />

      {/* Modal: Trip Details & Live Updater */}
      {selectedTripForDetail && (
        <TripDetailModal
          trip={selectedTripForDetail}
          onClose={() => setSelectedTripForDetail(null)}
          onUpdateStatus={handleUpdateTripStatus}
          onPrintSuratJalan={handlePrintSuratJalan}
          onPrintKuitansi={handlePrintKuitansi}
          onShareWhatsApp={handleShareWhatsAppTrip}
          onQuickCall={handleQuickCall}
          onDeleteTrip={handleDeleteSingleTrip}
          isAuthenticated={authSession.isAuthenticated}
        />
      )}

      {/* Modal: Data Reset & Management */}
      <DataResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onClearAllTrips={handleClearAllTrips}
        onResetToDefault={handleResetToDefault}
        onResetFleetDriversOnly={handleResetFleetDriversOnly}
        totalTripsCount={trips.length}
      />

      {/* Modal: Print Official Document */}
      {printModalConfig.isOpen && (
        <PrintDocumentModal
          docType={printModalConfig.docType}
          trip={printModalConfig.trip}
          monthLabel={printModalConfig.monthLabel}
          monthlyTrips={printModalConfig.monthlyTrips}
          fleet={fleet}
          onClose={() =>
            setPrintModalConfig({ isOpen: false, docType: 'surat_jalan' })
          }
        />
      )}

      {/* Modal: Emergency Call Hotline */}
      {showEmergencyHotline && (
        <EmergencyHotlineModal
          drivers={drivers}
          relawan={relawan}
          callCenters={callCenters}
          onClose={() => setShowEmergencyHotline(false)}
          onQuickCall={handleQuickCall}
        />
      )}

      {/* Floating Auto-WhatsApp Dispatch Toast */}
      {autoWaPayload && (
        <AutoWhatsAppNotificationToast
          payload={autoWaPayload}
          onClose={() => setAutoWaPayload(null)}
        />
      )}
    </div>
  );
}
