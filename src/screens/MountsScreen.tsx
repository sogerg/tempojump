import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { useProfiles } from '../context/ProfilesContext';
import { useSettings } from '../context/SettingsContext';
import { CATEGORY_ORDER, DEFAULT_STRIDE_LENGTH } from '../constants/mountDefaults';
import { calibrateStepLength } from '../lib/strideCalculator';
import { formatLength, fromMeters, inputUnitSuffix, toMeters } from '../lib/units';
import { MountCategory } from '../types';

export function MountsScreen() {
  const { t } = useTranslation();
  const { colors, unitSystem } = useSettings();
  const { mounts, selectedMountId, selectMount, addMount, removeMount, riderStepLength, setRiderStepLength } =
    useProfiles();

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MountCategory>('Cheval');
  const [newStrideLength, setNewStrideLength] = useState(String(DEFAULT_STRIDE_LENGTH.Cheval));

  const [calibrationDistance, setCalibrationDistance] = useState('');
  const [calibrationSteps, setCalibrationSteps] = useState('10');

  const handleCategoryChange = (category: MountCategory) => {
    setNewCategory(category);
    setNewStrideLength(fromMeters(DEFAULT_STRIDE_LENGTH[category], unitSystem).toFixed(2));
  };

  const handleAddMount = async () => {
    const rawStrideLength = Number(newStrideLength.replace(',', '.'));
    if (!newName.trim() || !rawStrideLength || rawStrideLength <= 0) {
      Alert.alert(t('mounts.missingFieldsTitle'), t('mounts.missingFieldsMessage'));
      return;
    }
    const strideLength = toMeters(rawStrideLength, unitSystem);
    await addMount({ name: newName.trim(), category: newCategory, strideLength });
    setNewName('');
    setNewCategory('Cheval');
    setNewStrideLength(fromMeters(DEFAULT_STRIDE_LENGTH.Cheval, unitSystem).toFixed(2));
  };

  const handleRemoveMount = (id: string, name: string) => {
    Alert.alert(t('mounts.deleteConfirmTitle'), t('mounts.deleteConfirmMessage', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeMount(id) },
    ]);
  };

  const calibrationResultMeters = (() => {
    const distanceRaw = Number(calibrationDistance.replace(',', '.'));
    const steps = Number(calibrationSteps.replace(',', '.'));
    if (!distanceRaw || !steps || distanceRaw <= 0 || steps <= 0) return null;
    const distanceMeters = toMeters(distanceRaw, unitSystem);
    return calibrateStepLength(distanceMeters, steps);
  })();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('mounts.title')}</Text>

      {mounts.map((mount) => {
        const isActive = mount.id === selectedMountId;
        return (
          <View
            key={mount.id}
            style={[
              styles.mountCard,
              { borderColor: isActive ? colors.primary : colors.border, backgroundColor: isActive ? colors.card : colors.surface },
            ]}
          >
            <TouchableOpacity style={styles.mountInfo} onPress={() => selectMount(mount.id)}>
              <Text style={[styles.mountName, { color: colors.text }]}>{mount.name}</Text>
              <Text style={[styles.mountMeta, { color: colors.textMuted }]}>
                {t(`categories.${mount.category}`)} · {formatLength(mount.strideLength, unitSystem)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveMount(mount.id, mount.name)}>
              <Text style={[styles.deleteLabel, { color: colors.danger }]}>{t('mounts.delete')}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('mounts.addTitle')}</Text>
      <View style={{ marginBottom: 14 }}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('mounts.nameLabel')}</Text>
        <View style={[styles.textInputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={newName}
            onChangeText={setNewName}
            placeholder={t('mounts.namePlaceholder')}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('mounts.categoryLabel')}</Text>
      <SegmentedControl
        options={CATEGORY_ORDER.map((c) => ({ value: c, label: t(`categories.${c}`) }))}
        value={newCategory}
        onChange={handleCategoryChange}
      />

      <View style={{ height: 14 }} />

      <NumberField
        label={t('mounts.strideLengthLabel')}
        value={newStrideLength}
        onChangeText={setNewStrideLength}
        suffix={inputUnitSuffix(unitSystem)}
      />

      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleAddMount}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t('mounts.addButton')}</Text>
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('mounts.calibrationTitle')}</Text>
      <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('mounts.calibrationSubtitle')}</Text>

      <NumberField
        label={t('mounts.calibrationDistanceLabel')}
        value={calibrationDistance}
        onChangeText={setCalibrationDistance}
        placeholder="7.50"
        suffix={inputUnitSuffix(unitSystem)}
      />
      <NumberField
        label={t('mounts.calibrationStepsLabel')}
        value={calibrationSteps}
        onChangeText={setCalibrationSteps}
      />

      {calibrationResultMeters ? (
        <ResultCard
          title={t('mounts.calibrationResultTitle')}
          rows={[{ label: t('mounts.riderStepLabel'), value: formatLength(calibrationResultMeters, unitSystem), emphasis: true }]}
        />
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }, !calibrationResultMeters && styles.primaryButtonDisabled]}
        disabled={!calibrationResultMeters}
        onPress={() => calibrationResultMeters && setRiderStepLength(calibrationResultMeters)}
      >
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t('mounts.saveAsRiderStep')}</Text>
      </TouchableOpacity>

      <ResultCard
        title={t('mounts.currentRiderStepTitle')}
        rows={[{ label: t('mounts.currentRiderStepLabel'), value: formatLength(riderStepLength, unitSystem), emphasis: true }]}
      />
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
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  subheading: {
    fontSize: 13,
    marginBottom: 14,
  },
  mountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  mountInfo: {
    flex: 1,
  },
  mountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  mountMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  textInput: {
    paddingVertical: 10,
    fontSize: 16,
  },
  primaryButton: {
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
    fontWeight: '600',
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginVertical: 10,
  },
});
