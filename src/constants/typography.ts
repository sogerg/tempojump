// Titres : Playfair Display (serif élégant à fort contraste, chargé via
// @expo-google-fonts/playfair-display — fidèle à la maquette design).
// Corps : sans-serif fine native (aucune police à embarquer).
import { Platform } from 'react-native';

export const FONTS = {
  heading: 'PlayfairDisplay_700Bold',
  headingSemiBold: 'PlayfairDisplay_600SemiBold',
  body: Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'System' }),
};
