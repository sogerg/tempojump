// src/lib/dates.ts
// La date du jour telle que la voit le cavalier, pas celle de Greenwich.
// `new Date().toISOString().slice(0, 10)` donne la date UTC : une entrée de journal notée
// à 0 h 30 à Paris (22 h 30 UTC la veille) ou un soir en Californie (le lendemain en UTC)
// proposait la mauvaise date. Voir docs/scripts/audit-defauts-connus.js (date-du-jour-utc).

const lireIso = (iso: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

/**
 * Date d'une entrée en toutes lettres dans la langue (« vendredi 17 octobre 2026 »). Une date ISO
 * n'est jamais affichée brute (défaut connu ; « 2026-10-17 » au carnet, S24 17/10/2026). Une ancienne
 * entrée saisie librement (pas au format AAAA-MM-JJ) est rendue telle quelle.
 */
export function dateLisible(iso: string, langue: string): string {
  const d = lireIso(iso);
  if (!d) return iso;
  try {
    return new Intl.DateTimeFormat(langue === 'no' ? 'nb' : langue, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return iso;
  }
}

/** La date décalée de n jours (veille : -1) ; une date illisible repart d'aujourd'hui. */
export function decalerJours(iso: string, n: number): string {
  const d = lireIso(iso) ?? new Date();
  d.setDate(d.getDate() + n);
  return dateLocaleIso(d);
}

/** AAAA-MM-JJ du jour dans le fuseau du téléphone. */
export function dateLocaleIso(d: Date = new Date()): string {
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}
