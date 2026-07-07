import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Droplets, Zap } from 'lucide-react-native';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { MountSummaryCard } from '../components/MountSummaryCard';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_FIXED_ALLOWANCE } from '../constants/horseDefaults';
import { stepsToStrides } from '../lib/mathUtils';
import { formatLength } from '../lib/units';
import { SpeedLevel, Terrain } from '../types';

const PLAT_ICON_RATIO = 501 / 151;
const MONTANT_ICON_RATIO = 1188 / 728;
const DESCENDANT_ICON_RATIO = 1188 / 728;

function PlatIcon({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <Image
      source={require('../../assets/terrain-plat-icon.png')}
      style={{ width: size * PLAT_ICON_RATIO, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
}

function MontantIcon({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <Image
      source={require('../../assets/terrain-montant-icon.png')}
      style={{ width: size * MONTANT_ICON_RATIO, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
}

function DescendantIcon({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <Image
      source={require('../../assets/terrain-descendant-icon.png')}
      style={{ width: size * DESCENDANT_ICON_RATIO, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
}

const TERRAIN_OPTIONS: Terrain[] = ['Plat', 'Montant', 'Descendant', 'Lourd'];
const SPEED_OPTIONS: SpeedLevel[] = ['Standard', 'Elite'];
const TERRAIN_ICONS = { Plat: PlatIcon, Montant: MontantIcon, Descendant: DescendantIcon, Lourd: Droplets };

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
        <IntroCard title={t('converter.title')} subtitle={t('converter.subtitle')} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('horsePicker.label')}</Text>
        <MountSummaryCard />

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
            icon: TERRAIN_ICONS[terrainOption],
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
            icon: speedOption === 'Elite' ? Zap : undefined,
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
    </View>
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
