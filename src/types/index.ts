export type MountCategory = 'PoneyA' | 'PoneyB' | 'PoneyC' | 'PoneyD' | 'Cheval';

export interface MountProfile {
  id: string;
  name: string;
  category: MountCategory;
  strideLength: number; // foulée par défaut, en mètres
  notes?: string;
}

export type ObstacleType = 'Vertical' | 'Oxer';

export type Terrain = 'Plat' | 'Montant' | 'Descendant' | 'Lourd';

export type SpeedLevel = 'Standard' | 'Elite';

export interface RiderProfile {
  stepLength: number; // longueur de pas du cavalier, en mètres
}
