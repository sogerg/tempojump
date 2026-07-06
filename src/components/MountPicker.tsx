import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProfiles } from '../context/ProfilesContext';
import { useSettings } from '../context/SettingsContext';
import { formatLength } from '../lib/units';

export function MountPicker() {
  const { t } = useTranslation();
  const { mounts, selectedMountId, selectMount } = useProfiles();
  const { colors, unitSystem } = useSettings();

  if (mounts.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.card }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>{t('mountPicker.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('mountPicker.label')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {mounts.map((mount) => {
          const isActive = mount.id === selectedMountId;
          return (
            <TouchableOpacity
              key={mount.id}
              style={[
                styles.chip,
                { backgroundColor: isActive ? colors.primary : colors.segmentBackground },
              ]}
              onPress={() => selectMount(mount.id)}
            >
              <Text style={[styles.chipText, { color: isActive ? colors.primaryText : colors.text }]}>
                {mount.name}
              </Text>
              <Text style={[styles.chipSubText, { color: isActive ? colors.primaryText : colors.textMuted }]}>
                {t(`categories.${mount.category}`)} · {formatLength(mount.strideLength, unitSystem)}
              </Text>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 120,
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
