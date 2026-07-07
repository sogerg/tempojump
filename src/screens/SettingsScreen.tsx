import React, { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { useHorses } from '../context/HorseContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { SegmentedControl } from '../components/SegmentedControl';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { formatLength, inputUnitSuffix, toMeters, UnitSystem } from '../lib/units';
import { calibrateStepLength } from '../lib/mathUtils';
import { FONTS } from '../constants/typography';

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, setLanguage, unitSystem, setUnitSystem, isDarkMode, setIsDarkMode, colors } =
    useSettings();
  const { riderStepLength, setRiderStepLength } = useHorses();

  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [calibrationDistance, setCalibrationDistance] = useState('8');
  const [calibrationSteps, setCalibrationSteps] = useState('8');

  const currentLanguageName =
    SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName ?? language;

  const calibrationResultMeters = (() => {
    const distanceRaw = Number(calibrationDistance.replace(',', '.'));
    const steps = Number(calibrationSteps.replace(',', '.'));
    if (!distanceRaw || !steps || distanceRaw <= 0 || steps <= 0) return null;
    const distanceMeters = toMeters(distanceRaw, unitSystem);
    return calibrateStepLength(distanceMeters, steps);
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: FONTS.heading }]}>{t('settings.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.closeButton, { color: colors.primary }]}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.darkModeRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
            {t('settings.darkMode')}
          </Text>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={[styles.menuRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => setIsCalibrationOpen((open) => !open)}
        >
          <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
            {t('mounts.calibrationTitle')}
          </Text>
          <ChevronRight
            size={18}
            color={colors.textMuted}
            style={{ transform: [{ rotate: isCalibrationOpen ? '90deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {isCalibrationOpen ? (
          <View style={styles.collapsibleContent}>
            <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('mounts.calibrationSubtitle')}</Text>

            <NumberField
              label={t('mounts.calibrationDistanceLabel')}
              value={calibrationDistance}
              onChangeText={setCalibrationDistance}
              suffix={inputUnitSuffix(unitSystem)}
            />
            <NumberField
              label={t('mounts.calibrationStepsLabel')}
              value={calibrationSteps}
              onChangeText={setCalibrationSteps}
            />

            {calibrationResultMeters ? (
              <ResultCard
                title={t('mounts.calibrationResultTitle')}
                rows={[
                  { label: t('mounts.riderStepLabel'), value: formatLength(calibrationResultMeters, unitSystem), emphasis: true },
                ]}
              />
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, !calibrationResultMeters && styles.primaryButtonDisabled]}
              disabled={!calibrationResultMeters}
              onPress={() => calibrationResultMeters && setRiderStepLength(calibrationResultMeters)}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t('mounts.saveAsRiderStep')}</Text>
            </TouchableOpacity>

            <ResultCard
              title={t('mounts.currentRiderStepTitle')}
              rows={[{ label: t('mounts.currentRiderStepLabel'), value: formatLength(riderStepLength, unitSystem), emphasis: true }]}
            />
          </View>
        ) : null}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.units')}</Text>
        <SegmentedControl
          options={[
            { value: 'metric' as UnitSystem, label: t('settings.metric') },
            { value: 'imperial' as UnitSystem, label: t('settings.imperial') },
          ]}
          value={unitSystem}
          onChange={setUnitSystem}
        />

        <View style={{ height: 14 }} />

        <TouchableOpacity
          style={[styles.menuRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => setIsLanguageMenuOpen(true)}
        >
          <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
            {t('settings.language')}
          </Text>
          <View style={styles.menuRowValue}>
            <Text style={[styles.menuRowValueText, { color: colors.text }]}>{currentLanguageName}</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isLanguageMenuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsLanguageMenuOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsLanguageMenuOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: FONTS.heading }]}>
              {t('settings.language')}
            </Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              renderItem={({ item }) => {
                const isActive = item.code === language;
                return (
                  <TouchableOpacity
                    style={[styles.languageRow, isActive && { backgroundColor: colors.card }]}
                    onPress={() => {
                      setLanguage(item.code);
                      setIsLanguageMenuOpen(false);
                    }}
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
  content: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 4,
  },
  subheading: {
    fontSize: 13,
    marginBottom: 14,
  },
  collapsibleContent: {
    marginTop: 12,
  },
  darkModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuRowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuRowValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
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
