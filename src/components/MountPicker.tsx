import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfiles } from '../context/ProfilesContext';
import { CATEGORY_LABELS } from '../constants/mountDefaults';

export function MountPicker() {
  const { mounts, selectedMountId, selectMount } = useProfiles();

  if (mounts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucune monture enregistrée. Ajoute-en une dans l'onglet Montures.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Monture</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {mounts.map((mount) => {
          const isActive = mount.id === selectedMountId;
          return (
            <TouchableOpacity
              key={mount.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => selectMount(mount.id)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{mount.name}</Text>
              <Text style={[styles.chipSubText, isActive && styles.chipTextActive]}>
                {CATEGORY_LABELS[mount.category]} · {mount.strideLength.toFixed(2)} m
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
    color: '#555',
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
    backgroundColor: '#eef1f4',
    marginRight: 8,
    minWidth: 120,
  },
  chipActive: {
    backgroundColor: '#2f6f4f',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chipSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chipTextActive: {
    color: '#fff',
  },
  empty: {
    padding: 12,
    backgroundColor: '#fdf3ea',
    borderRadius: 10,
    marginBottom: 16,
  },
  emptyText: {
    color: '#8a5a2a',
    fontSize: 13,
  },
});
