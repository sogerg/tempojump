import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 22;

/** Motif "foulées" (arc + pastilles) repris du logo de l'app — onglet Convertisseur. */
export function StrideArcIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 19c2-8 8-14 18-15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="3" cy="19" r="1.6" fill={color} />
      <Circle cx="9" cy="16.2" r="1.6" fill={color} />
      <Circle cx="15" cy="10.5" r="1.6" fill={color} />
      <Circle cx="21" cy="4" r="1.6" fill={color} />
    </Svg>
  );
}

/** Deux barres croisées — onglet Combinaisons. */
export function PolesIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="4" x2="19" y2="20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="19" y1="4" x2="5" y2="20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Fer à cheval — onglet Montures. */
export function HorseshoeIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 21 7 12a5 5 0 0 1 10 0l1 9"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6" cy="21" r="1.1" fill={color} />
      <Circle cx="18" cy="21" r="1.1" fill={color} />
      <Circle cx="7.3" cy="17" r="1" fill={color} />
      <Circle cx="16.7" cy="17" r="1" fill={color} />
    </Svg>
  );
}

/** Flèches d'agrandissement — onglet Exercices. */
export function ExpandIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Chronomètre — onglet Chrono et vitesse Élite. */
export function StopwatchIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth={1.6} />
      <Path d="M12 9v4l3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Trois points — onglet Plus. */
export function MoreDotsIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="12" r="1.7" fill={color} />
      <Circle cx="12" cy="12" r="1.7" fill={color} />
      <Circle cx="18" cy="12" r="1.7" fill={color} />
    </Svg>
  );
}

/** Rouage — bouton Réglages en en-tête. */
export function GearIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  const teeth = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {teeth.map((angle) => (
        <Rect key={angle} x="11.1" y="1.5" width="1.8" height="4" rx="0.6" fill={color} transform={`rotate(${angle} 12 12)`} />
      ))}
      <Circle cx="12" cy="12" r="6.4" stroke={color} strokeWidth={1.6} />
      <Circle cx="12" cy="12" r="2.2" fill={color} />
    </Svg>
  );
}

/** Terrain plat — vaguelettes. */
export function WaveIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 10c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6-0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M2 15c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Pente montante. */
export function InclineIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18 12 8l9-4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 4h6v6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Pente descendante. */
export function DeclineIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6 12 16l9 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 20h6v-6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Terrain lourd / boueux. */
export function MudIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 16c0-3.5 3.2-6 8-6s8 2.5 8 6-3.6 3-8 3-8 0.5-8-3Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Liste à cocher — menu Check-list. */
export function CheckListIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6 6 8 9 4.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="6" x2="21" y2="6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M4 13 6 15 9 11.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="13" x2="21" y2="13" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="4" y1="20" x2="9" y2="20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="12" y1="20" x2="21" y2="20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** Plan / carte — menu Plan de parcours. */
export function MapIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Line x1="9" y1="4" x2="9" y2="18" stroke={color} strokeWidth={1.5} />
      <Line x1="15" y1="6" x2="15" y2="20" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

/** Journal / carnet — menu Journal. */
export function JournalIcon({ size = DEFAULT_SIZE, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3.5h11a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Line x1="8" y1="8" x2="14" y2="8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Line x1="8" y1="12" x2="14" y2="12" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
