import AsyncStorage from '@react-native-async-storage/async-storage';
import { Horse } from '../types';
import { UnitSystem } from './units';

const HORSES_KEY = '@cavalier/horses';
const RIDER_STEP_LENGTH_KEY = '@cavalier/riderStepLength';
const SELECTED_HORSE_KEY = '@cavalier/selectedHorseId';
const LANGUAGE_KEY = '@cavalier/language';
const UNIT_SYSTEM_KEY = '@cavalier/unitSystem';
const DARK_MODE_KEY = '@cavalier/darkMode';
const CHECKLIST_STATE_KEY = '@cavalier/checklistState';

export async function loadHorses(): Promise<Horse[]> {
  const raw = await AsyncStorage.getItem(HORSES_KEY);
  return raw ? (JSON.parse(raw) as Horse[]) : [];
}

export async function saveHorses(horses: Horse[]): Promise<void> {
  await AsyncStorage.setItem(HORSES_KEY, JSON.stringify(horses));
}

export async function loadRiderStepLength(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(RIDER_STEP_LENGTH_KEY);
  return raw ? Number(raw) : null;
}

export async function saveRiderStepLength(stepLength: number): Promise<void> {
  await AsyncStorage.setItem(RIDER_STEP_LENGTH_KEY, String(stepLength));
}

export async function loadSelectedHorseId(): Promise<string | null> {
  return AsyncStorage.getItem(SELECTED_HORSE_KEY);
}

export async function saveSelectedHorseId(id: string | null): Promise<void> {
  if (id === null) {
    await AsyncStorage.removeItem(SELECTED_HORSE_KEY);
  } else {
    await AsyncStorage.setItem(SELECTED_HORSE_KEY, id);
  }
}

export async function loadLanguage(): Promise<string | null> {
  return AsyncStorage.getItem(LANGUAGE_KEY);
}

export async function saveLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
}

export async function loadUnitSystem(): Promise<UnitSystem | null> {
  const raw = await AsyncStorage.getItem(UNIT_SYSTEM_KEY);
  return raw === 'metric' || raw === 'imperial' ? raw : null;
}

export async function saveUnitSystem(system: UnitSystem): Promise<void> {
  await AsyncStorage.setItem(UNIT_SYSTEM_KEY, system);
}

export async function loadDarkMode(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(DARK_MODE_KEY);
  return raw === null ? null : raw === 'true';
}

export async function saveDarkMode(value: boolean): Promise<void> {
  await AsyncStorage.setItem(DARK_MODE_KEY, String(value));
}

export async function loadChecklistState(): Promise<Record<string, boolean>> {
  const raw = await AsyncStorage.getItem(CHECKLIST_STATE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
}

export async function saveChecklistState(state: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify(state));
}
