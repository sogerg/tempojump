import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTrial } from '../context/TrialContext';

// Une ligne, en haut, pendant la période gratuite. Discrète les trois premières semaines, colorée la
// dernière : l'utilisateur doit savoir que ça finit, sans qu'on le lui crie tous les jours.
const LAST_WEEK = 7;

export function TrialBanner() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const { isPro } = useSubscription();
  const { active, daysLeft } = useTrial();
  const insets = useSafeAreaInsets();

  if (isPro || !active) return null;
  const urgent = daysLeft <= LAST_WEEK;

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + 4, backgroundColor: urgent ? colors.accentGold : colors.card, borderBottomColor: colors.cardBorder },
      ]}
    >
      <Text style={[styles.text, { color: urgent ? colors.primaryText : colors.textMuted }]}>
        {t('trial.banner', { count: daysLeft })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingBottom: 6, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  text: { fontSize: 12, fontWeight: '600' },
});
