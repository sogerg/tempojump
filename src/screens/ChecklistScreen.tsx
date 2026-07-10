import React, { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { useHorses } from '../context/HorseContext';
import { CHECKLIST_ITEMS } from '../constants/checklistDefaults';
import {
  loadChecklistState,
  loadCustomChecklistItems,
  loadHorseChecklists,
  saveChecklistState,
  saveCustomChecklistItems,
  saveHorseChecklists,
} from '../lib/storage';
import { CustomChecklistItem, HorseChecklistData } from '../types';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';

const HORSE_ITEMS = CHECKLIST_ITEMS.filter((item) => item.category === 'horse');
const RIDER_ITEMS = CHECKLIST_ITEMS.filter((item) => item.category === 'rider');
const EMPTY_HORSE_DATA: HorseChecklistData = { checkedState: {}, customItems: [] };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ChecklistSectionProps {
  title: string;
  items: { id: string }[];
  getLabel: (id: string) => string;
  customItems: CustomChecklistItem[];
  checkedState: Record<string, boolean>;
  newItemText: string;
  onNewItemTextChange: (text: string) => void;
  onToggle: (id: string) => void;
  onAddCustom: () => void;
  onRemoveCustom: (id: string) => void;
}

function ChecklistSection({
  title,
  items,
  getLabel,
  customItems,
  checkedState,
  newItemText,
  onNewItemTextChange,
  onToggle,
  onAddCustom,
  onRemoveCustom,
}: ChecklistSectionProps) {
  const { t } = useTranslation();
  const { colors } = useSettings();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {items.map((item) => {
        const isChecked = !!checkedState[item.id];
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemRow, { borderColor: colors.border }]}
            onPress={() => onToggle(item.id)}
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
              {getLabel(item.id)}
            </Text>
          </TouchableOpacity>
        );
      })}

      {customItems.map((item) => {
        const isChecked = !!checkedState[item.id];
        return (
          <View key={item.id} style={[styles.itemRow, { borderColor: colors.border }]}>
            <TouchableOpacity style={styles.itemRowMain} onPress={() => onToggle(item.id)}>
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
            <TouchableOpacity onPress={() => onRemoveCustom(item.id)} style={styles.deleteCustomButton}>
              <X size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.addRow}>
        <TextInput
          style={[styles.addInput, { borderColor: colors.border, color: colors.text }]}
          value={newItemText}
          onChangeText={onNewItemTextChange}
          placeholder={t('checklist.addPlaceholder')}
          placeholderTextColor={colors.placeholder}
          onSubmitEditing={onAddCustom}
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accentGold }]} onPress={onAddCustom}>
          <Plus size={18} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ChecklistScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const { horses, selectedHorseId, selectHorse } = useHorses();
  const { width: windowWidth } = useWindowDimensions();
  // Le carrousel a marginHorizontal: -20 pour échapper au padding du parent, donc sa largeur
  // réelle est celle de la fenêtre : les pages doivent faire la même largeur pour que le
  // paging natif (pagingEnabled) calcule des points d'ancrage justes.
  const pageWidth = windowWidth;

  const carouselRef = useRef<ScrollView>(null);
  const hasScrolledToInitialHorse = useRef(false);

  const [riderCheckedState, setRiderCheckedState] = useState<Record<string, boolean>>({});
  const [riderCustomItems, setRiderCustomItems] = useState<CustomChecklistItem[]>([]);
  const [riderNewItemText, setRiderNewItemText] = useState('');

  const [horseChecklists, setHorseChecklists] = useState<Record<string, HorseChecklistData>>({});
  const [horseNewItemText, setHorseNewItemText] = useState<Record<string, string>>({});
  const [carouselHeight, setCarouselHeight] = useState(0);

  useEffect(() => {
    (async () => {
      const [storedRiderState, storedRiderCustomItems, storedHorseChecklists] = await Promise.all([
        loadChecklistState(),
        loadCustomChecklistItems(),
        loadHorseChecklists(),
      ]);
      setRiderCheckedState(storedRiderState);
      setRiderCustomItems(storedRiderCustomItems);
      setHorseChecklists(storedHorseChecklists);
    })();
  }, []);

  // Positionne le carrousel sur le cheval sélectionné une fois la liste des montures chargée.
  useEffect(() => {
    if (hasScrolledToInitialHorse.current || horses.length === 0) return;
    const index = horses.findIndex((horse) => horse.id === selectedHorseId);
    if (index > 0) {
      carouselRef.current?.scrollTo({ x: index * pageWidth, animated: false });
    }
    hasScrolledToInitialHorse.current = true;
  }, [horses, selectedHorseId, pageWidth]);

  const getHorseData = (horseId: string): HorseChecklistData => horseChecklists[horseId] || EMPTY_HORSE_DATA;

  const updateHorseData = async (horseId: string, next: HorseChecklistData) => {
    const nextAll = { ...horseChecklists, [horseId]: next };
    setHorseChecklists(nextAll);
    await saveHorseChecklists(nextAll);
  };

  const toggleRiderItem = async (id: string) => {
    const next = { ...riderCheckedState, [id]: !riderCheckedState[id] };
    setRiderCheckedState(next);
    await saveChecklistState(next);
  };

  const toggleHorseItem = async (horseId: string, id: string) => {
    const data = getHorseData(horseId);
    await updateHorseData(horseId, { ...data, checkedState: { ...data.checkedState, [id]: !data.checkedState[id] } });
  };

  const addRiderCustomItem = async () => {
    const label = riderNewItemText.trim();
    if (!label) return;
    const next = [...riderCustomItems, { id: generateId(), category: 'rider' as const, label }];
    setRiderCustomItems(next);
    await saveCustomChecklistItems(next);
    setRiderNewItemText('');
  };

  const removeRiderCustomItem = async (id: string) => {
    const next = riderCustomItems.filter((item) => item.id !== id);
    setRiderCustomItems(next);
    await saveCustomChecklistItems(next);
    const { [id]: _removed, ...restChecked } = riderCheckedState;
    setRiderCheckedState(restChecked);
    await saveChecklistState(restChecked);
  };

  const addHorseCustomItem = async (horseId: string) => {
    const label = (horseNewItemText[horseId] ?? '').trim();
    if (!label) return;
    const data = getHorseData(horseId);
    const nextCustomItems = [...data.customItems, { id: generateId(), category: 'horse' as const, label }];
    await updateHorseData(horseId, { ...data, customItems: nextCustomItems });
    setHorseNewItemText((prev) => ({ ...prev, [horseId]: '' }));
  };

  const removeHorseCustomItem = async (horseId: string, itemId: string) => {
    const data = getHorseData(horseId);
    const nextCustomItems = data.customItems.filter((item) => item.id !== itemId);
    const { [itemId]: _removed, ...restChecked } = data.checkedState;
    await updateHorseData(horseId, { checkedState: restChecked, customItems: nextCustomItems });
  };

  const resetChecklist = async () => {
    setRiderCheckedState({});
    await saveChecklistState({});
    if (selectedHorseId) {
      await updateHorseData(selectedHorseId, { ...getHorseData(selectedHorseId), checkedState: {} });
    }
  };

  const goToHorse = (index: number) => {
    const horse = horses[index];
    if (!horse) return;
    selectHorse(horse.id);
    carouselRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  };

  const handleCarouselScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const horse = horses[index];
    if (horse && horse.id !== selectedHorseId) {
      selectHorse(horse.id);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
        <IntroCard title={t('checklist.title')} subtitle={t('checklist.subtitle')} />

        {horses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horseSelector}>
            {horses.map((horse, index) => (
              <TouchableOpacity
                key={horse.id}
                style={[
                  styles.horseChip,
                  { backgroundColor: horse.id === selectedHorseId ? colors.primary : colors.segmentBackground },
                ]}
                onPress={() => goToHorse(index)}
              >
                <Text
                  style={{
                    color: horse.id === selectedHorseId ? colors.primaryText : colors.text,
                    fontWeight: '600',
                  }}
                >
                  {horse.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCarouselScrollEnd}
          style={[styles.horseCarousel, carouselHeight ? { height: carouselHeight } : null]}
        >
          {horses.map((horse) => {
            const data = getHorseData(horse.id);
            return (
              <View
                key={horse.id}
                style={[styles.carouselPage, { width: pageWidth }]}
                onLayout={(event) => {
                  const height = event.nativeEvent.layout.height;
                  setCarouselHeight((prev) => Math.max(prev, height));
                }}
              >
                <ChecklistSection
                  title={t('checklist.sectionHorse')}
                  items={HORSE_ITEMS}
                  getLabel={(id) => t(`checklist.items.${id}`)}
                  customItems={data.customItems}
                  checkedState={data.checkedState}
                  newItemText={horseNewItemText[horse.id] ?? ''}
                  onNewItemTextChange={(text) => setHorseNewItemText((prev) => ({ ...prev, [horse.id]: text }))}
                  onToggle={(id) => toggleHorseItem(horse.id, id)}
                  onAddCustom={() => addHorseCustomItem(horse.id)}
                  onRemoveCustom={(id) => removeHorseCustomItem(horse.id, id)}
                />
              </View>
            );
          })}
        </ScrollView>

        <ChecklistSection
          title={t('checklist.sectionRider')}
          items={RIDER_ITEMS}
          getLabel={(id) => t(`checklist.items.${id}`)}
          customItems={riderCustomItems}
          checkedState={riderCheckedState}
          newItemText={riderNewItemText}
          onNewItemTextChange={setRiderNewItemText}
          onToggle={toggleRiderItem}
          onAddCustom={addRiderCustomItem}
          onRemoveCustom={removeRiderCustomItem}
        />

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
  horseSelector: {
    marginBottom: 16,
  },
  horseChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
  },
  horseCarousel: {
    marginHorizontal: -20,
  },
  section: {
    marginBottom: 20,
  },
  carouselPage: {
    paddingHorizontal: 20,
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
