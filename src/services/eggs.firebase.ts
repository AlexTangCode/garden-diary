/**
 * services/eggs.firebase.ts
 * All Firestore operations for the Egg Log module.
 * Uses the dedicated `eggsDb` instance (eggs Firebase project).
 */

import {
  collection, addDoc, getDocs, deleteDoc, doc,
  updateDoc, query, orderBy, writeBatch, where,
  Timestamp, setDoc, getDoc, increment,
} from 'firebase/firestore';
import { eggsDb } from './firebase';
import type { Hen, EggLog, Expense } from '../types/eggs';

// ── Collection refs ──────────────────────────────────────
const hensRef     = collection(eggsDb, 'hens');
const eggLogsRef  = collection(eggsDb, 'egg_logs');
const expensesRef = collection(eggsDb, 'expenses');
const settingsRef = collection(eggsDb, 'settings');

// ── Settings ─────────────────────────────────────────────
export const getGlobalSettings = async () => {
  const ref = doc(eggsDb, 'settings', 'global_config');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { eggPrice: 1.5, openAiKey: '' };
};

export const updateGlobalSettings = async (data: { eggPrice?: number; openAiKey?: string }) => {
  await setDoc(doc(eggsDb, 'settings', 'global_config'), data, { merge: true });
};

export const getOpenAiKey = async (): Promise<string> => {
  const s = await getGlobalSettings();
  return s.openAiKey || '';
};

export const updateOpenAiKey = async (key: string) => {
  await updateGlobalSettings({ openAiKey: key });
};

// ── Inventory ─────────────────────────────────────────────
export const getEggInventory = async (): Promise<number> => {
  const ref = doc(eggsDb, 'settings', 'inventory');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().count || 0 : 0;
};

export const updateEggInventory = async (count: number) => {
  await setDoc(doc(eggsDb, 'settings', 'inventory'), { count }, { merge: true });
};

export const incrementEggInventory = async (amount: number) => {
  await setDoc(doc(eggsDb, 'settings', 'inventory'), { count: increment(amount) }, { merge: true });
};

export const decrementEggInventory = async (amount: number) => {
  const ref = doc(eggsDb, 'settings', 'inventory');
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data().count : 0;
  await setDoc(ref, { count: Math.max(0, current - amount) }, { merge: true });
};

// ── Hens ─────────────────────────────────────────────────
export const getHens = async (): Promise<Hen[]> => {
  const snap = await getDocs(query(hensRef, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id:        d.id,
      name:      data.name      || 'Unnamed Hen',
      breed:     data.breed     || 'Heritage',
      age:       data.age       || '1',
      color:     data.color     || '#FDF5E6',
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : (data.createdAt || Date.now()),
    };
  });
};

export const addHen = async (data: Omit<Hen, 'id'>) => addDoc(hensRef, data);

export const updateHen = async (
  id: string,
  data: { name: string; age: string | number; color: string; breed: string }
) => {
  if (!id) throw new Error('Missing ID for updateHen');
  await updateDoc(doc(eggsDb, 'hens', id), data);
};

export const deleteHenAndLogs = async (henId: string) => {
  if (!henId) throw new Error('Missing ID for deleteHenAndLogs');
  const batch = writeBatch(eggsDb);
  batch.delete(doc(eggsDb, 'hens', henId));
  const logsSnap = await getDocs(query(eggLogsRef, where('henId', '==', henId)));
  logsSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

// ── Egg Logs ─────────────────────────────────────────────
export const getEggLogs = async (): Promise<EggLog[]> => {
  const snap = await getDocs(query(eggLogsRef, orderBy('timestamp', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id:        d.id,
      henId:     data.henId    || '',
      henName:   data.henName  || 'Unknown Hen',
      weight:    Number(data.weight)   || 0,
      quantity:  Number(data.quantity) || 1,
      timestamp: data.timestamp instanceof Timestamp
        ? data.timestamp.toMillis()
        : (Number(data.timestamp) || Date.now()),
    };
  });
};

export const addEggLog = async (data: Omit<EggLog, 'id'>) => addDoc(eggLogsRef, data);

export const updateEggLogDetailed = async (
  id: string,
  data: { weight: number; quantity: number; timestamp: number }
) => {
  if (!id) throw new Error('Missing ID for updateEggLogDetailed');
  await updateDoc(doc(eggsDb, 'egg_logs', id), {
    weight:    Number(data.weight),
    quantity:  Number(data.quantity),
    timestamp: data.timestamp,
  });
};

export const deleteEggLog = async (id: string) => {
  if (!id) throw new Error('Missing ID for deleteEggLog');
  await deleteDoc(doc(eggsDb, 'egg_logs', id));
};

export const clearAllEggLogs = async () => {
  const snap = await getDocs(eggLogsRef);
  const batch = writeBatch(eggsDb);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

// ── Expenses ─────────────────────────────────────────────
export const getExpenses = async (): Promise<Expense[]> => {
  const snap = await getDocs(query(expensesRef, orderBy('timestamp', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id:        d.id,
      category:  data.category,
      amount:    Number(data.amount) || 0,
      date:      data.date,
      timestamp: data.timestamp || Date.now(),
    };
  });
};

export const addExpense    = async (data: Omit<Expense, 'id'>) => addDoc(expensesRef, data);
export const updateExpense = async (id: string, data: Partial<Omit<Expense, 'id'>>) => {
  if (!id) throw new Error('Missing ID for updateExpense');
  await updateDoc(doc(eggsDb, 'expenses', id), data);
};
export const deleteExpense = async (id: string) => deleteDoc(doc(eggsDb, 'expenses', id));
