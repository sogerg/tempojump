import * as Localization from 'expo-localization';
import i18n from '../i18n';

export type UnitSystem = 'metric' | 'imperial';

/**
 * Un nombre dans la langue de l'utilisateur. ⚠️ Jamais `toFixed` pour afficher : il écrit
 * toujours un point décimal, faux en français et dans la majorité des 25 langues — défaut déjà
 * payé sur quatre apps du portefeuille, trouvé ici par le balayage du 20/09/2026.
 * `Intl.NumberFormat` fonctionne sous Hermes ; le repli ne sert que si la langue est inconnue.
 */
export function formatNumber(value: number, decimals: number): string {
  try {
    return new Intl.NumberFormat(i18n.language || 'en', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);  // audit-ok: repli si la langue est inconnue, le point decimal est le moindre mal
  }
}

/** Déduit le système d'unités par défaut à partir de la région de l'appareil. */
export function detectDeviceUnitSystem(): UnitSystem {
  const measurementSystem = Localization.getLocales()[0]?.measurementSystem;
  return measurementSystem === 'metric' || measurementSystem === null ? 'metric' : 'imperial';
}

const METERS_PER_FOOT = 0.3048;
const INCHES_PER_METER = 39.3700787;

/** Convertit une valeur saisie par l'utilisateur (dans son système d'unités) en mètres. */
export function toMeters(value: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? value * METERS_PER_FOOT : value;
}

/** Convertit des mètres vers la valeur à afficher dans le champ de saisie (m ou ft décimal). */
export function fromMeters(meters: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? meters / METERS_PER_FOOT : meters;
}

export function inputUnitSuffix(unitSystem: UnitSystem): string {
  return unitSystem === 'imperial' ? 'ft' : 'm';
}

/** Formate une longueur en mètres pour l'affichage, dans le système d'unités choisi. */
export function formatLength(meters: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    if (Math.abs(meters) < 1) return `${formatNumber(meters * 100, 0)} cm`;
    return `${formatNumber(meters, 2)} m`;
  }

  const totalInches = meters * INCHES_PER_METER;
  const feet = Math.trunc(totalInches / 12);
  const inches = Math.abs(totalInches - feet * 12);
  if (feet === 0) return `${formatNumber(totalInches, 1)} in`;
  return `${feet} ft ${formatNumber(inches, 1)} in`;
}

const YARDS_PER_METER = 1.0936133;

/** Convertit une vitesse saisie par l'utilisateur (dans son système d'unités) en m/min. */
export function speedToMetersPerMinute(value: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? value / YARDS_PER_METER : value;
}

/** Convertit une vitesse en m/min vers la valeur à afficher (m/min ou yd/min). */
export function speedFromMetersPerMinute(metersPerMinute: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? metersPerMinute * YARDS_PER_METER : metersPerMinute;
}

export function speedUnitSuffix(unitSystem: UnitSystem): string {
  return unitSystem === 'imperial' ? 'yd/min' : 'm/min';
}

/** Formate une vitesse (m/min) pour affichage, arrondie à l'entier, avec son unité. */
export function formatSpeed(metersPerMinute: number, unitSystem: UnitSystem): string {
  const value = Math.round(speedFromMetersPerMinute(metersPerMinute, unitSystem));
  return `${value} ${speedUnitSuffix(unitSystem)}`;
}
