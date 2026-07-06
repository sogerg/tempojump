import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';

const MENU_ITEMS: { route: string; labelKey: string }[] = [
  { route: 'Metronome', labelKey: 'nav.metronome' },
  { route: 'Checklist', labelKey: 'nav.checklist' },
  { route: 'CoursePlan', labelKey: 'nav.coursePlan' },
  { route: 'Journal', labelKey: 'nav.journal' },
];

export function MoreScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const navigation = useNavigation();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('nav.more')}</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate(item.route as never)}
        >
          <Text style={[styles.rowText, { color: colors.text }]}>{t(item.labelKey)}</Text>
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
