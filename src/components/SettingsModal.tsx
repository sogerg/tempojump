import React from 'react';
import { FlatList, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { SegmentedControl } from './SegmentedControl';
import { UnitSystem } from '../lib/units';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { language, setLanguage, unitSystem, setUnitSystem, isDarkMode, setIsDarkMode, colors } =
    useSettings();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
            <TouchableOpacity onPress={onClose}>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
