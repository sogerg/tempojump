// src/lib/dates.ts
// La date du jour telle que la voit le cavalier, pas celle de Greenwich.
// `new Date().toISOString().slice(0, 10)` donne la date UTC : une entrée de journal notée
// à 0 h 30 à Paris (22 h 30 UTC la veille) ou un soir en Californie (le lendemain en UTC)
// proposait la mauvaise date. Voir docs/scripts/audit-defauts-connus.js (date-du-jour-utc).

/** AAAA-MM-JJ du jour dans le fuseau du téléphone. */
export function dateLocaleIso(d: Date = new Date()): string {
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}
