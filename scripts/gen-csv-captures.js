// Génère doc/store_listings/captures-canva.csv pour « Créer en masse » de Canva (docs/procedure/canva-screenshots.md) :
// lang_code,lang_name,screenshot1..screenshotN, BOM UTF-8, titres extraits des doc/store_listings/<langue>.md
// (section « Screenshots Text »), jamais recopiés à la main. Les 25 langues de l'app ; les variantes
// régionales (en-GB, en-AU, es-MX, fr-CA) gardent les captures de leur langue mère.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'doc/store_listings');
const N = 6;
const LANGUES = [
  ['en', 'English'], ['ar', 'Arabic'], ['cs', 'Czech'], ['da', 'Danish'], ['de', 'German'], ['el', 'Greek'],
  ['es', 'Spanish'], ['fi', 'Finnish'], ['fr', 'French'], ['hi', 'Hindi'], ['hu', 'Hungarian'], ['it', 'Italian'],
  ['ja', 'Japanese'], ['ko', 'Korean'], ['nl', 'Dutch'], ['no', 'Norwegian'], ['pl', 'Polish'], ['pt', 'Portuguese'],
  ['ro', 'Romanian'], ['ru', 'Russian'], ['sv', 'Swedish'], ['th', 'Thai'], ['tr', 'Turkish'], ['vi', 'Vietnamese'],
  ['zh', 'Chinese (Simplified)'],
];
const q = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const lignes = [['lang_code', 'lang_name', ...Array.from({ length: N }, (_, i) => `screenshot${i + 1}`)].join(',')];
for (const [code, nom] of LANGUES) {
  const c = fs.readFileSync(path.join(DIR, `${code}.md`), 'utf8');
  const titres = [...c.matchAll(/^(\d): (.+)$/gm)].map((m) => m[2].trim());
  if (titres.length !== N) throw new Error(`${code}.md : ${titres.length} titres au lieu de ${N}`);
  lignes.push([code, nom, ...titres].map(q).join(','));
}
const out = path.join(DIR, 'captures-canva.csv');
fs.writeFileSync(`${out}.tmp`, '﻿' + lignes.join('\r\n') + '\r\n', 'utf8');
fs.renameSync(`${out}.tmp`, out);
console.log(`${lignes.length - 1} langues × ${N} titres → ${path.relative(ROOT, out)}`);
