// types/eggs.ts — Egg Log module types

export interface Hen {
  id: string;
  name: string;
  breed: string;
  age: string | number;
  color: string;
  createdAt: number;
}

export interface EggLog {
  id: string;
  henId: string;
  henName: string;
  weight: number;    // grams
  quantity: number;  // number of eggs
  timestamp: number;
}

export enum ExpenseCategory {
  FEED      = '饲料',
  MEDS      = '药品',
  EQUIPMENT = '设备',
  OTHERS    = '其他',
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  timestamp: number;
}

export enum EggsView {
  HOME       = 'home',
  STATISTICS = 'statistics',
  FINANCE    = 'finance',
  HENS       = 'hens',
  GUIDE      = 'guide',
}

export interface Recipe {
  recipeName: string;
  eggsNeeded: number;
  steps: string[];
  whyChloeLikes: string;
  secret: string;
}
