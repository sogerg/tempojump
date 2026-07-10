import {
  formatLength,
  formatSpeed,
  fromMeters,
  inputUnitSuffix,
  speedFromMetersPerMinute,
  speedToMetersPerMinute,
  speedUnitSuffix,
  toMeters,
} from './units';

describe('toMeters / fromMeters', () => {
  it('laisse la valeur inchangée en métrique', () => {
    expect(toMeters(1.1, 'metric')).toBe(1.1);
    expect(fromMeters(1.1, 'metric')).toBe(1.1);
  });

  it('convertit pieds <-> mètres en impérial', () => {
    expect(toMeters(1, 'imperial')).toBeCloseTo(0.3048, 5);
    expect(fromMeters(0.3048, 'imperial')).toBeCloseTo(1, 5);
  });
});

describe('inputUnitSuffix', () => {
  it('retourne "m" en métrique et "ft" en impérial', () => {
    expect(inputUnitSuffix('metric')).toBe('m');
    expect(inputUnitSuffix('imperial')).toBe('ft');
  });
});

describe('formatLength', () => {
  it('affiche en cm sous 1 m et en m au-dessus, en métrique', () => {
    expect(formatLength(0.9, 'metric')).toBe('90 cm');
    expect(formatLength(1.1, 'metric')).toBe('1.10 m');
  });

  it('affiche en pieds/pouces en impérial', () => {
    expect(formatLength(1, 'imperial')).toBe('3 ft 3.4 in');
  });
});

describe('speedToMetersPerMinute / speedFromMetersPerMinute', () => {
  it('laisse la vitesse inchangée en métrique', () => {
    expect(speedToMetersPerMinute(350, 'metric')).toBe(350);
    expect(speedFromMetersPerMinute(350, 'metric')).toBe(350);
  });

  it('convertit m/min <-> yd/min en impérial (régression : la vitesse restait en m/min partout)', () => {
    expect(speedFromMetersPerMinute(350, 'imperial')).toBeCloseTo(382.76, 1);
    expect(speedToMetersPerMinute(382.76, 'imperial')).toBeCloseTo(350, 1);
  });

  it('aller-retour métrique -> impérial -> métrique redonne la valeur de départ', () => {
    const original = 375;
    const displayed = speedFromMetersPerMinute(original, 'imperial');
    const roundTrip = speedToMetersPerMinute(displayed, 'imperial');
    expect(roundTrip).toBeCloseTo(original, 5);
  });
});

describe('speedUnitSuffix', () => {
  it('retourne "m/min" en métrique et "yd/min" en impérial', () => {
    expect(speedUnitSuffix('metric')).toBe('m/min');
    expect(speedUnitSuffix('imperial')).toBe('yd/min');
  });
});

describe('formatSpeed', () => {
  it('formate et arrondit la vitesse avec son unité', () => {
    expect(formatSpeed(350, 'metric')).toBe('350 m/min');
    expect(formatSpeed(350, 'imperial')).toBe('383 yd/min');
  });
});
