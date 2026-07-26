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

function writeFile(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
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
  writeFile(path.join(androidDir, 'full_description.txt'), fullDesc);
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
