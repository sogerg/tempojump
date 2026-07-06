import {
  COMBINATION_ADJUSTMENT,
  HEIGHT_ADJUSTMENT_STEP,
  HEIGHT_ADJUSTMENT_THRESHOLD,
  SPEED_ADJUSTMENT,
  TERRAIN_ADJUSTMENT,
  combinationKey,
} from '../constants/horseDefaults';
import { CombinationResult, EnvironmentAdjustments, Horse, ObstacleType, StrideResult } from '../types';

/** Foulée effective d'une monture une fois le terrain et la vitesse pris en compte. */
export function effectiveStrideLength(horse: Horse, env: EnvironmentAdjustments): number {
  return horse.strideLength + TERRAIN_ADJUSTMENT[env.terrain] + SPEED_ADJUSTMENT[env.speed];
}

/**
 * Convertit un nombre de pas humains en distance puis en foulées théoriques.
 * distance = nbPas * longueurPasCavalier
 * foulées  = (distance - allocationFixe) / foulée + 1
 */
export function stepsToStrides(
  humanSteps: number,
  riderStepLength: number,
  horse: Horse,
  fixedAllowance: number,
  env: EnvironmentAdjustments
): StrideResult {
  const distanceMeters = humanSteps * riderStepLength;
  const strideLength = effectiveStrideLength(horse, env);
  const theoreticalStrides = (distanceMeters - fixedAllowance) / strideLength + 1;

  return {
    distanceMeters,
    strideLength,
    fixedAllowance,
    theoreticalStrides,
    suggestedStrides: Math.max(0, Math.round(theoreticalStrides)),
  };
}

/**
 * Calcule la distance exacte (m) à poser pour obtenir un nombre de foulées donné
 * dans une combinaison ou une ligne d'exercice, en tenant compte du type
 * d'obstacles et de leur hauteur.
 */
export function combinationDistance(
  targetStrides: number,
  from: ObstacleType,
  to: ObstacleType,
  heightMeters: number,
  horse: Horse,
  fixedAllowance: number,
  env: EnvironmentAdjustments
): CombinationResult {
  const strideLength = effectiveStrideLength(horse, env);

  const combinationBonus = COMBINATION_ADJUSTMENT[combinationKey(from, to)] ?? 0;
  const heightSteps = Math.max(0, heightMeters - HEIGHT_ADJUSTMENT_THRESHOLD) / 0.1;
  const heightBonus = heightSteps * HEIGHT_ADJUSTMENT_STEP;

  const adjustedFixedAllowance = fixedAllowance + combinationBonus + heightBonus;
  const distanceMeters =
    targetStrides <= 0
      ? adjustedFixedAllowance
      : adjustedFixedAllowance + (targetStrides - 1) * strideLength;

  return {
    distanceMeters,
    strideLength,
    fixedAllowance: adjustedFixedAllowance,
  };
}

/** Calibre la longueur de pas du cavalier à partir d'une distance mesurée sur N pas. */
export function calibrateStepLength(distanceMeters: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  return distanceMeters / stepCount;
}

/** Temps accordé (secondes) pour un parcours, à partir de sa longueur et de la vitesse imposée. */
export function allowedTime(courseLengthMeters: number, speedMetersPerMinute: number): number {
  if (speedMetersPerMinute <= 0) return 0;
  return (courseLengthMeters / speedMetersPerMinute) * 60;
}

/** Cadence du galop (foulées/minute) à une vitesse donnée, pour une longueur de foulée donnée. */
export function canterCadence(speedMetersPerMinute: number, strideLength: number): number {
  if (strideLength <= 0) return 0;
  return speedMetersPerMinute / strideLength;
}

/** Écart entre les foulées réalisées en piste et les foulées théoriques prévues à la reconnaissance. */
export function strideDelta(theoreticalStrides: number, actualStrides: number): number {
  return actualStrides - theoreticalStrides;
}
