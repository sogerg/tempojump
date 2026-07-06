import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadMounts,
  loadRiderStepLength,
  loadSelectedMountId,
  saveMounts,
  saveRiderStepLength,
  saveSelectedMountId,
} from '../storage/profileStorage';
import { DEFAULT_RIDER_STEP_LENGTH, DEFAULT_STRIDE_LENGTH } from '../constants/mountDefaults';
import { MountProfile } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ProfilesContextValue {
  mounts: MountProfile[];
  selectedMountId: string | null;
  selectedMount: MountProfile | null;
  riderStepLength: number;
  isLoading: boolean;
  addMount: (mount: Omit<MountProfile, 'id'>) => Promise<void>;
  updateMount: (mount: MountProfile) => Promise<void>;
  removeMount: (id: string) => Promise<void>;
  selectMount: (id: string | null) => Promise<void>;
  setRiderStepLength: (stepLength: number) => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const [mounts, setMounts] = useState<MountProfile[]>([]);
  const [selectedMountId, setSelectedMountId] = useState<string | null>(null);
  const [riderStepLength, setRiderStepLengthState] = useState(DEFAULT_RIDER_STEP_LENGTH);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedMounts, storedStepLength, storedSelectedId] = await Promise.all([
        loadMounts(),
        loadRiderStepLength(),
        loadSelectedMountId(),
      ]);

      let mountsToUse = storedMounts;
      if (mountsToUse.length === 0) {
        const defaultMount: MountProfile = {
          id: generateId(),
          name: 'Ma monture',
          category: 'Cheval',
          strideLength: DEFAULT_STRIDE_LENGTH.Cheval,
        };
        mountsToUse = [defaultMount];
        await saveMounts(mountsToUse);
      }

      setMounts(mountsToUse);
      if (storedStepLength !== null) setRiderStepLengthState(storedStepLength);
      setSelectedMountId(storedSelectedId ?? mountsToUse[0]?.id ?? null);
      setIsLoading(false);
    })();
  }, []);

  const addMount = async (mount: Omit<MountProfile, 'id'>) => {
    const newMount: MountProfile = { ...mount, id: generateId() };
    const next = [...mounts, newMount];
    setMounts(next);
    await saveMounts(next);
    if (!selectedMountId) {
      setSelectedMountId(newMount.id);
      await saveSelectedMountId(newMount.id);
    }
  };

  const updateMount = async (mount: MountProfile) => {
    const next = mounts.map((m) => (m.id === mount.id ? mount : m));
    setMounts(next);
    await saveMounts(next);
  };

  const removeMount = async (id: string) => {
    const next = mounts.filter((m) => m.id !== id);
    setMounts(next);
    await saveMounts(next);
    if (selectedMountId === id) {
      const fallbackId = next[0]?.id ?? null;
      setSelectedMountId(fallbackId);
      await saveSelectedMountId(fallbackId);
    }
  };

  const selectMount = async (id: string | null) => {
    setSelectedMountId(id);
    await saveSelectedMountId(id);
  };

  const setRiderStepLength = async (stepLength: number) => {
    setRiderStepLengthState(stepLength);
    await saveRiderStepLength(stepLength);
  };

  const selectedMount = useMemo(
    () => mounts.find((m) => m.id === selectedMountId) ?? null,
    [mounts, selectedMountId]
  );

  const value: ProfilesContextValue = {
    mounts,
    selectedMountId,
    selectedMount,
    riderStepLength,
    isLoading,
    addMount,
    updateMount,
    removeMount,
    selectMount,
    setRiderStepLength,
  };

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles(): ProfilesContextValue {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error('useProfiles must be used within a ProfilesProvider');
  return ctx;
}
