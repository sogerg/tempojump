import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { Flag, Pause, Play, Plus, Undo2 } from 'lucide-react-native';
import { useHorses } from '../../context/HorseContext';
import { useSettings } from '../../context/SettingsContext';
import { NumberField } from '../../components/NumberField';
import { BigButton } from '../../components/reco/RecoParts';
import { ObstacleEditor, Stepper } from '../../components/reco/ObstacleEditor';
import {
  CourseWalk,
  PAS_INTERVALLE,
  ajouterObstacle,
  annulerDernier,
  bornerPas,
  calculerIntervalle,
  modifierObstacle,
  pasEnMetres,
  peutAjouterElement,
  recalculer,
} from '../../lib/reco';
import { loadCourseWalks, upsertCourseWalk } from '../../lib/storage';
import { usePodometre } from '../../lib/usePodometre';
import { formatLength, formatNumber, lireNombre } from '../../lib/units';
import { isoler } from '../../lib/bidi';
import { DEFAULT_WITHERS_HEIGHT } from '../../constants/horseDefaults';
import { Horse, ObstacleType } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RecoWalkScreen() {
  useKeepAwake();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();
  const { walkId } = (route.params ?? {}) as { walkId?: string };
  const { colors, unitSystem } = useSettings();
  const { horses } = useHorses();

  const [walk, setWalk] = useState<CourseWalk | null>(null);
  const [enPause, setEnPause] = useState(false);
  const [manuelChoisi, setManuelChoisi] = useState(false);
  const [pasManuels, setPasManuels] = useState('');
  const [correction, setCorrection] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);
  const [dernierType, setDernierType] = useState<ObstacleType>('Vertical');
  // Total du podomètre au dernier appui sur « Obstacle ».
  const pasAuDernier = useRef(0);
  const [, forcerRendu] = useState(0);

  const podo = usePodometre(!enPause);
  const manuel = manuelChoisi || podo.etat === 'refuse' || podo.etat === 'indisponible';

  useEffect(() => {
    loadCourseWalks().then((walks) => setWalk(walks.find((w) => w.id === walkId) ?? null));
  }, [walkId]);

  const horse: Horse = useMemo(
    () =>
      horses.find((h) => h.id === walk?.horseId) ??
      horses[0] ?? { id: walk?.horseId ?? '', name: '', withersHeight: DEFAULT_WITHERS_HEIGHT },
    [horses, walk?.horseId]
  );

  const enregistrer = useCallback(async (suivant: CourseWalk) => {
    setWalk(suivant);
    await upsertCourseWalk(suivant);
  }, []);

  const pasCourant = manuel
    ? bornerPas(Number.isFinite(lireNombre(pasManuels)) ? lireNombre(pasManuels) : 0)
    : bornerPas(podo.total - pasAuDernier.current + correction);

  // Ce que donnerait l'intervalle si on appuyait maintenant sur « Obstacle ».
  const apercu = useMemo(() => {
    if (!walk || walk.obstacles.length === 0) return null;
    const essai = ajouterObstacle(walk, horse, { id: 'apercu', pas: pasCourant, type: 'Vertical', enCombinaison: false });
    return calculerIntervalle(essai.obstacles, essai.obstacles.length - 1, walk.longueurPas, horse, {
      terrain: walk.terrain,
      speed: walk.speed,
    });
  }, [walk, horse, pasCourant]);

  if (!walk) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const relever = async (enCombinaison: boolean) => {
    const pas = manuel ? pasCourant : bornerPas(podo.lire() - pasAuDernier.current + correction);
    const id = generateId();
    const suivant = ajouterObstacle(walk, horse, {
      id,
      pas,
      type: enCombinaison ? walk.obstacles[walk.obstacles.length - 1]?.type ?? dernierType : dernierType,
      enCombinaison,
    });
    pasAuDernier.current = podo.lire();
    setCorrection(0);
    setPasManuels('');
    setSelection(id);
    await enregistrer(suivant);
  };

  const annuler = () => {
    const dernier = walk.obstacles[walk.obstacles.length - 1];
    if (!dernier) return;
    Alert.alert(t('reco.undoConfirmTitle', { numero: isoler(dernier.numero) }), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reco.undoLast'),
        style: 'destructive',
        onPress: async () => {
          const r = annulerDernier(walk, horse);
          // Les pas de l'obstacle retiré reviennent dans le compte en cours.
          if (manuel) setPasManuels(String(r.pasRendus + pasCourant));
          else pasAuDernier.current -= r.pasRendus;
          setSelection(null);
          forcerRendu((n) => n + 1);
          await enregistrer(r.walk);
        },
      },
    ]);
  };

  const terminer = () => {
    Alert.alert(t('reco.finishConfirmTitle'), t('reco.finishConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reco.finish'),
        onPress: async () => {
          const fini = recalculer({ ...walk, pasJusquArrivee: pasCourant, terminee: true }, horse);
          await enregistrer(fini);
          navigation.replace('RecoSummary', { walkId: fini.id });
        },
      },
    ]);
  };

  const etatTexte =
    podo.etat === 'refuse'
      ? t('reco.pedometerDenied')
      : podo.etat === 'indisponible'
        ? t('reco.pedometerUnavailable')
        : podo.etat === 'attente'
          ? t('reco.pedometerWaiting')
          : enPause
            ? t('reco.paused')
            : t('reco.pedometerOn');

  const obstacleChoisi = walk.obstacles.find((o) => o.id === selection) ?? null;
  const dernierNumero = walk.obstacles[walk.obstacles.length - 1]?.numero;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.etat, { color: podo.etat === 'actif' && !enPause ? colors.primary : colors.textMuted }]}>
          {etatTexte}
        </Text>

        <View style={[styles.compteur, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.compteurLabel, { color: colors.textMuted }]}>
            {walk.obstacles.length === 0
              ? t('reco.stepsSinceStart')
              : t('reco.stepsSinceObstacle', { numero: isoler(dernierNumero ?? '') })}
          </Text>
          {manuel ? (
            <NumberField
              label={t('reco.manualStepsLabel')}
              value={pasManuels}
              onChangeText={setPasManuels}
              placeholder={t('converter.stepsPlaceholder')}
            />
          ) : (
            <Text style={[styles.compteurValeur, { color: colors.text }]} accessibilityLiveRegion="polite">
              {pasCourant}
            </Text>
          )}
          <Text style={[styles.compteurDetail, { color: colors.text }]}>
            {isoler(formatLength(pasEnMetres(pasCourant, walk.longueurPas), unitSystem))}
            {apercu
              ? `  ·  ${t('reco.liveStrides', {
                  // Borné à 0 : « -1,0 théoriques » s'affichait à 0 pas (S24, 28/10).
                  theoriques: isoler(formatNumber(Math.max(0, apercu.fouleesTheoriques), 1)),
                  conseillees: t('exercises.strideCount', { count: apercu.fouleesConseillees }),
                })}`
              : ''}
          </Text>
          {!manuel ? (
            <Stepper
              label={t('reco.correction')}
              value={correction > 0 ? `+${correction}` : String(correction)}
              onMinus={() => setCorrection((c) => Math.max(c - 1, -(podo.total - pasAuDernier.current)))}
              onPlus={() => setCorrection((c) => Math.min(c + 1, PAS_INTERVALLE.max))}
              accessibilityLabelMinus={t('reco.oneStepLess')}
              accessibilityLabelPlus={t('reco.oneStepMore')}
            />
          ) : null}
        </View>

        <BigButton label={t('reco.obstacleButton')} onPress={() => relever(false)} tall />
        <BigButton
          label={t('reco.combinationButton')}
          icon={Plus}
          variant="secondary"
          onPress={() => relever(true)}
          disabled={!peutAjouterElement(walk.obstacles)}
        />

        <View style={styles.rangee}>
          <View style={{ flex: 1 }}>
            <BigButton
              label={enPause ? t('reco.resume') : t('reco.pause')}
              icon={enPause ? Play : Pause}
              variant="secondary"
              onPress={() => setEnPause((p) => !p)}
              disabled={manuel}
            />
          </View>
          <View style={{ flex: 1 }}>
            <BigButton
              label={t('reco.undoLast')}
              icon={Undo2}
              variant="secondary"
              onPress={annuler}
              disabled={walk.obstacles.length === 0}
            />
          </View>
        </View>

        {podo.etat === 'actif' ? (
          <View style={styles.manuelRow}>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{t('reco.manualMode')}</Text>
            <Switch value={manuelChoisi} onValueChange={setManuelChoisi} />
          </View>
        ) : null}

        <Text style={[styles.typeHint, { color: colors.textMuted }]}>{t('reco.nextType')}</Text>
        <View style={styles.rangee}>
          {(['Vertical', 'Oxer'] as ObstacleType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                { backgroundColor: dernierType === type ? colors.primary : colors.segmentBackground },
              ]}
              onPress={() => setDernierType(type)}
              accessibilityRole="button"
              accessibilityState={{ selected: dernierType === type }}
            >
              <Text style={{ color: dernierType === type ? colors.primaryText : colors.text, fontWeight: '700', fontSize: 16 }}>
                {t(`reco.type${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {walk.obstacles.length > 0 ? (
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('reco.recorded')}</Text>
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>{t('reco.walkHint')}</Text>
        )}
        {[...walk.obstacles].reverse().map((o) => {
          const choisi = o.id === selection;
          return (
            <TouchableOpacity
              key={o.id}
              style={[
                styles.ligne,
                { borderColor: choisi ? colors.primary : colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => setSelection(choisi ? null : o.id)}
            >
              <Text style={[styles.ligneNumero, { color: colors.text }]}>{isoler(o.numero)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {t(`reco.type${o.type}`)} · {isoler(formatLength(o.distanceMetres, unitSystem))}
                </Text>
                {o.foulees !== undefined ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>
                    {t('exercises.strideCount', { count: o.foulees })}
                    {o.contrat !== undefined ? `  ·  ${t('reco.contractShort', { value: t('exercises.strideCount', { count: o.contrat }) })}` : ''}
                  </Text>
                ) : null}
                {o.note ? <Text style={{ color: colors.textMuted }}>{o.note}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}
        {obstacleChoisi ? (
          <ObstacleEditor
            obstacle={obstacleChoisi}
            onChange={(changement) => enregistrer(modifierObstacle(walk, horse, obstacleChoisi.id, changement))}
          />
        ) : null}

        <BigButton label={t('reco.finish')} icon={Flag} onPress={terminer} disabled={walk.obstacles.length === 0} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 60 },
  etat: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  compteur: { borderWidth: 1, borderRadius: 16, padding: 16 },
  compteurLabel: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  compteurValeur: { fontSize: 64, fontWeight: '800', textAlign: 'center' },
  compteurDetail: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  rangee: { flexDirection: 'row', gap: 10 },
  manuelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  typeHint: { fontSize: 13, marginTop: 14, marginBottom: 6 },
  typeButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: { fontSize: 13, fontWeight: '500', marginTop: 18, marginBottom: 6 },
  hint: { fontSize: 14, lineHeight: 20, marginTop: 18 },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  ligneNumero: { fontSize: 22, fontWeight: '800', minWidth: 44, textAlign: 'center' },
});
