import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { useProfiles } from '../context/ProfilesContext';
import { CATEGORY_LABELS, CATEGORY_ORDER, DEFAULT_STRIDE_LENGTH } from '../constants/mountDefaults';
import { calibrateStepLength } from '../lib/strideCalculator';
import { MountCategory } from '../types';

export function MountsScreen() {
  const { mounts, selectedMountId, selectMount, addMount, updateMount, removeMount, riderStepLength, setRiderStepLength } =
    useProfiles();

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MountCategory>('Cheval');
  const [newStrideLength, setNewStrideLength] = useState(String(DEFAULT_STRIDE_LENGTH.Cheval));

  const [calibrationDistance, setCalibrationDistance] = useState('');
  const [calibrationSteps, setCalibrationSteps] = useState('10');

  const handleCategoryChange = (category: MountCategory) => {
    setNewCategory(category);
    setNewStrideLength(String(DEFAULT_STRIDE_LENGTH[category]));
  };

  const handleAddMount = async () => {
    const strideLength = Number(newStrideLength.replace(',', '.'));
    if (!newName.trim() || !strideLength || strideLength <= 0) {
      Alert.alert('Champs manquants', 'Renseigne un nom et une longueur de foulée valides.');
      return;
    }
    await addMount({ name: newName.trim(), category: newCategory, strideLength });
    setNewName('');
    setNewCategory('Cheval');
    setNewStrideLength(String(DEFAULT_STRIDE_LENGTH.Cheval));
  };

  const handleRemoveMount = (id: string, name: string) => {
    Alert.alert('Supprimer la monture', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeMount(id) },
    ]);
  };

  const calibrationResult = (() => {
    const distance = Number(calibrationDistance.replace(',', '.'));
    const steps = Number(calibrationSteps.replace(',', '.'));
    if (!distance || !steps || distance <= 0 || steps <= 0) return null;
    return calibrateStepLength(distance, steps);
  })();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Mes montures</Text>

      {mounts.map((mount) => {
        const isActive = mount.id === selectedMountId;
        return (
          <View key={mount.id} style={[styles.mountCard, isActive && styles.mountCardActive]}>
            <TouchableOpacity style={styles.mountInfo} onPress={() => selectMount(mount.id)}>
              <Text style={styles.mountName}>{mount.name}</Text>
              <Text style={styles.mountMeta}>
                {CATEGORY_LABELS[mount.category]} · foulée {mount.strideLength.toFixed(2)} m
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveMount(mount.id, mount.name)}>
              <Text style={styles.deleteLabel}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.sectionHeading}>Ajouter une monture</Text>
      <NumberFieldLikeText label="Nom" value={newName} onChangeText={setNewName} />

      <Text style={styles.sectionLabel}>Catégorie</Text>
      <SegmentedControl
        options={CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        value={newCategory}
        onChange={handleCategoryChange}
      />

      <View style={{ height: 14 }} />

      <NumberField
        label="Longueur de foulée par défaut"
        value={newStrideLength}
        onChangeText={setNewStrideLength}
        suffix="m"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleAddMount}>
        <Text style={styles.primaryButtonText}>Ajouter la monture</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <Text style={styles.sectionHeading}>Étalonnage du pas cavalier</Text>
      <Text style={styles.subheading}>
        Marche un nombre de pas connu sur une distance mesurée pour calculer ta longueur de pas moyenne.
      </Text>

      <NumberField
        label="Distance mesurée"
        value={calibrationDistance}
        onChangeText={setCalibrationDistance}
        placeholder="ex : 7.50"
        suffix="m"
      />
      <NumberField label="Nombre de pas" value={calibrationSteps} onChangeText={setCalibrationSteps} suffix="pas" />

      {calibrationResult ? (
        <ResultCard
          title="Longueur de pas calculée"
          rows={[{ label: 'Pas cavalier', value: `${calibrationResult.toFixed(3)} m`, emphasis: true }]}
        />
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, !calibrationResult && styles.primaryButtonDisabled]}
        disabled={!calibrationResult}
        onPress={() => calibrationResult && setRiderStepLength(calibrationResult)}
      >
        <Text style={styles.primaryButtonText}>Enregistrer comme pas cavalier</Text>
      </TouchableOpacity>

      <ResultCard
        title="Pas cavalier actuel"
        rows={[{ label: 'Longueur de pas', value: `${riderStepLength.toFixed(3)} m`, emphasis: true }]}
      />
    </ScrollView>
  );
}

function NumberFieldLikeText({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.textInputWrapper}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="ex : Voltigeur"
          placeholderTextColor="#999"
        />
      </View>
    </View>
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
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  mountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e5e9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  mountCardActive: {
    borderColor: '#2f6f4f',
    backgroundColor: '#f4f8f5',
  },
  mountInfo: {
    flex: 1,
  },
  mountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mountMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteLabel: {
    fontSize: 12,
    color: '#b3413a',
    fontWeight: '600',
  },
  textInputWrapper: {
    borderWidth: 1,
    borderColor: '#d8dce1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  textInput: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#1a1a1a',
  },
  primaryButton: {
    backgroundColor: '#2f6f4f',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e5e9',
    marginVertical: 10,
  },
});
