import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';
import { GOLD_ICON_GRADIENT } from '../constants/colors';

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
        const iconColor = isActive ? colors.iconGoldActive : colors.accentGold;
        const Icon = option.icon;

        if (!isActive) {
          return (
            <TouchableOpacity key={option.value} style={styles.segment} onPress={() => onChange(option.value)}>
              {Icon ? <Icon size={16} color={iconColor} /> : null}
              <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <LinearGradient
            key={option.value}
            colors={GOLD_ICON_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeSegmentBorder}
          >
            <TouchableOpacity
              style={[styles.segment, styles.activeSegment, { backgroundColor: colors.primary }]}
              onPress={() => onChange(option.value)}
            >
              {Icon ? <Icon size={16} color={iconColor} /> : null}
              <Text style={[styles.label, { color: colors.primaryText }]}>{option.label}</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  activeSegmentBorder: {
    borderRadius: 10,
    padding: 1.5,
  },
  activeSegment: {
    borderRadius: 8.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
