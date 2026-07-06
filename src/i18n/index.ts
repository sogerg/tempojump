import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from './languages';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import hi from './locales/hi.json';
import el from './locales/el.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import cs from './locales/cs.json';
import ro from './locales/ro.json';
import hu from './locales/hu.json';

export const i18nResources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
  de: { translation: de },
  nl: { translation: nl },
  pl: { translation: pl },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  tr: { translation: tr },
  vi: { translation: vi },
  th: { translation: th },
  hi: { translation: hi },
  el: { translation: el },
  sv: { translation: sv },
  no: { translation: no },
  da: { translation: da },
  fi: { translation: fi },
  cs: { translation: cs },
  ro: { translation: ro },
  hu: { translation: hu },
};

function detectDeviceLanguage(): string {
  const deviceCode = Localization.getLocales()[0]?.languageCode ?? DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGE_CODES.includes(deviceCode) ? deviceCode : DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: i18nResources,
  lng: detectDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
