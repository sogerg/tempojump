import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { CHECKLIST_ITEMS } from '../constants/checklistDefaults';
import {
  loadChecklistState,
  loadCustomChecklistItems,
  saveChecklistState,
  saveCustomChecklistItems,
} from '../lib/storage';
import { ChecklistCategory, CustomChecklistItem } from '../types';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';

const SECTIONS: { category: ChecklistCategory; titleKey: string }[] = [
  { category: 'horse', titleKey: 'checklist.sectionHorse' },
  { category: 'rider', titleKey: 'checklist.sectionRider' },
  { category: 'papers', titleKey: 'checklist.sectionPapers' },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChecklistScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<CustomChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState<Record<ChecklistCategory, string>>({
    horse: '',
    rider: '',
    papers: '',
  });

  useEffect(() => {
    (async () => {
      const [storedState, storedCustomItems] = await Promise.all([loadChecklistState(), loadCustomChecklistItems()]);
      setCheckedState(storedState);
      setCustomItems(storedCustomItems);
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

  const addCustomItem = async (category: ChecklistCategory) => {
    const label = newItemText[category].trim();
    if (!label) return;
    const next = [...customItems, { id: generateId(), category, label }];
    setCustomItems(next);
    await saveCustomChecklistItems(next);
    setNewItemText((prev) => ({ ...prev, [category]: '' }));
  };

  const removeCustomItem = async (id: string) => {
    const next = customItems.filter((item) => item.id !== id);
    setCustomItems(next);
    await saveCustomChecklistItems(next);
    const { [id]: _removed, ...restChecked } = checkedState;
    setCheckedState(restChecked);
    await saveChecklistState(restChecked);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
      <IntroCard title={t('checklist.title')} subtitle={t('checklist.subtitle')} />

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

          {customItems
            .filter((item) => item.category === section.category)
            .map((item) => {
              const isChecked = !!checkedState[item.id];
              return (
                <View key={item.id} style={[styles.itemRow, { borderColor: colors.border }]}>
                  <TouchableOpacity style={styles.itemRowMain} onPress={() => toggleItem(item.id)}>
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
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeCustomItem(item.id)} style={styles.deleteCustomButton}>
                    <X size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}

          <View style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { borderColor: colors.border, color: colors.text }]}
              value={newItemText[section.category]}
              onChangeText={(text) => setNewItemText((prev) => ({ ...prev, [section.category]: text }))}
              placeholder={t('checklist.addPlaceholder')}
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={() => addCustomItem(section.category)}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accentGold }]}
              onPress={() => addCustomItem(section.category)}
            >
              <Plus size={18} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.resetButton, { borderColor: colors.danger }]} onPress={resetChecklist}>
        <Text style={[styles.resetButtonText, { color: colors.danger }]}>{t('checklist.resetButton')}</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
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
  itemRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    flexShrink: 1,
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
  },
  deleteCustomButton: {
    padding: 6,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
