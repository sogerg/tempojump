import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { HorsePicker } from '../components/HorsePicker';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_FIXED_ALLOWANCE } from '../constants/horseDefaults';
import { stepsToStrides } from '../lib/mathUtils';
import { formatLength } from '../lib/units';
import { SpeedLevel, Terrain } from '../types';

const TERRAIN_OPTIONS: Terrain[] = ['Plat', 'Montant', 'Descendant', 'Lourd'];
const SPEED_OPTIONS: SpeedLevel[] = ['Standard', 'Elite'];

export function ConverterScreen() {
  const { t } = useTranslation();
  const { selectedHorse, riderStepLength } = useHorses();
  const { colors, unitSystem } = useSettings();
  const [humanSteps, setHumanSteps] = useState('');
  const [terrain, setTerrain] = useState<Terrain>('Plat');
  const [speed, setSpeed] = useState<SpeedLevel>('Standard');

  const result = useMemo(() => {
    const steps = Number(humanSteps.replace(',', '.'));
    if (!selectedHorse || !steps || steps <= 0) return null;
    const fixedAllowance = DEFAULT_FIXED_ALLOWANCE[selectedHorse.category];
    return stepsToStrides(steps, riderStepLength, selectedHorse, fixedAllowance, { terrain, speed });
  }, [humanSteps, selectedHorse, riderStepLength, terrain, speed]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('converter.title')}</Text>
      <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('converter.subtitle')}</Text>

      <HorsePicker />

      <NumberField
        label={t('converter.stepsLabel')}
        value={humanSteps}
        onChangeText={setHumanSteps}
        placeholder={t('converter.stepsPlaceholder')}
      />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.terrainLabel')}</Text>
      <SegmentedControl
        options={TERRAIN_OPTIONS.map((terrainOption) => ({
          value: terrainOption,
          label: t(`terrain.${terrainOption}`),
        }))}
        value={terrain}
        onChange={setTerrain}
      />

      <View style={{ height: 14 }} />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.speedLabel')}</Text>
      <SegmentedControl
        options={SPEED_OPTIONS.map((speedOption) => ({
          value: speedOption,
          label: t(`speed.${speedOption}`),
        }))}
        value={speed}
        onChange={setSpeed}
      />

      <View style={{ height: 20 }} />

      {result ? (
        <ResultCard
          title={t('converter.resultTitle')}
          rows={[
            { label: t('converter.distance'), value: formatLength(result.distanceMeters, unitSystem) },
            { label: t('converter.effectiveStride'), value: formatLength(result.strideLength, unitSystem) },
            { label: t('converter.theoreticalStrides'), value: result.theoreticalStrides.toFixed(2) },
            {
              label: t('converter.suggestedStrides'),
              value: `${result.suggestedStrides}`,
              emphasis: true,
            },
          ]}
        />
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {selectedHorse ? t('converter.hintNoSteps') : t('converter.hintNoMount')}
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
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    marginBottom: 20,
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
