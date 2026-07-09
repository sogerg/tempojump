export interface Horse {
  id: string;
  name: string;
  withersHeight: number; // taille au garrot, en cm
  notes?: string;
}

export type ObstacleType = 'Vertical' | 'Oxer';

export type Terrain = 'Plat' | 'Montant' | 'Descendant' | 'Lourd';

export type SpeedLevel = 'Standard' | 'Elite';

export interface RiderProfile {
  stepLength: number; // longueur de pas du cavalier, en mètres
}

export interface EnvironmentAdjustments {
  terrain: Terrain;
  speed: SpeedLevel;
}

export interface StrideResult {
  distanceMeters: number;
  strideLength: number;
  fixedAllowance: number;
  theoreticalStrides: number; // valeur décimale
  suggestedStrides: number; // arrondi à l'entier le plus proche
}

export interface CombinationResult {
  distanceMeters: number;
  strideLength: number;
  fixedAllowance: number;
}

export type ChecklistCategory = 'horse' | 'rider' | 'papers';

export interface ChecklistItemDefinition {
  id: string;
  category: ChecklistCategory;
}

/** Élément de checklist ajouté par l'utilisateur (libellé libre, non traduit). */
export interface CustomChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color?: string; // absent = tracé importé avant l'ajout des couleurs (rouge par défaut)
}

export interface StrideMarker {
  id?: string; // absent = repère importé avant l'ajout du glisser-déposer
  x: number;
  y: number;
  label: string;
}

export interface CoursePlan {
  id: string;
  name: string;
  createdAt: string; // ISO date
  photoUri: string;
  strokes: DrawingStroke[];
  markers: StrideMarker[];
}

export interface JournalEntry {
  id: string;
  name: string;
  date: string; // ISO date
  videoUri?: string;
  theoreticalStrides?: number;
  actualStrides?: number;
  notes?: string;
}
