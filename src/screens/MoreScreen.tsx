import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { FONTS } from '../constants/typography';
import { AlarmClock, BookOpen, ListChecks, Map } from 'lucide-react-native';

const MENU_ITEMS: {
  route: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { route: 'Metronome', labelKey: 'nav.metronome', icon: AlarmClock },
  { route: 'Checklist', labelKey: 'nav.checklist', icon: ListChecks },
  { route: 'CoursePlan', labelKey: 'nav.coursePlan', icon: Map },
  { route: 'Journal', labelKey: 'nav.journal', icon: BookOpen },
];

export function MoreScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const navigation = useNavigation();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text, fontFamily: FONTS.heading }]}>{t('nav.more')}</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.row, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate(item.route as never)}
        >
          <View style={styles.rowLeft}>
            <item.icon size={20} color={colors.accentGold} />
            <Text style={[styles.rowText, { color: colors.text }]}>{t(item.labelKey)}</Text>
          </View>
          <Text style={{ color: colors.textMuted }}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
