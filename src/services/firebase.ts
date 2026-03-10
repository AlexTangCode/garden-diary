import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Plot, Marker, HarvestLog, SpendLog } from '../types';

// ─── REPLACE with your Firebase project config ───────────────
// Get this from: Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Collection helpers ────────────────────────────────────────
const col = (name: string) => collection(db, name);

// ── PLOTS ─────────────────────────────────────────────────────
export const savePlot = (plot: Plot) =>
  setDoc(doc(col('plots'), plot.id), plot);

export const deletePlot = (id: string) =>
  deleteDoc(doc(col('plots'), id));

export const subscribePlots = (cb: (plots: Plot[]) => void) =>
  onSnapshot(query(col('plots'), orderBy('createdAt')), snap => {
    cb(snap.docs.map(d => d.data() as Plot));
  });

// ── MARKERS ───────────────────────────────────────────────────
export const saveMarker = (marker: Marker) =>
  setDoc(doc(col('markers'), marker.id), marker);

export const deleteMarker = (id: string) =>
  deleteDoc(doc(col('markers'), id));

export const subscribeMarkers = (cb: (markers: Marker[]) => void) =>
  onSnapshot(query(col('markers'), orderBy('createdAt')), snap => {
    cb(snap.docs.map(d => d.data() as Marker));
  });

// ── HARVESTS ──────────────────────────────────────────────────
export const saveHarvest = (log: HarvestLog) =>
  setDoc(doc(col('harvests'), log.id), log);

export const deleteHarvest = (id: string) =>
  deleteDoc(doc(col('harvests'), id));

export const subscribeHarvests = (cb: (logs: HarvestLog[]) => void) =>
  onSnapshot(query(col('harvests'), orderBy('createdAt', 'desc')), snap => {
    cb(snap.docs.map(d => d.data() as HarvestLog));
  });

// ── SPENDS ────────────────────────────────────────────────────
export const saveSpend = (log: SpendLog) =>
  setDoc(doc(col('spends'), log.id), log);

export const deleteSpend = (id: string) =>
  deleteDoc(doc(col('spends'), id));

export const subscribeSpends = (cb: (logs: SpendLog[]) => void) =>
  onSnapshot(query(col('spends'), orderBy('createdAt', 'desc')), snap => {
    cb(snap.docs.map(d => d.data() as SpendLog));
  });

// ── ID generator ──────────────────────────────────────────────
export const newId = () =>
  doc(collection(db, '_')).id;

export { Timestamp };
