import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

interface ResultCardProps {
  title: string;
  rows: { label: string; value: string; emphasis?: boolean }[];
}

export function ResultCard({ title, rows }: ResultCardProps) {
  const { colors } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
          <Text
            style={[
              styles.rowValue,
              { color: colors.text },
              row.emphasis && [styles.rowValueEmphasis, { color: colors.primary }],
            ]}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValueEmphasis: {
    fontSize: 20,
    fontWeight: '700',
  },
});
