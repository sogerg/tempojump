import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { MountSummaryCard } from '../components/MountSummaryCard';
import { IntroCard } from '../components/IntroCard';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_FIXED_ALLOWANCE, EXERCISE_STRIDE_RANGE } from '../constants/horseDefaults';
import { combinationDistance } from '../lib/mathUtils';
import { formatLength, inputUnitSuffix, toMeters } from '../lib/units';

export function ExercisesScreen() {
  const { t } = useTranslation();
  const { selectedHorse } = useHorses();
  const { colors, unitSystem } = useSettings();
  const [height, setHeight] = useState('0.60');

  const rows = useMemo(() => {
    if (!selectedHorse) return null;
    const rawHeight = Number(height.replace(',', '.'));
    if (!rawHeight || rawHeight <= 0) return null;
    const heightMeters = toMeters(rawHeight, unitSystem);
    const fixedAllowance = DEFAULT_FIXED_ALLOWANCE[selectedHorse.category];

    return EXERCISE_STRIDE_RANGE.map((strideCount) => {
      const result = combinationDistance(
        strideCount,
        'Vertical',
        'Vertical',
        heightMeters,
        selectedHorse,
        fixedAllowance,
        { terrain: 'Plat', speed: 'Standard' }
      );
      const label =
        strideCount === 0
          ? t('combination.bounce')
          : t('exercises.strideCount', { count: strideCount });
      return { label, value: formatLength(result.distanceMeters, unitSystem) };
    });
  }, [selectedHorse, height, unitSystem, t]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <IntroCard title={t('exercises.title')} subtitle={t('exercises.subtitle')} />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('horsePicker.label')}</Text>
      <MountSummaryCard />

      <NumberField
        label={t('exercises.heightLabel')}
        value={height}
        onChangeText={setHeight}
        suffix={inputUnitSuffix(unitSystem)}
      />

      <View style={{ height: 10 }} />

      {rows ? (
        <ResultCard title={t('exercises.tableTitle')} rows={rows} />
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {selectedHorse ? t('combination.hintNoHeight') : t('combination.hintNoMount')}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
