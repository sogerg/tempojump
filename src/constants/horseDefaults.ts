import { ObstacleType, Terrain, SpeedLevel } from '../types';

export const DEFAULT_WITHERS_HEIGHT = 160; // cm, taille au garrot par défaut à la création d'une monture

export const DEFAULT_RIDER_STEP_LENGTH = 0.75; // m, valeur de départ avant étalonnage

// Vitesse (m/min) associée à chaque niveau, utilisée dans le calcul de l'amplitude réelle.
export const SPEED_METERS_PER_MINUTE: Record<SpeedLevel, number> = {
  Standard: 350,
  Elite: 375,
};

/** Amplitude naturelle (m) au galop selon la taille au garrot. */
export function naturalAmplitudeForWithersHeight(withersHeight: number): number {
  return withersHeight * 0.016 + 0.95;
}

/** Vitesse naturelle (m/min) associée à l'amplitude naturelle, selon la taille au garrot. */
export function naturalSpeedForWithersHeight(withersHeight: number): number {
  return withersHeight * 1.5 + 110;
}

// Ajustement de la foulée (m) selon le terrain, appliqué à l'amplitude calculée.
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

export const SPEED_LABELS: Record<SpeedLevel, string> = {
  Standard: 'Standard (~350 m/min)',
  Elite: 'Élite / Barrage (~375 m/min+)',
};

// Ratio amplitude "sur le plat" / amplitude "à l'obstacle", pour les exercices de
// barres au sol et cavalettis.
export const EXERCISE_AMPLITUDE_RATIO = 0.857;

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

// Nombre de foulées proposées par défaut dans le tableau de contrat de foulées (module Exercices).
export const EXERCISE_STRIDE_RANGE = [0, 1, 2, 3, 4, 5, 6];
