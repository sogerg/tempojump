import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_WITHERS_HEIGHT } from '../constants/horseDefaults';

export function HorsesScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const { horses, selectedHorseId, selectHorse, addHorse, removeHorse } = useHorses();

  const [newName, setNewName] = useState('');
  const [newWithersHeight, setNewWithersHeight] = useState(String(DEFAULT_WITHERS_HEIGHT));

  const handleAddHorse = async () => {
    const withersHeight = Number(newWithersHeight.replace(',', '.'));
    if (!newName.trim() || !withersHeight || withersHeight <= 0) {
      Alert.alert(t('mounts.missingFieldsTitle'), t('mounts.missingFieldsMessage'));
      return;
    }
    await addHorse({ name: newName.trim(), withersHeight });
    setNewName('');
    setNewWithersHeight(String(DEFAULT_WITHERS_HEIGHT));
  };

  const handleRemoveHorse = (id: string, name: string) => {
    Alert.alert(t('mounts.deleteConfirmTitle'), t('mounts.deleteConfirmMessage', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeHorse(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
      <IntroCard title={t('mounts.title')} />

      {horses.map((horse) => {
        const isActive = horse.id === selectedHorseId;
        return (
          <View
            key={horse.id}
            style={[
              styles.horseCard,
              { borderColor: isActive ? colors.primary : colors.border, backgroundColor: isActive ? colors.card : colors.surface },
            ]}
          >
            <TouchableOpacity style={styles.horseInfo} onPress={() => selectHorse(horse.id)}>
              <Text style={[styles.horseName, { color: colors.text }]}>{horse.name}</Text>
              <Text style={[styles.horseMeta, { color: colors.textMuted }]}>
                {t('mounts.withersHeightLabel')} : {horse.withersHeight} cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveHorse(horse.id, horse.name)}>
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

      <NumberField
        label={t('mounts.withersHeightLabel')}
        value={newWithersHeight}
        onChangeText={setNewWithersHeight}
        suffix="cm"
      />

      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleAddHorse}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t('mounts.addButton')}</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
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
  horseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  horseInfo: {
    flex: 1,
  },
  horseName: {
    fontSize: 15,
    fontWeight: '600',
  },
  horseMeta: {
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
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
