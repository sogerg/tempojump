import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { MountPicker } from '../components/MountPicker';
import { useProfiles } from '../context/ProfilesContext';
import { DEFAULT_FIXED_ALLOWANCE, OBSTACLE_TYPES } from '../constants/mountDefaults';
import { combinationDistance } from '../lib/strideCalculator';
import { ObstacleType } from '../types';

const STRIDE_OPTIONS = [0, 1, 2, 3];
const STRIDE_LABELS: Record<number, string> = {
  0: 'Saut de puce',
  1: '1 foulée',
  2: '2 foulées',
  3: '3 foulées',
};

export function CombinationScreen() {
  const { selectedMount } = useProfiles();
  const [from, setFrom] = useState<ObstacleType>('Vertical');
  const [to, setTo] = useState<ObstacleType>('Vertical');
  const [height, setHeight] = useState('1.10');
  const [targetStrides, setTargetStrides] = useState(1);

  const result = useMemo(() => {
    if (!selectedMount) return null;
    const heightMeters = Number(height.replace(',', '.'));
    if (!heightMeters || heightMeters <= 0) return null;
    const fixedAllowance = DEFAULT_FIXED_ALLOWANCE[selectedMount.category];
    return combinationDistance(
      targetStrides,
      from,
      to,
      heightMeters,
      selectedMount,
      fixedAllowance,
      { terrain: 'Plat', speed: 'Standard' }
    );
  }, [selectedMount, height, from, to, targetStrides]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Calculateur de combinaisons</Text>
      <Text style={styles.subheading}>
        Distance exacte à poser entre deux éléments d'une combinaison (double, triple).
      </Text>

      <MountPicker />

      <Text style={styles.sectionLabel}>1er élément (appel)</Text>
      <SegmentedControl
        options={OBSTACLE_TYPES.map((t) => ({ value: t, label: t }))}
        value={from}
        onChange={setFrom}
      />

      <View style={{ height: 14 }} />

      <Text style={styles.sectionLabel}>2e élément (réception)</Text>
      <SegmentedControl
        options={OBSTACLE_TYPES.map((t) => ({ value: t, label: t }))}
        value={to}
        onChange={setTo}
      />

      <View style={{ height: 14 }} />

      <NumberField label="Hauteur des obstacles" value={height} onChangeText={setHeight} suffix="m" />

      <Text style={styles.sectionLabel}>Foulées souhaitées</Text>
      <SegmentedControl
        options={STRIDE_OPTIONS.map((n) => ({ value: String(n), label: STRIDE_LABELS[n] }))}
        value={String(targetStrides)}
        onChange={(v) => setTargetStrides(Number(v))}
      />

      <View style={{ height: 20 }} />

      {result ? (
        <ResultCard
          title="Résultat"
          rows={[
            { label: 'Foulée effective', value: `${result.strideLength.toFixed(2)} m` },
            { label: 'Allocation ajustée', value: `${result.fixedAllowance.toFixed(2)} m` },
            {
              label: 'Distance à poser',
              value: `${result.distanceMeters.toFixed(2)} m`,
              emphasis: true,
            },
          ]}
        />
      ) : (
        <Text style={styles.hint}>
          {selectedMount ? 'Renseigne la hauteur des obstacles.' : 'Sélectionne ou crée une monture.'}
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
