import {
  allowedTime,
  calibrateStepLength,
  canterCadence,
  combinationDistance,
  effectiveStrideLength,
  fixedAllowanceForHeight,
  stepsToStrides,
} from './mathUtils';
import { naturalAmplitudeForWithersHeight, naturalSpeedForWithersHeight } from '../constants/horseDefaults';
import { EnvironmentAdjustments, Horse } from '../types';

const horse: Horse = { id: 'h1', name: 'Test', withersHeight: 160 };
const envPlatStandard: EnvironmentAdjustments = { terrain: 'Plat', speed: 'Standard' };

describe('naturalAmplitudeForWithersHeight / naturalSpeedForWithersHeight', () => {
  it('applique la formule linéaire attendue', () => {
    expect(naturalAmplitudeForWithersHeight(160)).toBeCloseTo(3.51, 5);
    expect(naturalSpeedForWithersHeight(160)).toBeCloseTo(350, 5);
  });
});

describe('effectiveStrideLength', () => {
  it("vaut l'amplitude naturelle quand la vitesse imposée égale la vitesse naturelle et le terrain est plat", () => {
    expect(effectiveStrideLength(horse, envPlatStandard)).toBeCloseTo(3.51, 5);
  });

  it('augmente à vitesse élite et diminue sur terrain lourd', () => {
    const base = effectiveStrideLength(horse, envPlatStandard);
    const elite = effectiveStrideLength(horse, { terrain: 'Plat', speed: 'Elite' });
    const lourd = effectiveStrideLength(horse, { terrain: 'Lourd', speed: 'Standard' });
    expect(elite).toBeGreaterThan(base);
    expect(lourd).toBeLessThan(base);
  });

  it("applique l'ajustement terrain de façon additive (Montant/Descendant symétriques à ±0,1 m)", () => {
    const montant = effectiveStrideLength(horse, { terrain: 'Montant', speed: 'Standard' });
    const descendant = effectiveStrideLength(horse, { terrain: 'Descendant', speed: 'Standard' });
    expect(descendant - montant).toBeCloseTo(0.2, 5);
  });
});

describe('fixedAllowanceForHeight', () => {
  it("en dessous de 1,15 m, l'allocation fixe est l'amplitude elle-même", () => {
    expect(fixedAllowanceForHeight(3.51, 1.1)).toBeCloseTo(3.51, 5);
    expect(fixedAllowanceForHeight(3.51, 0)).toBeCloseTo(3.51, 5);
  });

  it("à partir de 1,15 m, l'allocation ne dépend plus de l'amplitude mais vaut 3 × hauteur", () => {
    expect(fixedAllowanceForHeight(3.51, 1.15)).toBeCloseTo(3.45, 5);
    expect(fixedAllowanceForHeight(999, 1.15)).toBeCloseTo(3.45, 5); // amplitude ignorée
    expect(fixedAllowanceForHeight(3.51, 1.2)).toBeCloseTo(3.6, 5);
  });

  it('répartit toujours le forfait en appel (-0,15 m) et réception (+0,15 m) dont la somme vaut 3 × hauteur', () => {
    const height = 1.3;
    expect(fixedAllowanceForHeight(3.51, height)).toBeCloseTo(3 * height, 5);
  });
});

describe('stepsToStrides', () => {
  it('reproduit la mesure de référence en concours (30 pas cavalier de 0,75 m = 22,5 m = 5 foulées)', () => {
    // Mesure réelle ayant servi à calibrer la formule : Cheval de 160 cm au garrot, vitesse
    // Standard, terrain plat, obstacle < 1,15 m (allocation fixe = amplitude).
    const result = stepsToStrides(30, 0.75, horse, 1.1, envPlatStandard);
    expect(result.distanceMeters).toBeCloseTo(22.5, 5);
    expect(result.suggestedStrides).toBe(5);
  });

  it("arrondit les foulées suggérées à l'entier le plus proche, sans décalage additionnel", () => {
    const result = stepsToStrides(30, 0.75, horse, 1.1, envPlatStandard);
    expect(result.suggestedStrides).toBe(Math.round(result.theoreticalStrides));
  });

  it('plus de pas comptés donnent plus de foulées théoriques (monotonie)', () => {
    const fewer = stepsToStrides(24, 0.75, horse, 1.1, envPlatStandard);
    const more = stepsToStrides(30, 0.75, horse, 1.1, envPlatStandard);
    expect(more.theoreticalStrides).toBeGreaterThan(fewer.theoreticalStrides);
  });
});

describe('combinationDistance', () => {
  it("applique le ratio d'amplitude (barres au sol / cavalettis) directement à la foulée", () => {
    const full = combinationDistance(1, 'Vertical', 'Vertical', 1.0, horse, envPlatStandard, 1);
    const ground = combinationDistance(1, 'Vertical', 'Vertical', 1.0, horse, envPlatStandard, 0.857);
    expect(ground.strideLength).toBeCloseTo(full.strideLength * 0.857, 5);
  });

  it("un enchaînement Oxer-Oxer nécessite plus de distance qu'un Vertical-Vertical", () => {
    const verticalVertical = combinationDistance(1, 'Vertical', 'Vertical', 1.0, horse, envPlatStandard);
    const oxerOxer = combinationDistance(1, 'Oxer', 'Oxer', 1.0, horse, envPlatStandard);
    expect(oxerOxer.distanceMeters).toBeGreaterThan(verticalVertical.distanceMeters);
  });

  it('un Vertical-Vertical (bonus nul) laisse l’allocation fixe inchangée sous 1,15 m', () => {
    const result = combinationDistance(0, 'Vertical', 'Vertical', 1.1, horse, envPlatStandard);
    expect(result.fixedAllowance).toBeCloseTo(effectiveStrideLength(horse, envPlatStandard), 5);
  });

  it('demander plus de foulées augmente la distance totale (monotonie)', () => {
    const oneStride = combinationDistance(1, 'Vertical', 'Vertical', 1.0, horse, envPlatStandard);
    const twoStrides = combinationDistance(2, 'Vertical', 'Vertical', 1.0, horse, envPlatStandard);
    expect(twoStrides.distanceMeters).toBeGreaterThan(oneStride.distanceMeters);
  });
});

describe('calibrateStepLength', () => {
  it('divise la distance mesurée par le nombre de pas', () => {
    expect(calibrateStepLength(15, 20)).toBeCloseTo(0.75, 5);
  });

  it('retourne 0 si le nombre de pas est nul ou négatif', () => {
    expect(calibrateStepLength(15, 0)).toBe(0);
    expect(calibrateStepLength(15, -3)).toBe(0);
  });
});

describe('allowedTime', () => {
  it('convertit la longueur du parcours et la vitesse imposée en temps accordé (secondes)', () => {
    expect(allowedTime(420, 350)).toBeCloseTo(72, 5);
  });

  it('retourne 0 si la vitesse est nulle ou négative', () => {
    expect(allowedTime(420, 0)).toBe(0);
    expect(allowedTime(420, -10)).toBe(0);
  });
});

describe('canterCadence', () => {
  it("varie avec la vitesse (régression du bug où la vitesse n'avait aucun effet sur la cadence)", () => {
    const slow = canterCadence(300, 3.51);
    const fast = canterCadence(400, 3.51);
    expect(fast).toBeGreaterThan(slow);
  });

  it('applique la formule (vitesse / foulée) × 0,5 + 50', () => {
    expect(canterCadence(350, 3.5)).toBeCloseTo((350 / 3.5) * 0.5 + 50, 5);
  });

  it('retourne 0 si la longueur de foulée est nulle ou négative', () => {
    expect(canterCadence(350, 0)).toBe(0);
    expect(canterCadence(350, -1)).toBe(0);
  });
});
