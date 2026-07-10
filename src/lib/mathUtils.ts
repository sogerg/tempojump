import {
  COMBINATION_ADJUSTMENT,
  SPEED_METERS_PER_MINUTE,
  TERRAIN_ADJUSTMENT,
  combinationKey,
  naturalAmplitudeForWithersHeight,
  naturalSpeedForWithersHeight,
} from '../constants/horseDefaults';
import { CombinationResult, EnvironmentAdjustments, Horse, ObstacleType, StrideResult } from '../types';

/**
 * Amplitude réelle d'une monture selon sa taille au garrot, la vitesse et le terrain :
 * amplitude = amplitudeNaturelle(garrot) × (vitesse / vitesseNaturelle(garrot)) + ajustement terrain
 */
export function effectiveStrideLength(horse: Horse, env: EnvironmentAdjustments): number {
  const naturalAmplitude = naturalAmplitudeForWithersHeight(horse.withersHeight);
  const naturalSpeed = naturalSpeedForWithersHeight(horse.withersHeight);
  const speed = SPEED_METERS_PER_MINUTE[env.speed];
  return naturalAmplitude * (speed / naturalSpeed) + TERRAIN_ADJUSTMENT[env.terrain];
}

/**
 * Allocation fixe (appel + réception) entre deux obstacles, selon l'amplitude et
 * la hauteur de l'obstacle :
 * - hauteur < 1,15 m : appel = réception = amplitude / 2 (total = amplitude)
 * - hauteur >= 1,15 m : forfait total = 3 × hauteur (m),
 *                        appel = forfait/2 - 0,15 (le cheval se rapproche pour monter),
 *                        réception = forfait/2 + 0,15 (la parabole s'allonge)
 */
export function fixedAllowanceForHeight(amplitude: number, heightMeters: number): number {
  if (heightMeters >= 1.15) {
    const totalForfait = 3 * heightMeters;
    const appel = totalForfait / 2 - 0.15;
    const reception = totalForfait / 2 + 0.15;
    return appel + reception;
  }
  return amplitude;
}

/**
 * Convertit un nombre de pas humains en distance puis en foulées théoriques.
 * distance = nbPas * longueurPasCavalier
 * foulées  = (distance - allocationFixe) / foulée
 */
export function stepsToStrides(
  humanSteps: number,
  riderStepLength: number,
  horse: Horse,
  heightMeters: number,
  env: EnvironmentAdjustments
): StrideResult {
  const distanceMeters = humanSteps * riderStepLength;
  const strideLength = effectiveStrideLength(horse, env);
  const fixedAllowance = fixedAllowanceForHeight(strideLength, heightMeters);
  const theoreticalStrides = (distanceMeters - fixedAllowance) / strideLength;

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
 * d'obstacles et de leur hauteur. `amplitudeRatio` permet de réduire l'amplitude
 * pour les exercices de barres au sol/cavalettis (amplitude "sur le plat").
 */
export function combinationDistance(
  targetStrides: number,
  from: ObstacleType,
  to: ObstacleType,
  heightMeters: number,
  horse: Horse,
  env: EnvironmentAdjustments,
  amplitudeRatio = 1
): CombinationResult {
  const strideLength = effectiveStrideLength(horse, env) * amplitudeRatio;

  const combinationBonus = COMBINATION_ADJUSTMENT[combinationKey(from, to)] ?? 0;
  const adjustedFixedAllowance = fixedAllowanceForHeight(strideLength, heightMeters) + combinationBonus;
  const distanceMeters = adjustedFixedAllowance + Math.max(0, targetStrides) * strideLength;

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
  return (speedMetersPerMinute / strideLength) * 0.5 + 50;
}
