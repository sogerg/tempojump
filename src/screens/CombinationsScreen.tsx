import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { HorsePicker } from '../components/HorsePicker';
import { IntroCard } from '../components/IntroCard';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_FIXED_ALLOWANCE, OBSTACLE_TYPES } from '../constants/horseDefaults';
import { combinationDistance } from '../lib/mathUtils';
import { formatLength, inputUnitSuffix, toMeters } from '../lib/units';
import { ObstacleType } from '../types';

const STRIDE_OPTIONS = [0, 1, 2, 3];

export function CombinationsScreen() {
  const { t } = useTranslation();
  const { selectedHorse } = useHorses();
  const { colors, unitSystem } = useSettings();
  const [from, setFrom] = useState<ObstacleType>('Vertical');
  const [to, setTo] = useState<ObstacleType>('Vertical');
  const [height, setHeight] = useState('1.10');
  const [targetStrides, setTargetStrides] = useState(1);

  const strideLabels: Record<number, string> = {
    0: t('combination.bounce'),
    1: t('combination.oneStride'),
    2: t('combination.twoStrides'),
    3: t('combination.threeStrides'),
  };

  const result = useMemo(() => {
    if (!selectedHorse) return null;
    const rawHeight = Number(height.replace(',', '.'));
    if (!rawHeight || rawHeight <= 0) return null;
    const heightMeters = toMeters(rawHeight, unitSystem);
    const fixedAllowance = DEFAULT_FIXED_ALLOWANCE[selectedHorse.category];
    return combinationDistance(
      targetStrides,
      from,
      to,
      heightMeters,
      selectedHorse,
      fixedAllowance,
      { terrain: 'Plat', speed: 'Standard' }
    );
  }, [selectedHorse, height, unitSystem, from, to, targetStrides]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <IntroCard title={t('combination.title')} subtitle={t('combination.subtitle')} />

      <HorsePicker />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('combination.fromLabel')}</Text>
      <SegmentedControl
        options={OBSTACLE_TYPES.map((obstacleType) => ({ value: obstacleType, label: obstacleType }))}
        value={from}
        onChange={setFrom}
      />

      <View style={{ height: 14 }} />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('combination.toLabel')}</Text>
      <SegmentedControl
        options={OBSTACLE_TYPES.map((obstacleType) => ({ value: obstacleType, label: obstacleType }))}
        value={to}
        onChange={setTo}
      />

      <View style={{ height: 14 }} />

      <NumberField
        label={t('combination.heightLabel')}
        value={height}
        onChangeText={setHeight}
        suffix={inputUnitSuffix(unitSystem)}
      />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('combination.targetStridesLabel')}</Text>
      <SegmentedControl
        options={STRIDE_OPTIONS.map((n) => ({ value: String(n), label: strideLabels[n] }))}
        value={String(targetStrides)}
        onChange={(v) => setTargetStrides(Number(v))}
      />

      <View style={{ height: 20 }} />

      {result ? (
        <ResultCard
          title={t('combination.resultTitle')}
          rows={[
            { label: t('combination.effectiveStride'), value: formatLength(result.strideLength, unitSystem) },
            { label: t('combination.adjustedAllowance'), value: formatLength(result.fixedAllowance, unitSystem) },
            {
              label: t('combination.distanceToSet'),
              value: formatLength(result.distanceMeters, unitSystem),
              emphasis: true,
            },
          ]}
        />
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
