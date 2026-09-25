import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
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

// Initialize Firestore with forced long-polling to prevent WebSocket/streaming connection drops in browser iframe environments
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    customDbId
  );
} catch {
  firestoreInstance = customDbId
    ? getFirestore(app, customDbId)
    : getFirestore(app);
}

export const db = firestoreInstance;

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

// Sanitize object for Firestore (remove undefined values to prevent Firestore errors)
function sanitizeDoc<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = sanitizeDoc(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result as T;
}

// Initial Cloud Seed Check
let isSeeding = false;
export async function initializeFirestoreData(): Promise<void> {
  if (isSeeding) return;
  try {
    const metaRef = doc(db, SETTINGS_COL, META_DOC);
    const metaSnap = await getDoc(metaRef);

    if (!metaSnap.exists() || !metaSnap.data()?.isInitialized) {
      isSeeding = true;
      console.log('Bootstrapping initial operational data to Firestore...');
      const batch = writeBatch(db);

      // Seed Fleets
      const initialFleetList: FleetVehicle[] = [
        { ...INITIAL_FLEET, id: 'fleet-01', isUtama: true },
      ];
      for (const f of initialFleetList) {
        const id = f.id || 'fleet-01';
        batch.set(doc(db, FLEETS_COL, id), sanitizeDoc(f));
      }

      // Seed Drivers
      for (const d of INITIAL_DRIVERS) {
        batch.set(doc(db, DRIVERS_COL, d.id), sanitizeDoc(d));
      }

      // Seed Relawan
      for (const r of INITIAL_RELAWAN) {
        batch.set(doc(db, RELAWAN_COL, r.id), sanitizeDoc(r));
      }

      // Seed Call Centers
      for (const c of INITIAL_CALL_CENTERS) {
        batch.set(doc(db, CALL_CENTERS_COL, c.id), sanitizeDoc(c));
      }

      // Seed Trips
      for (const t of INITIAL_TRIPS) {
        batch.set(doc(db, TRIPS_COL, t.id), sanitizeDoc(t));
      }

      // Seed Tariff
      batch.set(doc(db, SETTINGS_COL, 'tariff'), sanitizeDoc(INITIAL_TARIFF_CONFIG));

      // Mark Initialized
      batch.set(metaRef, {
        isInitialized: true,
        initializedAt: new Date().toISOString(),
        version: '1.0.0',
      });

      await batch.commit();
      console.log('Initial Firestore data bootstrapped successfully.');
    }
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
        list.push(d.data() as FleetVehicle);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Fleets', err)
  );
}

export async function saveFleetCloud(fleet: FleetVehicle): Promise<void> {
  try {
    const id = fleet.id || `fleet-${Date.now()}`;
    const clean = sanitizeDoc({ ...fleet, id });
    await setDoc(doc(db, FLEETS_COL, id), clean);
  } catch (err) {
    console.error('Error saving fleet to Firestore:', err);
  }
}

export async function deleteFleetCloud(fleetId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FLEETS_COL, fleetId));
  } catch (err) {
    console.error('Error deleting fleet from Firestore:', err);
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
        list.push(d.data() as DriverMaster);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Drivers', err)
  );
}

export async function saveDriverCloud(driver: DriverMaster): Promise<void> {
  try {
    const id = driver.id || `drv-${Date.now()}`;
    const clean = sanitizeDoc({ ...driver, id });
    await setDoc(doc(db, DRIVERS_COL, id), clean);
  } catch (err) {
    console.error('Error saving driver to Firestore:', err);
  }
}

export async function deleteDriverCloud(driverId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, DRIVERS_COL, driverId));
  } catch (err) {
    console.error('Error deleting driver from Firestore:', err);
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
        list.push(d.data() as RelawanMaster);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Relawan', err)
  );
}

export async function saveRelawanCloud(relawan: RelawanMaster): Promise<void> {
  try {
    const id = relawan.id || `rel-${Date.now()}`;
    const clean = sanitizeDoc({ ...relawan, id });
    await setDoc(doc(db, RELAWAN_COL, id), clean);
  } catch (err) {
    console.error('Error saving relawan to Firestore:', err);
  }
}

export async function deleteRelawanCloud(relawanId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RELAWAN_COL, relawanId));
  } catch (err) {
    console.error('Error deleting relawan from Firestore:', err);
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
        list.push(d.data() as CallCenterContact);
      });
      callback(list);
    },
    (err) => handleSnapshotError('Call centers', err)
  );
}

export async function saveCallCenterCloud(contact: CallCenterContact): Promise<void> {
  try {
    const id = contact.id || `cc-${Date.now()}`;
    const clean = sanitizeDoc({ ...contact, id });
    await setDoc(doc(db, CALL_CENTERS_COL, id), clean);
  } catch (err) {
    console.error('Error saving call center contact to Firestore:', err);
  }
}

export async function deleteCallCenterCloud(contactId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CALL_CENTERS_COL, contactId));
  } catch (err) {
    console.error('Error deleting call center contact from Firestore:', err);
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
        list.push(d.data() as AmbulanceTrip);
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

export async function saveTripCloud(trip: AmbulanceTrip): Promise<void> {
  try {
    const id = trip.id || `trip-${Date.now()}`;
    const clean = sanitizeDoc({ ...trip, id });
    await setDoc(doc(db, TRIPS_COL, id), clean);
  } catch (err) {
    console.error('Error saving trip to Firestore:', err);
  }
}

export async function deleteTripCloud(tripId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TRIPS_COL, tripId));
  } catch (err) {
    console.error('Error deleting trip from Firestore:', err);
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

export async function saveTariffCloud(tariff: TariffConfig): Promise<void> {
  try {
    const clean = sanitizeDoc(tariff);
    await setDoc(doc(db, SETTINGS_COL, 'tariff'), clean);
  } catch (err) {
    console.error('Error saving tariff to Firestore:', err);
  }
}

// ---------------- CLOUD RESET & BULK UTILS ----------------
export async function clearAllTripsCloud(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, TRIPS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error clearing trips in Firestore:', err);
  }
}

export async function resetAllDataCloud(): Promise<void> {
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
      batch.set(doc(db, FLEETS_COL, id), sanitizeDoc(f));
    }

    for (const d of INITIAL_DRIVERS) {
      batch.set(doc(db, DRIVERS_COL, d.id), sanitizeDoc(d));
    }

    for (const r of INITIAL_RELAWAN) {
      batch.set(doc(db, RELAWAN_COL, r.id), sanitizeDoc(r));
    }

    for (const c of INITIAL_CALL_CENTERS) {
      batch.set(doc(db, CALL_CENTERS_COL, c.id), sanitizeDoc(c));
    }

    for (const t of INITIAL_TRIPS) {
      batch.set(doc(db, TRIPS_COL, t.id), sanitizeDoc(t));
    }

    batch.set(doc(db, SETTINGS_COL, 'tariff'), sanitizeDoc(INITIAL_TARIFF_CONFIG));

    await batch.commit();
    console.log('Cloud reset completed.');
  } catch (err) {
    console.error('Error resetting Firestore data:', err);
  }
}
