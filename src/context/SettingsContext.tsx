import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from '../i18n/languages';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import { UnitSystem } from '../lib/units';

const LANGUAGE_KEY = '@cavalier/language';
const UNIT_SYSTEM_KEY = '@cavalier/unitSystem';
const DARK_MODE_KEY = '@cavalier/darkMode';

interface SettingsContextValue {
  language: string;
  setLanguage: (code: string) => Promise<void>;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => Promise<void>;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => Promise<void>;
  colors: ThemeColors;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState(i18n.language || DEFAULT_LANGUAGE);
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [isDarkMode, setIsDarkModeState] = useState(systemScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedLanguage, storedUnitSystem, storedDarkMode] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_KEY),
        AsyncStorage.getItem(UNIT_SYSTEM_KEY),
        AsyncStorage.getItem(DARK_MODE_KEY),
      ]);

      if (storedLanguage && SUPPORTED_LANGUAGE_CODES.includes(storedLanguage)) {
        setLanguageState(storedLanguage);
        await i18n.changeLanguage(storedLanguage);
      }
      if (storedUnitSystem === 'metric' || storedUnitSystem === 'imperial') {
        setUnitSystemState(storedUnitSystem);
      }
      if (storedDarkMode !== null) {
        setIsDarkModeState(storedDarkMode === 'true');
      }
      setIsLoading(false);
    })();
  }, []);

  const setLanguage = async (code: string) => {
    setLanguageState(code);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  };

  const setUnitSystem = async (system: UnitSystem) => {
    setUnitSystemState(system);
    await AsyncStorage.setItem(UNIT_SYSTEM_KEY, system);
  };

  const setIsDarkMode = async (value: boolean) => {
    setIsDarkModeState(value);
    await AsyncStorage.setItem(DARK_MODE_KEY, String(value));
  };

  const colors = useMemo(() => (isDarkMode ? darkColors : lightColors), [isDarkMode]);

  const value: SettingsContextValue = {
    language,
    setLanguage,
    unitSystem,
    setUnitSystem,
    isDarkMode,
    setIsDarkMode,
    colors,
    isLoading,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
