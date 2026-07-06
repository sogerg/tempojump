import { Platform } from 'react-native';

// Titres : serif élégant (Georgia sur iOS, serif natif sur Android — aucune police à embarquer).
// Corps : sans-serif fine, plus sophistiquée que le poids par défaut.
export const FONTS = {
  heading: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'System' }),
};
