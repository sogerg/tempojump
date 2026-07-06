export interface LanguageOption {
  code: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', nativeName: 'Français' },
  { code: 'en', nativeName: 'English' },
  { code: 'es', nativeName: 'Español' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'zh', nativeName: '中文' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'th', nativeName: 'ไทย' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'el', nativeName: 'Ελληνικά' },
  { code: 'sv', nativeName: 'Svenska' },
  { code: 'no', nativeName: 'Norsk' },
  { code: 'da', nativeName: 'Dansk' },
  { code: 'fi', nativeName: 'Suomi' },
  { code: 'cs', nativeName: 'Čeština' },
  { code: 'ro', nativeName: 'Română' },
  { code: 'hu', nativeName: 'Magyar' },
];

export const DEFAULT_LANGUAGE = 'fr';

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);
