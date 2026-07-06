import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadHorses,
  loadRiderStepLength,
  loadSelectedHorseId,
  saveHorses,
  saveRiderStepLength,
  saveSelectedHorseId,
} from '../lib/storage';
import { DEFAULT_RIDER_STEP_LENGTH, DEFAULT_STRIDE_LENGTH } from '../constants/horseDefaults';
import { Horse } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface HorseContextValue {
  horses: Horse[];
  selectedHorseId: string | null;
  selectedHorse: Horse | null;
  riderStepLength: number;
  isLoading: boolean;
  addHorse: (horse: Omit<Horse, 'id'>) => Promise<void>;
  updateHorse: (horse: Horse) => Promise<void>;
  removeHorse: (id: string) => Promise<void>;
  selectHorse: (id: string | null) => Promise<void>;
  setRiderStepLength: (stepLength: number) => Promise<void>;
}

const HorseContext = createContext<HorseContextValue | null>(null);

export function HorseProvider({ children }: { children: React.ReactNode }) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [riderStepLength, setRiderStepLengthState] = useState(DEFAULT_RIDER_STEP_LENGTH);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedHorses, storedStepLength, storedSelectedId] = await Promise.all([
        loadHorses(),
        loadRiderStepLength(),
        loadSelectedHorseId(),
      ]);

      let horsesToUse = storedHorses;
      if (horsesToUse.length === 0) {
        const defaultHorse: Horse = {
          id: generateId(),
          name: 'Ma monture',
          category: 'Cheval',
          strideLength: DEFAULT_STRIDE_LENGTH.Cheval,
        };
        horsesToUse = [defaultHorse];
        await saveHorses(horsesToUse);
      }

      setHorses(horsesToUse);
      if (storedStepLength !== null) setRiderStepLengthState(storedStepLength);
      setSelectedHorseId(storedSelectedId ?? horsesToUse[0]?.id ?? null);
      setIsLoading(false);
    })();
  }, []);

  const addHorse = async (horse: Omit<Horse, 'id'>) => {
    const newHorse: Horse = { ...horse, id: generateId() };
    const next = [...horses, newHorse];
    setHorses(next);
    await saveHorses(next);
    if (!selectedHorseId) {
      setSelectedHorseId(newHorse.id);
      await saveSelectedHorseId(newHorse.id);
    }
  };

  const updateHorse = async (horse: Horse) => {
    const next = horses.map((h) => (h.id === horse.id ? horse : h));
    setHorses(next);
    await saveHorses(next);
  };

  const removeHorse = async (id: string) => {
    const next = horses.filter((h) => h.id !== id);
    setHorses(next);
    await saveHorses(next);
    if (selectedHorseId === id) {
      const fallbackId = next[0]?.id ?? null;
      setSelectedHorseId(fallbackId);
      await saveSelectedHorseId(fallbackId);
    }
  };

  const selectHorse = async (id: string | null) => {
    setSelectedHorseId(id);
    await saveSelectedHorseId(id);
  };

  const setRiderStepLength = async (stepLength: number) => {
    setRiderStepLengthState(stepLength);
    await saveRiderStepLength(stepLength);
  };

  const selectedHorse = useMemo(
    () => horses.find((h) => h.id === selectedHorseId) ?? null,
    [horses, selectedHorseId]
  );

  const value: HorseContextValue = {
    horses,
    selectedHorseId,
    selectedHorse,
    riderStepLength,
    isLoading,
    addHorse,
    updateHorse,
    removeHorse,
    selectHorse,
    setRiderStepLength,
  };

  return <HorseContext.Provider value={value}>{children}</HorseContext.Provider>;
}

export function useHorses(): HorseContextValue {
  const ctx = useContext(HorseContext);
  if (!ctx) throw new Error('useHorses must be used within a HorseProvider');
  return ctx;
}
