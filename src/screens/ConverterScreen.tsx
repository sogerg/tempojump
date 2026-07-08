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
import { stepsToStrides } from '../lib/mathUtils';
import { formatLength, inputUnitSuffix, toMeters } from '../lib/units';
import { SpeedLevel, Terrain } from '../types';
import { ThemeColors } from '../constants/colors';

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
const TERRAIN_PASTELS: Record<Terrain, (colors: ThemeColors) => string> = {
  Plat: (colors) => colors.terrainPastelPlat,
  Montant: (colors) => colors.terrainPastelMontant,
  Descendant: (colors) => colors.terrainPastelDescendant,
  Lourd: (colors) => colors.terrainPastelLourd,
};

export function ConverterScreen() {
  const { t } = useTranslation();
  const { selectedHorse, riderStepLength } = useHorses();
  const { colors, unitSystem } = useSettings();
  const [humanSteps, setHumanSteps] = useState('');
  const [height, setHeight] = useState('1.10');
  const [terrain, setTerrain] = useState<Terrain>('Plat');
  const [speed, setSpeed] = useState<SpeedLevel>('Standard');

  const result = useMemo(() => {
    const steps = Number(humanSteps.replace(',', '.'));
    const rawHeight = Number(height.replace(',', '.'));
    if (!selectedHorse || !steps || steps <= 0 || !rawHeight || rawHeight <= 0) return null;
    const heightMeters = toMeters(rawHeight, unitSystem);
    return stepsToStrides(steps, riderStepLength, selectedHorse, heightMeters, { terrain, speed });
  }, [humanSteps, height, unitSystem, selectedHorse, riderStepLength, terrain, speed]);

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

        <NumberField
          label={t('converter.heightLabel')}
          value={height}
          onChangeText={setHeight}
          suffix={inputUnitSuffix(unitSystem)}
        />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.terrainLabel')}</Text>
        <SegmentedControl
          options={TERRAIN_OPTIONS.map((terrainOption) => ({
            value: terrainOption,
            label: t(`terrain.${terrainOption}`),
            icon: TERRAIN_ICONS[terrainOption],
            inactiveColor: TERRAIN_PASTELS[terrainOption](colors),
          }))}
          value={terrain}
          onChange={setTerrain}
          columns={2}
        />

        <View style={{ height: 14 }} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.speedLabel')}</Text>
        <SegmentedControl
          options={SPEED_OPTIONS.map((speedOption) => ({
            value: speedOption,
            label: t(`speed.${speedOption}`),
            icon: speedOption === 'Elite' ? Zap : undefined,
            inactiveColor: speedOption === 'Elite' ? colors.speedPastelElite : undefined,
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
