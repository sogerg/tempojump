import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 22;

/**
 * Fer à cheval — aucun équivalent dans lucide-react-native (bibliothèque
 * générique, sans icônes équestres). Dessiné à la main, utilisé pour
 * l'onglet Montures et en filigrane décoratif.
 */
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
