import React from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { SegmentedControl } from '../components/SegmentedControl';
import { UnitSystem } from '../lib/units';
import { FONTS } from '../constants/typography';

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, setLanguage, unitSystem, setUnitSystem, isDarkMode, setIsDarkMode, colors } =
    useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: FONTS.heading }]}>{t('settings.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.closeButton, { color: colors.primary }]}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.units')}</Text>
      <SegmentedControl
        options={[
          { value: 'metric' as UnitSystem, label: t('settings.metric') },
          { value: 'imperial' as UnitSystem, label: t('settings.imperial') },
        ]}
        value={unitSystem}
        onChange={setUnitSystem}
      />

      <View style={styles.darkModeRow}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
          {t('settings.darkMode')}
        </Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.language')}</Text>
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={(item) => item.code}
        style={styles.languageList}
        renderItem={({ item }) => {
          const isActive = item.code === language;
          return (
            <TouchableOpacity
              style={[styles.languageRow, isActive && { backgroundColor: colors.card }]}
              onPress={() => setLanguage(item.code)}
            >
              <Text style={[styles.languageText, { color: colors.text }]}>{item.nativeName}</Text>
              {isActive ? <Text style={{ color: colors.primary }}>✓</Text> : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 4,
  },
  darkModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageList: {
    marginTop: 4,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  languageText: {
    fontSize: 15,
  },
});
