import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Copy, Footprints, Trash2 } from 'lucide-react-native';
import { useHorses } from '../../context/HorseContext';
import { useSettings } from '../../context/SettingsContext';
import { IntroCard } from '../../components/IntroCard';
import { ScreenWatermark } from '../../components/ScreenWatermark';
import { BigButton, Chips } from '../../components/reco/RecoParts';
import { CourseWalk, dupliquerReco, trierEtFiltrer } from '../../lib/reco';
import { deleteCourseWalk, loadCourseWalks, upsertCourseWalk } from '../../lib/storage';
import { dateLisible, dateLocaleIso } from '../../lib/dates';
import { formatLength } from '../../lib/units';
import { isoler } from '../../lib/bidi';

const TOUS = '__tous__';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Historique « Recos » : par date, filtrable par cheval ; rouvrir, dupliquer, supprimer. */
export function RecoListScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object | undefined>>>();
  const { colors, unitSystem } = useSettings();
  const { horses } = useHorses();
  const [walks, setWalks] = useState<CourseWalk[]>([]);
  const [filtre, setFiltre] = useState<string>(TOUS);

  useFocusEffect(
    useCallback(() => {
      loadCourseWalks().then(setWalks);
    }, [])
  );

  const liste = trierEtFiltrer(walks, filtre === TOUS ? null : filtre);

  const ouvrir = (w: CourseWalk) =>
    navigation.navigate(w.terminee ? 'RecoSummary' : 'RecoWalk', { walkId: w.id });

  const dupliquer = async (w: CourseWalk) => {
    const copie = dupliquerReco(w, generateId(), new Date().toISOString(), () => generateId());
    setWalks(await upsertCourseWalk(copie));
  };

  const supprimer = (w: CourseWalk) => {
    Alert.alert(t('reco.deleteConfirmTitle'), w.eventName ?? '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => setWalks(await deleteCourseWalk(w.id)),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
        <IntroCard title={t('reco.listTitle')} subtitle={t('reco.listSubtitle')} />
        <BigButton label={t('reco.newWalk')} icon={Footprints} onPress={() => navigation.navigate('RecoStart')} tall />
        <View style={{ height: 16 }} />

        {horses.length > 1 ? (
          <Chips
            options={[{ value: TOUS, label: t('reco.allHorses') }, ...horses.map((h) => ({ value: h.id, label: h.name }))]}
            value={filtre}
            onChange={setFiltre}
          />
        ) : null}

        {liste.length === 0 ? <Text style={[styles.vide, { color: colors.textMuted }]}>{t('reco.empty')}</Text> : null}

        {liste.map((w) => {
          const cheval = horses.find((h) => h.id === w.horseId);
          return (
            <TouchableOpacity
              key={w.id}
              style={[styles.carte, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => ouvrir(w)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.nom, { color: colors.text }]}>{w.eventName ?? t('reco.untitled')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  {dateLisible(dateLocaleIso(new Date(w.date)), i18n.language)}
                  {cheval ? ` · ${cheval.name}` : ''}
                </Text>
                <Text style={{ color: colors.text, fontSize: 14, marginTop: 2 }}>
                  {t('reco.obstaclesCount', { value: isoler(w.obstacles.length) })} ·{' '}
                  {isoler(formatLength(w.longueurTotale, unitSystem))}
                </Text>
                {!w.terminee ? (
                  <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>{t('reco.inProgress')}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => dupliquer(w)}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel={t('reco.duplicate')}
              >
                <Copy size={20} color={colors.accentGold} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => supprimer(w)}
                style={styles.action}
                accessibilityRole="button"
                accessibilityLabel={t('common.delete')}
              >
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  vide: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  nom: { fontSize: 16, fontWeight: '700' },
  action: { padding: 10 },
});
