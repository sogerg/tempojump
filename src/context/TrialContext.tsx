import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { trialStatus, type TrialStatus } from '../utils/trial';

// La période gratuite gérée par l'app n'existe QUE sur iOS. Sur Android rien ne survit à une
// désinstallation — pas de trousseau — et réinstaller offrirait un nouveau mois. Google Play porte
// donc l'essai lui-même (durée libre en jours, côté Play Console), le paywall s'affiche à
// l'ouverture comme avant, et le badge lit la durée dans les données de la boutique
// (src/lib/storeTrial.ts). Deux mécanismes, un par plateforme, chacun honnête sur la sienne.
const PERIODE_GEREE_PAR_APP = Platform.OS === 'ios';

// La date de première ouverture vit dans le TROUSSEAU (Keychain sur iOS), pas dans le stockage
// ordinaire : le stockage ordinaire disparaît avec l'app, et désinstaller-réinstaller remettrait
// le compteur à zéro. Le trousseau iOS survit à la désinstallation. Sur Android il ne survit pas
// — c'est une limite connue, acceptée : le contournement demande un effort que peu feront.
//
// Si le trousseau est indisponible (émulateur, appareil sans écran de verrouillage), on retombe
// sur AsyncStorage plutôt que de refuser la période gratuite.
const KEY = 'tempojump.firstLaunchAt';
// La date la plus tardive jamais vue par l'app : le garde-fou contre l'horloge reculée
// (voir trialStatus). Même double stockage que la date de première ouverture.
const KEY_SEEN = 'tempojump.lastSeenAt';

interface TrialContextValue extends TrialStatus {
  isTrialLoading: boolean;
}

const TrialContext = createContext<TrialContextValue | null>(null);

async function readStamp(key: string): Promise<number | null> {
  try {
    const v = await SecureStore.getItemAsync(key);
    if (v) return Number(v);
  } catch {
    // trousseau indisponible : on tente le stockage ordinaire
  }
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

async function writeStamp(key: string, at: number): Promise<void> {
  const v = String(at);
  try {
    await SecureStore.setItemAsync(key, v);
  } catch {
    // trousseau indisponible
  }
  try {
    await AsyncStorage.setItem(key, v);
  } catch {
    // stockage indisponible : la période repartira à la prochaine ouverture, ce qui est le
    // moindre mal — mieux vaut un mois de trop qu'une app bloquée.
  }
}

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<TrialStatus>({ daysLeft: 0, active: false });
  const [isTrialLoading, setIsTrialLoading] = useState(true);

  useEffect(() => {
    if (!PERIODE_GEREE_PAR_APP) {
      setIsTrialLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const now = Date.now();
      let first = await readStamp(KEY);
      if (!first || !Number.isFinite(first)) {
        first = now;
        await writeStamp(KEY, first);
      }
      // Le repère « plus tard jamais vu » ne recule jamais : on garde le max de ce qui est
      // enregistré, de maintenant et de la première ouverture.
      const seenBefore = (await readStamp(KEY_SEEN)) ?? 0;
      const seen = Math.max(seenBefore, now, first);
      if (seen !== seenBefore) await writeStamp(KEY_SEEN, seen);
      if (!cancelled) {
        setStatus(trialStatus(first, now, seen));
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
