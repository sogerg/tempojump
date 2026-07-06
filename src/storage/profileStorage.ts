import AsyncStorage from '@react-native-async-storage/async-storage';
import { MountProfile } from '../types';

const MOUNTS_KEY = '@cavalier/mounts';
const RIDER_STEP_LENGTH_KEY = '@cavalier/riderStepLength';
const SELECTED_MOUNT_KEY = '@cavalier/selectedMountId';

export async function loadMounts(): Promise<MountProfile[]> {
  const raw = await AsyncStorage.getItem(MOUNTS_KEY);
  return raw ? (JSON.parse(raw) as MountProfile[]) : [];
}

export async function saveMounts(mounts: MountProfile[]): Promise<void> {
  await AsyncStorage.setItem(MOUNTS_KEY, JSON.stringify(mounts));
}

export async function loadRiderStepLength(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(RIDER_STEP_LENGTH_KEY);
  return raw ? Number(raw) : null;
}

export async function saveRiderStepLength(stepLength: number): Promise<void> {
  await AsyncStorage.setItem(RIDER_STEP_LENGTH_KEY, String(stepLength));
}

export async function loadSelectedMountId(): Promise<string | null> {
  return AsyncStorage.getItem(SELECTED_MOUNT_KEY);
}

export async function saveSelectedMountId(id: string | null): Promise<void> {
  if (id === null) {
    await AsyncStorage.removeItem(SELECTED_MOUNT_KEY);
  } else {
    await AsyncStorage.setItem(SELECTED_MOUNT_KEY, id);
  }
}
