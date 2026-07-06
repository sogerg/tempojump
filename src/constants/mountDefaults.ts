import { MountCategory, ObstacleType, Terrain, SpeedLevel } from '../types';

export const CATEGORY_LABELS: Record<MountCategory, string> = {
  PoneyD: 'Poney D',
  PoneyC: 'Poney C',
  PoneyB: 'Poney B',
  PoneyA: 'Poney A',
  Cheval: 'Cheval',
};

export const CATEGORY_ORDER: MountCategory[] = ['PoneyD', 'PoneyC', 'PoneyB', 'PoneyA', 'Cheval'];

// Foulée par défaut (m), vitesse standard, terrain plat.
export const DEFAULT_STRIDE_LENGTH: Record<MountCategory, number> = {
  PoneyD: 3.0,
  PoneyC: 3.2,
  PoneyB: 3.35,
  PoneyA: 3.5,
  Cheval: 3.6,
};

// Allocation fixe réception + impulsion (m), utilisée pour convertir une distance
// en nombre de foulées : distance = allocationFixe + (nbFoulées - 1) * foulée.
export const DEFAULT_FIXED_ALLOWANCE: Record<MountCategory, number> = {
  PoneyD: 2.4,
  PoneyC: 2.8,
  PoneyB: 3.2,
  PoneyA: 3.4,
  Cheval: 3.6,
};

export const DEFAULT_RIDER_STEP_LENGTH = 0.75; // m, valeur de départ avant étalonnage

// Ajustement de la foulée (m) selon le terrain, appliqué à la foulée de base.
export const TERRAIN_ADJUSTMENT: Record<Terrain, number> = {
  Plat: 0,
  Montant: -0.1,
  Descendant: 0.1,
  Lourd: -0.15,
};

export const TERRAIN_LABELS: Record<Terrain, string> = {
  Plat: 'Plat',
  Montant: 'Pente montante',
  Descendant: 'Pente descendante',
  Lourd: 'Terrain lourd / boueux',
};

// Ajustement de la foulée (m) selon la vitesse imposée.
export const SPEED_ADJUSTMENT: Record<SpeedLevel, number> = {
  Standard: 0,
  Elite: 0.15,
};

export const SPEED_LABELS: Record<SpeedLevel, string> = {
  Standard: 'Standard (~350 m/min)',
  Elite: 'Élite / Barrage (~375 m/min+)',
};

// Ajustement (m) de l'allocation fixe selon l'enchaînement des obstacles d'une
// combinaison : un oxer nécessite plus de terrain à la réception et à l'appel.
export const COMBINATION_ADJUSTMENT: Record<string, number> = {
  'Vertical-Vertical': 0,
  'Vertical-Oxer': 0.15,
  'Oxer-Vertical': 0.25,
  'Oxer-Oxer': 0.35,
};

export const OBSTACLE_TYPES: ObstacleType[] = ['Vertical', 'Oxer'];

export function combinationKey(from: ObstacleType, to: ObstacleType): string {
  return `${from}-${to}`;
}

// Ajustement (m) de l'allocation fixe par tranche de hauteur au-delà de 1,10 m.
export const HEIGHT_ADJUSTMENT_STEP = 0.02; // m ajoutés par tranche de 10 cm
export const HEIGHT_ADJUSTMENT_THRESHOLD = 1.1; // m, hauteur de référence sans ajustement
