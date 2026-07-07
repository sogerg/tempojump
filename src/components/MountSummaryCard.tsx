import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { GOLD_ICON_GRADIENT } from '../constants/colors';
import { formatLength } from '../lib/units';

export function MountSummaryCard() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { selectedHorse } = useHorses();
  const { colors, unitSystem } = useSettings();

  return (
    <View style={[styles.card, { backgroundColor: colors.segmentBackground, borderColor: colors.cardBorder }]}>
      <View style={styles.info}>
        <Image source={require('../../assets/horse-head-icon.png')} style={styles.icon} resizeMode="contain" />
        <View style={styles.textBlock}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {selectedHorse ? selectedHorse.name : t('converter.hintNoMount')}
          </Text>
          {selectedHorse ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {t(`categories.${selectedHorse.category}`)} · {formatLength(selectedHorse.strideLength, unitSystem)}
            </Text>
          ) : null}
        </View>
      </View>
      <LinearGradient
        colors={GOLD_ICON_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.selectButtonBorder}
      >
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Montures' as never)}
        >
          <Text style={[styles.selectButtonText, { color: colors.primaryText }]}>{t('horsePicker.selectButton')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  icon: {
    width: 34,
    height: 34,
  },
  textBlock: {
    marginLeft: 12,
    flexShrink: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  selectButtonBorder: {
    borderRadius: 20,
    padding: 1.5,
  },
  selectButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    minWidth: 116,
    alignItems: 'center',
    borderRadius: 18.5,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
