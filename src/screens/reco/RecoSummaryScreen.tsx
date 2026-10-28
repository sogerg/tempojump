import React, { useCallback, useMemo, useState } from 'react';
import { Alert, I18nManager, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BookOpen, Copy, Eye, FileDown, Footprints, MapPin, Printer, Trash2 } from 'lucide-react-native';
import { useHorses } from '../../context/HorseContext';
import { useSettings } from '../../context/SettingsContext';
import { ResultCard } from '../../components/ResultCard';
import { BigButton, ChoiceModal, HorseChips } from '../../components/reco/RecoParts';
import { ObstacleEditor } from '../../components/reco/ObstacleEditor';
import { CourseWalk, dupliquerReco, modifierObstacle } from '../../lib/reco';
import { htmlReco, vueReco } from '../../lib/recoVue';
import {
  deleteCourseWalk,
  loadCoursePlans,
  loadCourseWalks,
  loadJournalEntries,
  saveJournalEntries,
  upsertCourseWalk,
} from '../../lib/storage';
import { dateLisible, dateLocaleIso } from '../../lib/dates';
import { isoler } from '../../lib/bidi';
import { DEFAULT_WITHERS_HEIGHT } from '../../constants/horseDefaults';
import { CoursePlan, Horse, JournalEntry } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RecoSummaryScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();
  const { walkId } = (route.params ?? {}) as { walkId?: string };
  const { colors, unitSystem } = useSettings();
  const { horses } = useHorses();

  const [walk, setWalk] = useState<CourseWalk | null>(null);
  const [vueHorseId, setVueHorseId] = useState<string | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [plans, setPlans] = useState<CoursePlan[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [choixPlan, setChoixPlan] = useState(false);
  const [choixCarnet, setChoixCarnet] = useState(false);

  // Rechargé à chaque retour sur l'écran (plan enregistré, fiche du carnet créée…).
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      (async () => {
        const [walks, p, j] = await Promise.all([loadCourseWalks(), loadCoursePlans(), loadJournalEntries()]);
        if (!actif) return;
        const w = walks.find((x) => x.id === walkId) ?? null;
        setWalk(w);
        setVueHorseId((v) => v ?? w?.horseId ?? null);
        setPlans(p);
        setEntries(j);
      })();
      return () => {
        actif = false;
      };
    }, [walkId])
  );

  const horseDeLaReco: Horse = useMemo(
    () =>
      horses.find((h) => h.id === walk?.horseId) ??
      horses[0] ?? { id: walk?.horseId ?? '', name: '', withersHeight: DEFAULT_WITHERS_HEIGHT },
    [horses, walk?.horseId]
  );
  const horseAffiche = horses.find((h) => h.id === vueHorseId) ?? horseDeLaReco;
  const vue = useMemo(
    () => (walk ? vueReco(walk, horseAffiche, unitSystem, t) : null),
    // i18n.language : relibeller si la langue change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walk, horseAffiche, unitSystem, t, i18n.language]
  );

  if (!walk || !vue) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const enregistrer = async (suivant: CourseWalk) => {
    setWalk(suivant);
    await upsertCourseWalk(suivant);
  };

  const titre = walk.eventName ?? t('reco.untitled');
  const dateTexte = dateLisible(dateLocaleIso(new Date(walk.date)), i18n.language);
  const planLie = plans.find((p) => p.id === walk.planId);
  const ficheLiee = entries.find((e) => e.id === walk.journalEntryId);

  const html = () =>
    htmlReco({
      titre: `${t('reco.pdfTitle')} — ${titre}`,
      infos: [
        [t('reco.dateLabel'), dateTexte],
        [t('horsePicker.label'), horseAffiche.name],
        [t('converter.terrainLabel'), t(`terrain.${walk.terrain}`)],
        [t('reco.baremeSpeedLabel'), vue.vitesse],
        [t('chrono.lengthLabel'), vue.longueur],
        [t('chrono.allowedTimeLabel'), vue.temps],
      ],
      entetes: [
        t('reco.colInterval'),
        t('reco.typeLabel'),
        t('reco.colSteps'),
        t('reco.colDistance'),
        t('converter.theoreticalStrides'),
        t('converter.suggestedStrides'),
        t('exercises.tableTitle'),
        t('journal.notesLabel'),
      ],
      vue,
      rtl: i18n.language === 'ar',
      langue: i18n.language,
    });

  // ⚠️ S24 : contrôler le PDF par « Imprimer → Enregistrer au format PDF », jamais par la feuille de partage.
  const imprimer = async () => {
    try {
      await Print.printAsync({ html: html() });
    } catch {
      Alert.alert(t('reco.pdfError'));
    }
  };

  const partagerPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: html() });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: titre });
      }
    } catch {
      Alert.alert(t('reco.pdfError'));
    }
  };

  const reperes = walk.obstacles.map((o) => o.numero);
  const placerSurPlan = async (planId: string | null) => {
    setChoixPlan(false);
    if (planId) await enregistrer({ ...walk, planId });
    navigation.navigate('CoursePlan', { planId: planId ?? undefined, reperes, walkId: walk.id });
  };

  const lierFiche = async (entryId: string) => {
    setChoixCarnet(false);
    await enregistrer({ ...walk, journalEntryId: entryId });
  };

  const creerFiche = async () => {
    setChoixCarnet(false);
    const entry: JournalEntry = {
      id: generateId(),
      name: titre,
      date: dateLocaleIso(new Date(walk.date)),
    };
    const next = [entry, ...(await loadJournalEntries())];
    await saveJournalEntries(next);
    setEntries(next);
    await enregistrer({ ...walk, journalEntryId: entry.id });
  };

  const dupliquer = async () => {
    const copie = dupliquerReco(walk, generateId(), new Date().toISOString(), () => generateId());
    await upsertCourseWalk(copie);
    navigation.replace('RecoSummary', { walkId: copie.id });
  };

  const supprimer = () => {
    Alert.alert(t('reco.deleteConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteCourseWalk(walk.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const obstacleChoisi = walk.obstacles.find((o) => o.id === selection) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.titre, { color: colors.text }]}>{titre}</Text>
        <Text style={[styles.sousTitre, { color: colors.textMuted }]}>
          {dateTexte} · {t(`terrain.${walk.terrain}`)}
        </Text>

        <ResultCard
          title={t('reco.summaryTitle')}
          rows={[
            { label: t('chrono.lengthLabel'), value: vue.longueur, emphasis: true },
            { label: t('reco.baremeSpeedLabel'), value: vue.vitesse },
            { label: t('chrono.allowedTimeLabel'), value: vue.temps, emphasis: true },
          ]}
        />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('reco.stridesFor')}</Text>
        <HorseChips horses={horses} value={horseAffiche.id} onChange={setVueHorseId} />

        {vue.lignes.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>{t('reco.noObstacles')}</Text>
        ) : null}
        {vue.lignes.map((l) => {
          const choisi = l.id === selection;
          return (
            <TouchableOpacity
              key={l.id}
              style={[styles.ligne, { borderColor: choisi ? colors.primary : colors.border, backgroundColor: colors.surface }]}
              onPress={() => setSelection(choisi ? null : l.id)}
            >
              {/* Intervalle et distance restent de gauche à droite (isolés), même en arabe. */}
              <View style={styles.ligneHaut}>
                <Text style={[styles.intervalle, { color: colors.text }]}>{l.intervalle}</Text>
                <Text style={[styles.distance, { color: colors.text }]}>{l.distance}</Text>
              </View>
              <Text style={{ color: colors.textMuted }}>
                {l.type}
                {l.hauteur ? ` · ${l.hauteur}` : ''} · {t('reco.stepsValue', { value: isoler(l.pas) })}
              </Text>
              {l.conseillees ? (
                <Text style={[styles.foulees, { color: colors.primary }]}>
                  {l.conseillees}
                  {l.theoriques ? `  (${l.theoriques})` : ''}
                </Text>
              ) : null}
              {l.signal ? (
                <Text style={{ color: l.signal.niveau === 'juste' ? colors.primary : colors.danger, fontWeight: '600' }}>
                  {l.signal.texte}
                </Text>
              ) : null}
              {l.contrat ? (
                <Text style={{ color: colors.text }}>{t('reco.contractShort', { value: l.contrat })}</Text>
              ) : null}
              {l.note ? <Text style={{ color: colors.textMuted }}>{l.note}</Text> : null}
            </TouchableOpacity>
          );
        })}
        {vue.arrivee ? (
          <View style={[styles.ligne, styles.ligneHaut, { borderColor: colors.border }]}>
            <Text style={[styles.intervalle, { color: colors.text }]}>{vue.arrivee.intervalle}</Text>
            <Text style={[styles.distance, { color: colors.text }]}>{vue.arrivee.distance}</Text>
          </View>
        ) : null}
        {obstacleChoisi ? (
          <ObstacleEditor
            obstacle={obstacleChoisi}
            onChange={(changement) => enregistrer(modifierObstacle(walk, horseDeLaReco, obstacleChoisi.id, changement))}
          />
        ) : null}

        {!walk.terminee ? (
          <BigButton
            label={t('reco.resumeWalk')}
            icon={Footprints}
            onPress={() => navigation.replace('RecoWalk', { walkId: walk.id })}
          />
        ) : null}
        <BigButton
          label={t('reco.lastLook')}
          icon={Eye}
          onPress={() => navigation.navigate('RecoLastLook', { walkId: walk.id, horseId: horseAffiche.id })}
          tall
        />
        <View style={styles.rangee}>
          <View style={{ flex: 1 }}>
            <BigButton label={t('reco.print')} icon={Printer} variant="secondary" onPress={imprimer} />
          </View>
          <View style={{ flex: 1 }}>
            <BigButton label={t('reco.sharePdf')} icon={FileDown} variant="secondary" onPress={partagerPdf} />
          </View>
        </View>
        <BigButton
          label={t('reco.placeOnPlan')}
          icon={MapPin}
          variant="secondary"
          onPress={() => setChoixPlan(true)}
          disabled={walk.obstacles.length === 0}
        />
        {planLie ? (
          <Text style={[styles.lien, { color: colors.textMuted }]}>{t('reco.linkedPlan', { name: planLie.name })}</Text>
        ) : null}
        <BigButton label={t('reco.linkJournal')} icon={BookOpen} variant="secondary" onPress={() => setChoixCarnet(true)} />
        {ficheLiee ? (
          <TouchableOpacity onPress={() => navigation.navigate('Tabs', { screen: 'Journal' })}>
            <Text style={[styles.lien, { color: colors.primary }]}>
              {t('reco.linkedJournal', { name: ficheLiee.name })} {I18nManager.isRTL ? '‹' : '›'}
            </Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.rangee}>
          <View style={{ flex: 1 }}>
            <BigButton label={t('reco.duplicate')} icon={Copy} variant="secondary" onPress={dupliquer} />
          </View>
          <View style={{ flex: 1 }}>
            <BigButton label={t('common.delete')} icon={Trash2} variant="danger" onPress={supprimer} />
          </View>
        </View>
      </ScrollView>

      <ChoiceModal
        visible={choixPlan}
        title={t('reco.choosePlan')}
        options={plans.map((p) => ({ id: p.id, label: p.name, detail: dateLisible(dateLocaleIso(new Date(p.createdAt)), i18n.language) }))}
        extra={{ label: t('reco.newPlan'), onPress: () => placerSurPlan(null) }}
        onChoose={(id) => placerSurPlan(id)}
        onClose={() => setChoixPlan(false)}
      />
      <ChoiceModal
        visible={choixCarnet}
        title={t('reco.chooseJournalEntry')}
        options={entries.map((e) => ({ id: e.id, label: e.name, detail: dateLisible(e.date, i18n.language) }))}
        extra={{ label: t('reco.newJournalEntry'), onPress: creerFiche }}
        onChoose={lierFiche}
        onClose={() => setChoixCarnet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 60 },
  titre: { fontSize: 22, fontWeight: '700' },
  sousTitre: { fontSize: 14, marginBottom: 14 },
  sectionLabel: { fontSize: 13, fontWeight: '500', marginTop: 18, marginBottom: 6 },
  ligne: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  ligneHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  intervalle: { fontSize: 18, fontWeight: '800' },
  distance: { fontSize: 16, fontWeight: '600' },
  foulees: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  rangee: { flexDirection: 'row', gap: 10 },
  lien: { fontSize: 14, marginTop: 6 },
});
