import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ResultCardProps {
  title: string;
  rows: { label: string; value: string; emphasis?: boolean }[];
}

export function ResultCard({ title, rows }: ResultCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={[styles.rowValue, row.emphasis && styles.rowValueEmphasis]}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f8f5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe8de',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f6f4f',
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
    color: '#444',
  },
  rowValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  rowValueEmphasis: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f6f4f',
  },
});
