export type HorseCategory = 'PoneyA' | 'PoneyB' | 'PoneyC' | 'PoneyD' | 'Cheval';

export interface Horse {
  id: string;
  name: string;
  category: HorseCategory;
  strideLength: number; // foulée par défaut, en mètres
  notes?: string;
}

export type ObstacleType = 'Vertical' | 'Oxer';

export type Terrain = 'Plat' | 'Montant' | 'Descendant' | 'Lourd';

export type SpeedLevel = 'Standard' | 'Elite';

export interface RiderProfile {
  stepLength: number; // longueur de pas du cavalier, en mètres
}

export interface EnvironmentAdjustments {
  terrain: Terrain;
  speed: SpeedLevel;
}

export interface StrideResult {
  distanceMeters: number;
  strideLength: number;
  fixedAllowance: number;
  theoreticalStrides: number; // valeur décimale
  suggestedStrides: number; // arrondi à l'entier le plus proche
}

export interface CombinationResult {
  distanceMeters: number;
  strideLength: number;
  fixedAllowance: number;
}

export type ChecklistCategory = 'horse' | 'rider' | 'papers';

export interface ChecklistItemDefinition {
  id: string;
  category: ChecklistCategory;
}
