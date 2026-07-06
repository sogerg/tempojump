import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { MountPicker } from '../components/MountPicker';
import { useProfiles } from '../context/ProfilesContext';
import { DEFAULT_FIXED_ALLOWANCE, SPEED_LABELS, TERRAIN_LABELS } from '../constants/mountDefaults';
import { stepsToStrides } from '../lib/strideCalculator';
import { SpeedLevel, Terrain } from '../types';

export function ConverterScreen() {
  const { selectedMount, riderStepLength } = useProfiles();
  const [humanSteps, setHumanSteps] = useState('');
  const [terrain, setTerrain] = useState<Terrain>('Plat');
  const [speed, setSpeed] = useState<SpeedLevel>('Standard');

  const result = useMemo(() => {
    const steps = Number(humanSteps.replace(',', '.'));
    if (!selectedMount || !steps || steps <= 0) return null;
    const fixedAllowance = DEFAULT_FIXED_ALLOWANCE[selectedMount.category];
    return stepsToStrides(steps, riderStepLength, selectedMount, fixedAllowance, { terrain, speed });
  }, [humanSteps, selectedMount, riderStepLength, terrain, speed]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Convertisseur pas → foulées</Text>
      <Text style={styles.subheading}>
        Entre le nombre de pas comptés entre deux obstacles pour obtenir le nombre de foulées théoriques.
      </Text>

      <MountPicker />

      <NumberField
        label="Nombre de pas comptés"
        value={humanSteps}
        onChangeText={setHumanSteps}
        placeholder="ex : 24"
      />

      <Text style={styles.sectionLabel}>Terrain</Text>
      <SegmentedControl
        options={(Object.keys(TERRAIN_LABELS) as Terrain[]).map((t) => ({
          value: t,
          label: TERRAIN_LABELS[t],
        }))}
        value={terrain}
        onChange={setTerrain}
      />

      <View style={{ height: 14 }} />

      <Text style={styles.sectionLabel}>Vitesse</Text>
      <SegmentedControl
        options={(Object.keys(SPEED_LABELS) as SpeedLevel[]).map((s) => ({
          value: s,
          label: SPEED_LABELS[s],
        }))}
        value={speed}
        onChange={setSpeed}
      />

      <View style={{ height: 20 }} />

      {result ? (
        <ResultCard
          title="Résultat"
          rows={[
            { label: 'Distance parcourue', value: `${result.distanceMeters.toFixed(2)} m` },
            { label: 'Foulée effective', value: `${result.strideLength.toFixed(2)} m` },
            { label: 'Foulées théoriques', value: result.theoreticalStrides.toFixed(2) },
            {
              label: 'Foulées conseillées',
              value: `${result.suggestedStrides}`,
              emphasis: true,
            },
          ]}
        />
      ) : (
        <Text style={styles.hint}>
          {selectedMount ? 'Renseigne le nombre de pas pour voir le résultat.' : 'Sélectionne ou crée une monture.'}
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
