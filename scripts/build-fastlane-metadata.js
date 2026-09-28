// Convertit doc/store_listings/{lang}.md vers la structure attendue par fastlane
// supply (Android) et deliver (iOS), et copie les screenshots correspondants.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LISTINGS_DIR = path.join(ROOT, 'doc/store_listings');
const APPLE_SCREENSHOTS_DIR = path.join(ROOT, 'doc/store_screenshots_apple');
const GOOGLE_SCREENSHOTS_DIR = path.join(ROOT, 'doc/store_screenshots_google');
const FASTLANE_DIR = path.join(ROOT, 'fastlane');

// Notre code -> [locale Google Play, locale App Store Connect]
const LOCALE_MAP = {
  fr: ['fr-FR', 'fr-FR'],
  en: ['en-US', 'en-US'],
  es: ['es-ES', 'es-ES'],
  it: ['it-IT', 'it'],
  pt: ['pt-PT', 'pt-PT'],
  de: ['de-DE', 'de-DE'],
  nl: ['nl-NL', 'nl-NL'],
  pl: ['pl-PL', 'pl'],
  ru: ['ru-RU', 'ru'],
  cs: ['cs-CZ', 'cs'],
  da: ['da-DK', 'da'],
  fi: ['fi-FI', 'fi'],
  hu: ['hu-HU', 'hu'],
  no: ['no-NO', 'no'],
  ro: ['ro', 'ro'],
  sv: ['sv-SE', 'sv'],
  tr: ['tr-TR', 'tr'],
  el: ['el-GR', 'el'],
  zh: ['zh-CN', 'zh-Hans'],
  ja: ['ja-JP', 'ja'],
  ko: ['ko-KR', 'ko'],
  ar: ['ar', 'ar-SA'],
  vi: ['vi', 'vi'],
  th: ['th', 'th'],
  hi: ['hi-IN', 'hi'],
};

// Variantes régionales de fiche (28/09/2026, docs/procedure/variantes-regionales-fiche.md) :
// doc/store_listings/<locale>.md, même schéma que les 25 langues.
// Notre code -> [locale Google Play, locale App Store Connect, langue mère]. Play n'a pas es-MX :
// la variante mexicaine sert es-419 (toute l'Amérique latine) sur Google Play.
const VARIANTES = {
  'en-GB': ['en-GB', 'en-GB', 'en'],
  'en-AU': ['en-AU', 'en-AU', 'en'],
  'es-MX': ['es-419', 'es-MX', 'es'],
  'fr-CA': ['fr-CA', 'fr-CA', 'fr'],
};
for (const [code, [play, apple]] of Object.entries(VARIANTES)) LOCALE_MAP[code] = [play, apple];

function section(content, header, isH3) {
  const marker = isH3 ? '###' : '##';
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${marker} ${escaped}[^\\n]*\\n\\n([\\s\\S]*?)(?=\\n${marker} |\\n---|$)`);
  const m = content.match(re);
  return m ? m[1].trim() : '';
}

// Écriture via un temporaire puis renommage : un écrit interrompu ne laisse jamais un fichier
// à moitié vide (leçon du launchpad.html effacé le 21/09).
function writeFile(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, text, 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * Description Google Play : la même que celle de l'App Store, sauf les deux paragraphes qui
 * dépendent de la plateforme.
 *
 * Sur iPhone, l'app gère elle-même 30 jours gratuits (trousseau) et l'abonnement se résilie dans
 * le compte Apple. Sur Android rien ne survit à une désinstallation : l'essai est porté par
 * Google Play (commit 1b9c6ac), et la résiliation se fait dans Google Play. Le jour où la fiche
 * Play repart, parler des « 30 jours gérés par l'app » ou du « compte Apple » y serait faux.
 *
 * Chaque fiche {lang}.md porte donc deux sections propres à Android ; elles remplacent le
 * 2e paragraphe (IMPORTANT, l'essai) et le dernier (résiliation) de la description. La
 * description iOS n'est pas touchée. Toute fiche qui ne ressemble plus à ce schéma arrête le
 * script plutôt que de produire une fiche Play à moitié iOS.
 */
function androidDescription(lang, content, fullDesc) {
  const trial = section(content, 'Android Trial Paragraph');
  const sub = section(content, 'Android Subscription Paragraph');
  if (!trial || !sub) throw new Error(`${lang}.md : sections Android manquantes`);
  const paras = fullDesc.split(/\r?\n\s*\r?\n/);
  const iosTrial = paras[1];
  const iosSub = paras[paras.length - 1];
  if (!/30/.test(iosTrial || '') || !/Apple/.test(iosSub || '')) {
    throw new Error(`${lang}.md : paragraphes essai/résiliation iOS introuvables à leur place`);
  }
  const out = fullDesc.replace(iosTrial, trial).replace(iosSub, sub);
  if (/Apple/.test(out)) throw new Error(`${lang}.md : la description Android nomme encore Apple`);
  if (out.length > 4000) throw new Error(`${lang}.md : description Android > 4000 caractères`);
  return out;
}

/**
 * Contrôles propres aux variantes régionales : elles ne changent que le vocabulaire (nom,
 * sous-titre, mots-clés, promo, description courte, corps). Le paragraphe IMPORTANT (essai),
 * le paragraphe de résiliation et les deux sections Android doivent être IDENTIQUES à ceux de la
 * langue mère (même paragraphe d'achat 2.3.2), et la variante ne doit pas être une copie.
 * Arrêt du script au premier écart, avant toute écriture de cette variante.
 */
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const mots = (s) => norm(s).replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter((w) => w.length > 2);
const racine = (w) => w.replace(/(es|s)$/u, '');
const MARQUES_NICHES = /bijou|jewel|gemstone|mulch|gravel|\bfence|clôture|mileage|receipt|pony club|ffe\b|fei\b|british showjumping|equestrian australia|longines|rolex/i;
function controlerVariante(code, content, mereContent) {
  const lire = (c) => ({
    name: section(c, 'App Name (30 char max)'),
    short: section(c, 'Short Description (80 char max)'),
    full: section(c, 'Full Description'),
    subtitle: section(c, 'Subtitle (30 char max)', true),
    promo: section(c, 'Promotional Text (170 char max)', true),
    keywords: section(c, 'Keywords (100 char max, commas included)', true),
    trial: section(c, 'Android Trial Paragraph'),
    sub: section(c, 'Android Subscription Paragraph'),
  });
  const v = lire(content);
  const m = lire(mereContent);
  const pb = [];
  const limites = { name: 30, subtitle: 30, keywords: 100, promo: 170, short: 80, full: 4000 };
  for (const [k, max] of Object.entries(limites)) {
    if (!v[k]) pb.push(`${k} vide`);
    else if ([...v[k]].length > max) pb.push(`${k} ${[...v[k]].length} caractères (max ${max})`);
  }
  const paras = (s) => s.split(/\r?\n\s*\r?\n/);
  const pv = paras(v.full);
  const pm = paras(m.full);
  if (pv[1] !== pm[1]) pb.push('paragraphe IMPORTANT (essai) différent de la langue mère');
  if (pv[pv.length - 1] !== pm[pm.length - 1]) pb.push('paragraphe de résiliation différent de la langue mère');
  if (v.trial !== m.trial || v.sub !== m.sub) pb.push('sections Android différentes de la langue mère');
  if (/,\s/.test(v.keywords)) pb.push('espace après une virgule dans les mots-clés');
  const kws = v.keywords.split(',');
  if (new Set(kws).size !== kws.length) pb.push('mot-clé en double');
  const deja = new Set([...mots(v.name), ...mots(v.subtitle)].map(racine));
  const repris = kws.filter((k) => mots(k).some((w) => deja.has(racine(w))));
  if (repris.length) pb.push(`mots-clés déjà dans le nom/sous-titre : ${repris.join(', ')}`);
  if (v.keywords === m.keywords) pb.push('mots-clés identiques à la langue mère : une copie ne se crée pas');
  const visibles = [v.name, v.subtitle, v.keywords, v.promo, v.short].join('\n');
  if (MARQUES_NICHES.test(visibles)) pb.push(`marque ou niche réservée : ${visibles.match(MARQUES_NICHES)[0]}`);
  // Titres de captures : ≤ 38 caractères, aucun mot du nom/sous-titre hors écran 2 (le résultat).
  const titres = [...content.matchAll(/^(\d): (.+)$/gm)].map((x) => x[2].trim()).slice(0, 5);
  if (titres.length !== 5) pb.push(`${titres.length} titres de captures au lieu de 5`);
  titres.forEach((t, i) => {
    if ([...t].length > 38) pb.push(`capture ${i + 1} : ${[...t].length} caractères`);
    if (i === 1) return;
    const dup = [...new Set(mots(t).filter((w) => deja.has(racine(w))))];
    if (dup.length) pb.push(`capture ${i + 1} reprend ${dup.join(', ')} du nom/sous-titre`);
  });
  if (pb.length) throw new Error(`${code}.md (variante) :\n  ${pb.join('\n  ')}`);
}

function copyImages(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
  }
}

let processed = 0;
for (const [lang, [playLocale, appleLocale]] of Object.entries(LOCALE_MAP)) {
  const mdPath = path.join(LISTINGS_DIR, `${lang}.md`);
  if (!fs.existsSync(mdPath)) { console.warn('missing', mdPath); continue; }
  const content = fs.readFileSync(mdPath, 'utf8');
  const mere = VARIANTES[lang] && VARIANTES[lang][2];
  if (mere) controlerVariante(lang, content, fs.readFileSync(path.join(LISTINGS_DIR, `${mere}.md`), 'utf8'));

  const appName = section(content, 'App Name (30 char max)');
  const shortDesc = section(content, 'Short Description (80 char max)');
  const fullDesc = section(content, 'Full Description');
  const subtitle = section(content, 'Subtitle (30 char max)', true);
  const promoText = section(content, 'Promotional Text (170 char max)', true);
  const keywords = section(content, 'Keywords (100 char max, commas included)', true);

  // ---- Android (supply) ----
  const androidDir = path.join(FASTLANE_DIR, 'metadata/android', playLocale);
  writeFile(path.join(androidDir, 'title.txt'), appName);
  writeFile(path.join(androidDir, 'short_description.txt'), shortDesc);
  writeFile(path.join(androidDir, 'full_description.txt'), androidDescription(lang, content, fullDesc));
  copyImages(
    path.join(GOOGLE_SCREENSHOTS_DIR, lang),
    path.join(androidDir, 'images/phoneScreenshots')
  );

  // ---- iOS (deliver) ----
  const iosDir = path.join(FASTLANE_DIR, 'metadata', appleLocale);
  writeFile(path.join(iosDir, 'name.txt'), appName);
  writeFile(path.join(iosDir, 'subtitle.txt'), subtitle);
  writeFile(path.join(iosDir, 'description.txt'), fullDesc);
  writeFile(path.join(iosDir, 'keywords.txt'), keywords);
  writeFile(path.join(iosDir, 'promotional_text.txt'), promoText);
  // Variante : les URL (confidentialité, support, marketing) sont celles de la langue mère.
  if (mere) {
    const iosMere = path.join(FASTLANE_DIR, 'metadata', LOCALE_MAP[mere][1]);
    for (const f of ['privacy_url.txt', 'support_url.txt', 'marketing_url.txt']) {
      const src = path.join(iosMere, f);
      if (fs.existsSync(src)) writeFile(path.join(iosDir, f), fs.readFileSync(src, 'utf8'));
    }
  }
  copyImages(
    path.join(APPLE_SCREENSHOTS_DIR, lang),
    path.join(FASTLANE_DIR, 'screenshots', appleLocale)
  );

  processed++;
}

console.log(`Terminé : ${processed} langues converties.`);
