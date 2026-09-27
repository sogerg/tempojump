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
  copyImages(
    path.join(APPLE_SCREENSHOTS_DIR, lang),
    path.join(FASTLANE_DIR, 'screenshots', appleLocale)
  );

  processed++;
}

console.log(`Terminé : ${processed} langues converties.`);
