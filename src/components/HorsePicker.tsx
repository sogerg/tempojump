import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { formatLength } from '../lib/units';
import { HorseshoeIcon } from './icons';

export function HorsePicker() {
  const { t } = useTranslation();
  const { horses, selectedHorseId, selectHorse } = useHorses();
  const { colors, unitSystem } = useSettings();

  if (horses.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.card }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>{t('horsePicker.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('horsePicker.label')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {horses.map((horse) => {
          const isActive = horse.id === selectedHorseId;
          return (
            <TouchableOpacity
              key={horse.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => selectHorse(horse.id)}
            >
              <HorseshoeIcon size={22} color={isActive ? colors.primaryText : colors.accentGold} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.chipText, { color: isActive ? colors.primaryText : colors.text }]}>
                  {horse.name}
                </Text>
                <Text style={[styles.chipSubText, { color: isActive ? colors.primaryText : colors.textMuted }]}>
                  {t(`categories.${horse.category}`)} · {formatLength(horse.strideLength, unitSystem)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  list: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 150,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
  },
});
