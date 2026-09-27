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
