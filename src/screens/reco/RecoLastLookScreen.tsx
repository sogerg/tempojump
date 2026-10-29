import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { X } from 'lucide-react-native';
import { useHorses } from '../../context/HorseContext';
import { useSettings } from '../../context/SettingsContext';
import { CourseWalk } from '../../lib/reco';
import { vueReco } from '../../lib/recoVue';
import { loadCourseWalks } from '../../lib/storage';
import { DEFAULT_WITHERS_HEIGHT } from '../../constants/horseDefaults';

/**
 * Fiche « dernier regard » (cahier §3.6) : plein écran, gros caractères, contraste maximal (blanc
 * sur noir), pour le paddock juste avant d'entrer en piste. Écran gardé allumé.
 */
export function RecoLastLookScreen() {
  useKeepAwake();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { walkId, horseId } = (route.params ?? {}) as { walkId?: string; horseId?: string };
  const insets = useSafeAreaInsets();
  const { unitSystem } = useSettings();
  const { horses } = useHorses();
  const [walk, setWalk] = useState<CourseWalk | null>(null);

  useEffect(() => {
    loadCourseWalks().then((walks) => setWalk(walks.find((w) => w.id === walkId) ?? null));
  }, [walkId]);

  const horse = useMemo(
    () =>
      horses.find((h) => h.id === (horseId ?? walk?.horseId)) ??
      horses[0] ?? { id: '', name: '', withersHeight: DEFAULT_WITHERS_HEIGHT },
    [horses, horseId, walk?.horseId]
  );
  const vue = useMemo(() => (walk ? vueReco(walk, horse, unitSystem, t) : null), [walk, horse, unitSystem, t]);

  return (
    <View style={[styles.fond, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.entete}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titre}>{walk?.eventName ?? t('reco.untitled')}</Text>
          <Text style={styles.sousTitre}>
            {horse.name}
            {vue ? ` · ${vue.temps}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.fermer}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <X size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.liste}>
        {vue?.lignes.map((l) => (
          <View key={l.id} style={styles.ligne}>
            <View style={styles.ligneHaut}>
              <Text style={styles.numero}>{l.intervalle}</Text>
              <Text style={styles.foulees}>{l.contrat ?? l.conseillees ?? ''}</Text>
            </View>
            {l.signal && l.signal.niveau !== 'juste' ? <Text style={styles.alerte}>{l.signal.texte}</Text> : null}
            {l.contrat && l.conseillees && l.contrat !== l.conseillees ? (
              <Text style={styles.detail}>{t('reco.suggestedShort', { value: l.conseillees })}</Text>
            ) : null}
            {l.note ? <Text style={styles.note}>{l.note}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: '#000000', paddingHorizontal: 18 },
  entete: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  titre: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  sousTitre: { color: '#FFE08A', fontSize: 20, fontWeight: '600', marginTop: 2 },
  fermer: { padding: 10 },
  liste: { paddingBottom: 40 },
  ligne: { borderBottomWidth: 1, borderBottomColor: '#444444', paddingVertical: 12 },
  ligneHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  numero: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  foulees: { color: '#FFE08A', fontSize: 30, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  alerte: { color: '#FF8A7A', fontSize: 20, fontWeight: '700', marginTop: 4 },
  detail: { color: '#DDDDDD', fontSize: 18, marginTop: 2 },
  note: { color: '#FFFFFF', fontSize: 22, marginTop: 4 },
});
