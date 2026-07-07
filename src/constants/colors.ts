export interface ThemeColors {
  background: string;
  barBackground: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  segmentBackground: string;
  danger: string;
  placeholder: string;
  accentGold: string;
  introGradientStart: string;
  introGradientEnd: string;
}

// Palette "cavalerie élégante" : beige cuir clair (presque blanc), rose
// poudré, vert olive, accents or brossé — inspirée de la maquette design
// (doc/maquette design elegante.png).
export const lightColors: ThemeColors = {
  background: '#FCFAF5',
  barBackground: '#F3EDE0',
  surface: '#FFFFFF',
  card: '#F0DFD8',
  cardBorder: '#D9BE98',
  text: '#3B2A20',
  textMuted: '#8A6F5C',
  border: '#DEC6A6',
  primary: '#8FA377',
  primaryText: '#FFFFFF',
  segmentBackground: '#EDE0D0',
  danger: '#B5675A',
  placeholder: '#B69C86',
  accentGold: '#C9A24B',
  introGradientStart: '#F3D9CE',
  introGradientEnd: '#E1B7A9',
};

export const darkColors: ThemeColors = {
  background: '#211A14',
  barBackground: '#1A1510',
  surface: '#2B2119',
  card: '#3A2B27',
  cardBorder: '#6B4F35',
  text: '#F1E4D3',
  textMuted: '#B8A08C',
  border: '#5A4531',
  primary: '#7C9367',
  primaryText: '#0D1A12',
  segmentBackground: '#382C22',
  danger: '#C97A6C',
  placeholder: '#8A7460',
  accentGold: '#D4AF6A',
  introGradientStart: '#4A342E',
  introGradientEnd: '#37241F',
};
