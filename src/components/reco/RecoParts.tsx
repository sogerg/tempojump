import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { Horse } from '../../types';

/** Pastilles de choix (cheval, vitesse du barème…), sur plusieurs lignes. */
export function Chips<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const { colors } = useSettings();
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const actif = o.value === value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            style={[styles.chip, { backgroundColor: actif ? colors.primary : colors.segmentBackground }]}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: actif }}
          >
            <Text style={[styles.chipText, { color: actif ? colors.primaryText : colors.text }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function HorseChips({
  horses,
  value,
  onChange,
}: {
  horses: Horse[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return <Chips options={horses.map((h) => ({ value: h.id, label: h.name }))} value={value} onChange={onChange} />;
}

/** Gros bouton d'action (plein ou discret), avec icône. */
export function BigButton({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled,
  tall,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tall?: boolean;
}) {
  const { colors } = useSettings();
  const fond = variant === 'primary' ? colors.primary : variant === 'danger' ? 'transparent' : colors.segmentBackground;
  const texte = variant === 'primary' ? colors.primaryText : variant === 'danger' ? colors.danger : colors.text;
  return (
    <TouchableOpacity
      style={[
        styles.bigButton,
        { backgroundColor: fond, minHeight: tall ? 88 : 52 },
        variant === 'danger' && { borderWidth: 1, borderColor: colors.danger },
        disabled && { opacity: 0.4 },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      {Icon ? <Icon size={tall ? 28 : 18} color={variant === 'primary' ? colors.iconGoldActive : texte} /> : null}
      <Text style={[styles.bigButtonText, { color: texte, fontSize: tall ? 24 : 15 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Liste de choix dans une fenêtre (plan, fiche du carnet). */
export function ChoiceModal({
  visible,
  title,
  options,
  extra,
  onChoose,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { id: string; label: string; detail?: string }[];
  extra?: { label: string; onPress: () => void };
  onChoose: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useSettings();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {options.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[styles.sheetRow, { borderColor: colors.border }]}
                onPress={() => onChoose(o.id)}
              >
                <Text style={[styles.sheetRowText, { color: colors.text }]}>{o.label}</Text>
                {o.detail ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{o.detail}</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {extra ? <BigButton label={extra.label} onPress={extra.onPress} /> : null}
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 15,
  },
  bigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  bigButtonText: {
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  sheetRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sheetRowText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetClose: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
