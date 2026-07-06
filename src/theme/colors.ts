export interface ThemeColors {
  background: string;
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
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  card: '#f4f8f5',
  cardBorder: '#dbe8de',
  text: '#1a1a1a',
  textMuted: '#666666',
  border: '#d8dce1',
  primary: '#2f6f4f',
  primaryText: '#ffffff',
  segmentBackground: '#eef1f4',
  danger: '#b3413a',
  placeholder: '#999999',
};

export const darkColors: ThemeColors = {
  background: '#121412',
  surface: '#1c1f1c',
  card: '#1c2620',
  cardBorder: '#2c3a31',
  text: '#f1f3f1',
  textMuted: '#a9b0a9',
  border: '#33372f',
  primary: '#4caf7d',
  primaryText: '#0d1a12',
  segmentBackground: '#232823',
  danger: '#e0665c',
  placeholder: '#7a807a',
};
