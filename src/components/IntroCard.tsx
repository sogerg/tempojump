import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';
import { FONTS } from '../constants/typography';

interface IntroCardProps {
  title: string;
  subtitle?: string;
}

export function IntroCard({ title, subtitle }: IntroCardProps) {
  const { colors } = useSettings();

  return (
    <LinearGradient
      colors={[colors.introGradientStart, colors.introGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: colors.cardBorder }]}
    >
      <Text
        style={[styles.title, { color: colors.text, fontFamily: FONTS.heading }, !subtitle && { marginBottom: 0 }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {title}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
});
