import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { CHECKLIST_ITEMS } from '../constants/checklistDefaults';
import { loadChecklistState, saveChecklistState } from '../lib/storage';
import { ChecklistCategory } from '../types';

const SECTIONS: { category: ChecklistCategory; titleKey: string }[] = [
  { category: 'horse', titleKey: 'checklist.sectionHorse' },
  { category: 'rider', titleKey: 'checklist.sectionRider' },
  { category: 'papers', titleKey: 'checklist.sectionPapers' },
];

export function ChecklistScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const stored = await loadChecklistState();
      setCheckedState(stored);
    })();
  }, []);

  const toggleItem = async (id: string) => {
    const next = { ...checkedState, [id]: !checkedState[id] };
    setCheckedState(next);
    await saveChecklistState(next);
  };

  const resetChecklist = async () => {
    setCheckedState({});
    await saveChecklistState({});
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('checklist.title')}</Text>
      <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('checklist.subtitle')}</Text>

      {SECTIONS.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t(section.titleKey)}</Text>
          {CHECKLIST_ITEMS.filter((item) => item.category === section.category).map((item) => {
            const isChecked = !!checkedState[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, { borderColor: colors.border }]}
                onPress={() => toggleItem(item.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.primary, backgroundColor: isChecked ? colors.primary : 'transparent' },
                  ]}
                >
                  {isChecked ? <Text style={[styles.checkmark, { color: colors.primaryText }]}>✓</Text> : null}
                </View>
                <Text
                  style={[
                    styles.itemLabel,
                    { color: isChecked ? colors.textMuted : colors.text },
                    isChecked && styles.itemLabelChecked,
                  ]}
                >
                  {t(`checklist.items.${item.id}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <TouchableOpacity style={[styles.resetButton, { borderColor: colors.danger }]} onPress={resetChecklist}>
        <Text style={[styles.resetButtonText, { color: colors.danger }]}>{t('checklist.resetButton')}</Text>
      </TouchableOpacity>
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
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemLabel: {
    fontSize: 15,
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
  },
  resetButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
