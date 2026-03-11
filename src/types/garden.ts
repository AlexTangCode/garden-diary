// types/garden.ts — Garden module types

export interface Plot {
  id: string;
  name: string;
  color: string;
  note: string;
  image: string | null;
  createdAt: number;
}

export interface Marker {
  id: string;
  plotId: string;
  name: string;
  variety: string;
  x: number;   // 0–1 relative to canvas width
  y: number;   // 0–1 relative to canvas height
  status: MarkerStatus;
  date: string;  // YYYY-MM-DD
  note: string;
  createdAt: number;
}

export type MarkerStatus = '🌱 播种' | '🌿 生长' | '🌼 收获' | '✅ 完成';

export interface HarvestLog {
  id: string;
  plotId: string | null;
  veg: string;
  amount: string;
  date: string;
  note: string;
  createdAt: number;
}

export interface SpendLog {
  id: string;
  plotId: string | null;
  cat: SpendCategory;
  item: string;
  amt: number;
  date: string;
  note: string;
  createdAt: number;
}

export type SpendCategory =
  | '🌱 种子/种苗'
  | '💊 农药/肥料'
  | '🔧 工具/设备'
  | '💧 水电'
  | '📦 其他';

export type GardenPageId = 'map' | 'harvest' | 'spend' | 'stats' | 'markers';
