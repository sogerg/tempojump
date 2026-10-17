import { dateLocaleIso } from './dates';

// La date du jour est celle du téléphone, pas la date UTC.
describe('dateLocaleIso', () => {
  it("rend la date locale juste après minuit (la veille en UTC à l'est de Greenwich)", () => {
    expect(dateLocaleIso(new Date(2026, 8, 28, 0, 30))).toBe('2026-09-28');
  });
  it("rend la date locale tard le soir (le lendemain en UTC à l'ouest de Greenwich)", () => {
    expect(dateLocaleIso(new Date(2026, 8, 28, 23, 30))).toBe('2026-09-28');
  });
  it('complète mois et jour sur deux chiffres', () => {
    expect(dateLocaleIso(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
  it('prend maintenant par défaut', () => {
    expect(dateLocaleIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
// Date du carnet : jamais d'ISO brut à l'écran, veille / lendemain sans décalage de fuseau (S24 17/10/2026).
import { dateLisible, decalerJours } from './dates';

test('date en toutes lettres dans la langue', () => {
  expect(dateLisible('2026-10-17', 'fr')).toBe('samedi 17 octobre 2026');
  expect(dateLisible('2026-10-17', 'en')).toContain('October 17, 2026');
  expect(dateLisible('2026-10-17', 'no')).toContain('oktober');
});

test('une ancienne saisie libre reste telle quelle', () => {
  expect(dateLisible('17/10 Fontainebleau', 'fr')).toBe('17/10 Fontainebleau');
});

test('veille et lendemain, fins de mois et d’année comprises', () => {
  expect(decalerJours('2026-10-17', -1)).toBe('2026-10-16');
  expect(decalerJours('2026-10-31', 1)).toBe('2026-11-01');
  expect(decalerJours('2026-01-01', -1)).toBe('2025-12-31');
  expect(decalerJours('2028-02-28', 1)).toBe('2028-02-29');
});
