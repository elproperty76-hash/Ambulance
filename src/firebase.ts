import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AmbulanceTrip,
  DriverMaster,
  RelawanMaster,
  FleetVehicle,
  CallCenterContact,
  TariffConfig,
} from './types';
import {
  INITIAL_TRIPS,
  INITIAL_DRIVERS,
  INITIAL_RELAWAN,
  INITIAL_FLEET,
  INITIAL_CALL_CENTERS,
  INITIAL_TARIFF_CONFIG,
} from './data/mockData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const customDbId =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

// Initialize Firestore Instance strictly configured with database ID
export const db = customDbId
  ? getFirestore(app, customDbId)
  : getFirestore(app);

// Collection References
const FLEETS_COL = 'fleets';
const DRIVERS_COL = 'drivers';
const RELAWAN_COL = 'relawan';
const CALL_CENTERS_COL = 'call_centers';
const TRIPS_COL = 'trips';
const SETTINGS_COL = 'settings';
const META_DOC = 'system_meta';

// Helper for snapshot errors
const handleSnapshotError = (entityName: string, err: any) => {
  if (err?.code === 'unavailable') {
    // Expected transient status while reconnecting; SDK operates in offline mode
    return;
  }
  console.warn(`${entityName} snapshot notice:`, err);
};

// Deep, recursive sanitizer for Firestore (converts undefined to null, handles nested objects & arrays)
export function sanitizePayload<T>(input: T): T {
  if (input === undefined) {
    return null as any;
  }
  if (input === null) {
    return null as any;
  }
  if (input instanceof Date) {
    return input.toISOString() as any;
  }
  if (Array.isArray(input)) {
    return input
      .map((item) => sanitizePayload(item))
      .filter((item) => item !== undefined) as any;
  }
  if (typeof input === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        sanitized[key] = sanitizePayload(value);
      }
    }
    return sanitized as any;
  }
  return input;
}

// Initial Cloud Seed Check
let isSeeding = false;
export async function initializeFirestoreData(): Promise<void> {
  if (isSeeding) return;
  try {
    const metaRef = doc(db, SETTINGS_COL, META_DOC);
    const metaSnap = await getDoc(metaRef);

    // If metadata already indicates initialized, check if any collection is completely missing before seeding
    if (metaSnap.exists() && metaSnap.data()?.isInitialized) {
      return;
    }

    // Check if data already exists in collections to prevent overwriting user data
    const [fleetsSnap, driversSnap, tripsSnap] = await Promise.all([
      getDocs(collection(db, FLEETS_COL)),
      getDocs(collection(db, DRIVERS_COL)),
      getDocs(collection(db, TRIPS_COL)),
    ]);

    if (fleetsSnap.size > 0 || driversSnap.size > 0 || tripsSnap.size > 0) {
      // Collections already have data, just mark metadata
      await setDoc(metaRef, {
        isInitialized: true,
        initializedAt: new Date().toISOString(),
        version: '1.0.0',
      });
      return;
    }

    isSeeding = true;
    console.log('Bootstrapping initial operational data to Firestore...');
    const batch = writeBatch(db);

    // Seed Fleets
    const initialFleetList: FleetVehicle[] = [
      { ...INITIAL_FLEET, id: 'fleet-01', isUtama: true },
    ];
    for (const f of initialFleetList) {
      const id = f.id || 'fleet-01';
      batch.set(doc(db, FLEETS_COL, id), sanitizePayload(f));
    }

    // Seed Drivers
    for (const d of INITIAL_DRIVERS) {
      batch.set(doc(db, DRIVERS_COL, d.id), sanitizePayload(d));
    }

    // Seed Relawan
    for (const r of INITIAL_RELAWAN) {
      batch.set(doc(db, RELAWAN_COL, r.id), sanitizePayload(r));
    }

    // Seed Call Centers
    for (const c of INITIAL_CALL_CENTERS) {
      batch.set(doc(db, CALL_CENTERS_COL, c.id), sanitizePayload(c));
    }

    // Seed Trips
    for (const t of INITIAL_TRIPS) {
      batch.set(doc(db, TRIPS_COL, t.id), sanitizePayload(t));
    }

    // Seed Tariff
    batch.set(doc(db, SETTINGS_COL, 'tariff'), sanitizePayload(INITIAL_TARIFF_CONFIG));

    // Mark Initialized
    batch.set(metaRef, {
      isInitialized: true,
      initializedAt: new Date().toISOString(),
      version: '1.0.0',
    });

    await batch.commit();
    console.log('Initial Firestore data bootstrapped successfully.');
  } catch (err) {
    console.warn('Firestore initialization notice:', err);
  } finally {
    isSeeding = false;
  }
}

// ---------------- FLEETS SYNC ----------------
export function subscribeFleets(callback: (fleets: FleetVehicle[]) => void): () => void {
  const colRef = collection(db, FLEETS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: FleetVehicle[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as FleetVehicle);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Fleets', err)
  );
}

export async function saveFleetCloud(fleet: FleetVehicle): Promise<boolean> {
  try {
    const id = fleet.id || `fleet-${Date.now()}`;
    const clean = sanitizePayload({ ...fleet, id });
    await setDoc(doc(db, FLEETS_COL, id), clean);
    return true;
  } catch (err) {
    console.error('Error saving fleet to Firestore:', err);
    return false;
  }
}

export async function deleteFleetCloud(fleetId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, FLEETS_COL, fleetId));
    return true;
  } catch (err) {
    console.error('Error deleting fleet from Firestore:', err);
    return false;
  }
}

// ---------------- DRIVERS SYNC ----------------
export function subscribeDrivers(callback: (drivers: DriverMaster[]) => void): () => void {
  const colRef = collection(db, DRIVERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: DriverMaster[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as DriverMaster);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Drivers', err)
  );
}

export async function saveDriverCloud(driver: DriverMaster): Promise<boolean> {
  try {
    const id = driver.id || `drv-${Date.now()}`;
    const clean = sanitizePayload({ ...driver, id });
    await setDoc(doc(db, DRIVERS_COL, id), clean);
    return true;
  } catch (err) {
    console.error('Error saving driver to Firestore:', err);
    return false;
  }
}

export async function deleteDriverCloud(driverId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, DRIVERS_COL, driverId));
    return true;
  } catch (err) {
    console.error('Error deleting driver from Firestore:', err);
    return false;
  }
}

// ---------------- RELAWAN SYNC ----------------
export function subscribeRelawan(callback: (relawan: RelawanMaster[]) => void): () => void {
  const colRef = collection(db, RELAWAN_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: RelawanMaster[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as RelawanMaster);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Relawan', err)
  );
}

export async function saveRelawanCloud(relawan: RelawanMaster): Promise<boolean> {
  try {
    const id = relawan.id || `rel-${Date.now()}`;
    const clean = sanitizePayload({ ...relawan, id });
    await setDoc(doc(db, RELAWAN_COL, id), clean);
    return true;
  } catch (err) {
    console.error('Error saving relawan to Firestore:', err);
    return false;
  }
}

export async function deleteRelawanCloud(relawanId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, RELAWAN_COL, relawanId));
    return true;
  } catch (err) {
    console.error('Error deleting relawan from Firestore:', err);
    return false;
  }
}

// ---------------- CALL CENTER SYNC ----------------
export function subscribeCallCenters(callback: (contacts: CallCenterContact[]) => void): () => void {
  const colRef = collection(db, CALL_CENTERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: CallCenterContact[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as CallCenterContact);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Call centers', err)
  );
}

export async function saveCallCenterCloud(contact: CallCenterContact): Promise<boolean> {
  try {
    const id = contact.id || `cc-${Date.now()}`;
    const clean = sanitizePayload({ ...contact, id });
    await setDoc(doc(db, CALL_CENTERS_COL, id), clean);
    return true;
  } catch (err) {
    console.error('Error saving call center contact to Firestore:', err);
    return false;
  }
}

export async function deleteCallCenterCloud(contactId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, CALL_CENTERS_COL, contactId));
    return true;
  } catch (err) {
    console.error('Error deleting call center contact from Firestore:', err);
    return false;
  }
}

// ---------------- TRIPS SYNC ----------------
export function subscribeTrips(callback: (trips: AmbulanceTrip[]) => void): () => void {
  const colRef = collection(db, TRIPS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: AmbulanceTrip[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as AmbulanceTrip);
      });
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.requestDate).getTime();
        const timeB = new Date(b.createdAt || b.requestDate).getTime();
        return timeB - timeA;
      });
      callback(list);
    },
    (err) => handleSnapshotError('Trips', err)
  );
}

export async function saveTripCloud(trip: AmbulanceTrip): Promise<boolean> {
  try {
    const id = trip.id || `trip-${Date.now()}`;
    const clean = sanitizePayload({ ...trip, id });
    await setDoc(doc(db, TRIPS_COL, id), clean);
    return true;
  } catch (err) {
    console.error('Error saving trip to Firestore:', err);
    return false;
  }
}

export async function deleteTripCloud(tripId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, TRIPS_COL, tripId));
    return true;
  } catch (err) {
    console.error('Error deleting trip from Firestore:', err);
    return false;
  }
}

// ---------------- TARIFF SYNC ----------------
export function subscribeTariff(callback: (tariff: TariffConfig) => void): () => void {
  const docRef = doc(db, SETTINGS_COL, 'tariff');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...INITIAL_TARIFF_CONFIG, ...snapshot.data() } as TariffConfig);
      }
    },
    (err) => handleSnapshotError('Tariff', err)
  );
}

export async function saveTariffCloud(tariff: TariffConfig): Promise<boolean> {
  try {
    const clean = sanitizePayload(tariff);
    await setDoc(doc(db, SETTINGS_COL, 'tariff'), clean);
    return true;
  } catch (err) {
    console.error('Error saving tariff to Firestore:', err);
    return false;
  }
}

// ---------------- CLOUD RESET & BULK UTILS ----------------
export async function clearAllTripsCloud(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, TRIPS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Error clearing trips in Firestore:', err);
    return false;
  }
}

export async function resetAllDataCloud(): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    // Delete existing fleets, drivers, relawan, call centers, trips
    const collectionsToClear = [FLEETS_COL, DRIVERS_COL, RELAWAN_COL, CALL_CENTERS_COL, TRIPS_COL];
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
    }

    // Seed defaults
    const initialFleetList: FleetVehicle[] = [
      { ...INITIAL_FLEET, id: 'fleet-01', isUtama: true },
    ];
    for (const f of initialFleetList) {
      const id = f.id || 'fleet-01';
      batch.set(doc(db, FLEETS_COL, id), sanitizePayload(f));
    }

    for (const d of INITIAL_DRIVERS) {
      batch.set(doc(db, DRIVERS_COL, d.id), sanitizePayload(d));
    }

    for (const r of INITIAL_RELAWAN) {
      batch.set(doc(db, RELAWAN_COL, r.id), sanitizePayload(r));
    }

    for (const c of INITIAL_CALL_CENTERS) {
      batch.set(doc(db, CALL_CENTERS_COL, c.id), sanitizePayload(c));
    }

    for (const t of INITIAL_TRIPS) {
      batch.set(doc(db, TRIPS_COL, t.id), sanitizePayload(t));
    }

    batch.set(doc(db, SETTINGS_COL, 'tariff'), sanitizePayload(INITIAL_TARIFF_CONFIG));

    await batch.commit();
    console.log('Cloud reset completed.');
    return true;
  } catch (err) {
    console.error('Error resetting Firestore data:', err);
    return false;
  }
}
