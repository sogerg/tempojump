import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { trialStatus, type TrialStatus } from '../utils/trial';

// La date de première ouverture vit dans le TROUSSEAU (Keychain sur iOS), pas dans le stockage
// ordinaire : le stockage ordinaire disparaît avec l'app, et désinstaller-réinstaller remettrait
// le compteur à zéro. Le trousseau iOS survit à la désinstallation. Sur Android il ne survit pas
// — c'est une limite connue, acceptée : le contournement demande un effort que peu feront.
//
// Si le trousseau est indisponible (émulateur, appareil sans écran de verrouillage), on retombe
// sur AsyncStorage plutôt que de refuser la période gratuite.
const KEY = 'tempojump.firstLaunchAt';

interface TrialContextValue extends TrialStatus {
  isTrialLoading: boolean;
}

const TrialContext = createContext<TrialContextValue | null>(null);

async function readFirstLaunch(): Promise<number | null> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    if (v) return Number(v);
  } catch {
    // trousseau indisponible : on tente le stockage ordinaire
  }
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

async function writeFirstLaunch(at: number): Promise<void> {
  const v = String(at);
  try {
    await SecureStore.setItemAsync(KEY, v);
  } catch {
    // trousseau indisponible
  }
  try {
    await AsyncStorage.setItem(KEY, v);
  } catch {
    // stockage indisponible : la période repartira à la prochaine ouverture, ce qui est le
    // moindre mal — mieux vaut un mois de trop qu'une app bloquée.
  }
}

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<TrialStatus>({ daysLeft: 0, active: false });
  const [isTrialLoading, setIsTrialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let first = await readFirstLaunch();
      if (!first || !Number.isFinite(first)) {
        first = Date.now();
        await writeFirstLaunch(first);
      }
      if (!cancelled) {
        setStatus(trialStatus(first));
        setIsTrialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <TrialContext.Provider value={{ ...status, isTrialLoading }}>{children}</TrialContext.Provider>;
}

export function useTrial(): TrialContextValue {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial must be used within a TrialProvider');
  return ctx;
}
