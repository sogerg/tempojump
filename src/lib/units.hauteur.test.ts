// Valeur de départ des champs de hauteur : séparateur de la langue, unité du champ, relisible (S24 17/10/2026).
import i18n from '../i18n';
import { hauteurInitiale, toMeters } from './units';

const relire = (s: string) => Number(s.replace(',', '.'));

test.each([
  ['fr', 'metric', '1,10'], ['en', 'metric', '1.10'], ['de', 'metric', '1,10'], ['ar', 'metric', null],
  ['en', 'imperial', '3.6'], ['fr', 'imperial', '3,6'],
])('%s / %s', async (langue, unites, attendu) => {
  await i18n.changeLanguage(langue);
  const s = hauteurInitiale(1.1, unites as 'metric' | 'imperial');
  if (attendu) expect(s).toBe(attendu);
  expect(toMeters(relire(s), unites as 'metric' | 'imperial')).toBeCloseTo(1.1, 1);
});
