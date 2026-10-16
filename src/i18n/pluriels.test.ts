// Chaque clé au pluriel a toutes les formes CLDR de sa langue (« 3 темпов » au lieu de « 3 темпа » sinon :
// i18next retombe sur _other quand _few / _many manquent). Ajouté pour la 1.0.4 (17/10/2026).
import fs from 'fs';
import path from 'path';

const dossier = path.join(__dirname, 'locales');
const langues = fs.readdirSync(dossier).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));

function clesPlates(o: Record<string, unknown>, prefixe = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? clesPlates(v as Record<string, unknown>, `${prefixe}${k}.`) : [`${prefixe}${k}`]));
}

describe.each(langues)('pluriels complets (%s)', (langue) => {
  test('toutes les catégories de la langue sont traduites', () => {
    const cles = clesPlates(JSON.parse(fs.readFileSync(path.join(dossier, `${langue}.json`), 'utf8')));
    const bases = [...new Set(cles.filter((k) => k.endsWith('_one')).map((k) => k.slice(0, -4)))];
    const categories = new Intl.PluralRules(langue === 'no' ? 'nb' : langue).resolvedOptions().pluralCategories;
    const manquantes = bases.flatMap((b) => categories.filter((c) => !cles.includes(`${b}_${c}`)).map((c) => `${b}_${c}`));
    expect(manquantes).toEqual([]);
  });
});
