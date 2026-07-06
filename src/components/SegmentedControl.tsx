import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; icon?: React.ComponentType<{ size?: number; color?: string }> }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.segmentBackground }]}>
      {options.map((option) => {
        const isActive = option.value === value;
        const iconColor = isActive ? colors.primaryText : colors.accentGold;
        const Icon = option.icon;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, isActive && { backgroundColor: colors.primary }]}
            onPress={() => onChange(option.value)}
          >
            {Icon ? <Icon size={16} color={iconColor} /> : null}
            <Text
              style={[styles.label, { color: isActive ? colors.primaryText : colors.text }]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
