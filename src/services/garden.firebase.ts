/**
 * services/garden.firebase.ts
 * All Firestore operations for the Garden module.
 * Uses the dedicated `gardenDb` instance (garden Firebase project).
 */

import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, orderBy,
} from 'firebase/firestore';
import { gardenDb } from './firebase';
import type { Plot, Marker, HarvestLog, SpendLog } from '../types/garden';

// ── Helpers ──────────────────────────────────────────────
const col  = (name: string) => collection(gardenDb, name);
export const newId = () => doc(collection(gardenDb, '_')).id;

// ── Plots ─────────────────────────────────────────────────
export const savePlot   = (p: Plot)  => setDoc(doc(col('plots'), p.id), p);
export const deletePlot = (id: string) => deleteDoc(doc(col('plots'), id));

export const subscribePlots = (cb: (plots: Plot[]) => void) =>
  onSnapshot(query(col('plots'), orderBy('createdAt')), snap =>
    cb(snap.docs.map(d => d.data() as Plot))
  );

// ── Markers ───────────────────────────────────────────────
export const saveMarker   = (m: Marker)    => setDoc(doc(col('markers'), m.id), m);
export const deleteMarker = (id: string)   => deleteDoc(doc(col('markers'), id));

export const subscribeMarkers = (cb: (markers: Marker[]) => void) =>
  onSnapshot(query(col('markers'), orderBy('createdAt')), snap =>
    cb(snap.docs.map(d => d.data() as Marker))
  );

// ── Harvests ──────────────────────────────────────────────
export const saveHarvest   = (log: HarvestLog) => setDoc(doc(col('harvests'), log.id), log);
export const deleteHarvest = (id: string)       => deleteDoc(doc(col('harvests'), id));

export const subscribeHarvests = (cb: (logs: HarvestLog[]) => void) =>
  onSnapshot(query(col('harvests'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => d.data() as HarvestLog))
  );

// ── Spends ────────────────────────────────────────────────
export const saveSpend   = (log: SpendLog) => setDoc(doc(col('spends'), log.id), log);
export const deleteSpend = (id: string)    => deleteDoc(doc(col('spends'), id));

export const subscribeSpends = (cb: (logs: SpendLog[]) => void) =>
  onSnapshot(query(col('spends'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => d.data() as SpendLog))
  );
