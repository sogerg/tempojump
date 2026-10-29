import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Footprints, Ruler } from 'lucide-react-native';
import { useHorses } from '../../context/HorseContext';
import { useSettings } from '../../context/SettingsContext';
import { IntroCard } from '../../components/IntroCard';
import { ScreenWatermark } from '../../components/ScreenWatermark';
import { SegmentedControl } from '../../components/SegmentedControl';
import { NumberField } from '../../components/NumberField';
import { BigButton, Chips, HorseChips } from '../../components/reco/RecoParts';
import { calibrateStepLength } from '../../lib/mathUtils';
import { isRiderStepCalibrated, upsertCourseWalk } from '../../lib/storage';
import { VITESSES_BAREME, VITESSE_BAREME, nouvelleReco, vitesseValide } from '../../lib/reco';
import {
  formatLength,
  formatSpeed,
  inputUnitSuffix,
  lireNombre,
  speedToMetersPerMinute,
  speedUnitSuffix,
  toMeters,
} from '../../lib/units';
import { isoler } from '../../lib/bidi';
import { SPEED_METERS_PER_MINUTE } from '../../constants/horseDefaults';
import { SpeedLevel, Terrain } from '../../types';

const TERRAINS: Terrain[] = ['Plat', 'Montant', 'Descendant', 'Lourd'];
const SPEEDS: SpeedLevel[] = ['Standard', 'Elite'];
const LIBRE = 'libre';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RecoStartScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object | undefined>>>();
  const { colors, unitSystem } = useSettings();
  const { horses, selectedHorseId, riderStepLength, setRiderStepLength } = useHorses();

  const [horseId, setHorseId] = useState<string | null>(selectedHorseId ?? horses[0]?.id ?? null);
  const [terrain, setTerrain] = useState<Terrain>('Plat');
  const [speed, setSpeed] = useState<SpeedLevel>('Standard');
  const [bareme, setBareme] = useState<number | typeof LIBRE>(VITESSE_BAREME.defaut);
  const [vitesseLibre, setVitesseLibre] = useState('');
  const [eventName, setEventName] = useState('');
  const [etalonne, setEtalonne] = useState(true);
  const [distanceEtalon, setDistanceEtalon] = useState('');
  const [pasEtalon, setPasEtalon] = useState('');

  useEffect(() => {
    isRiderStepCalibrated().then(setEtalonne);
  }, []);

  const vitesseLibreMpm = speedToMetersPerMinute(lireNombre(vitesseLibre), unitSystem);
  const vitesse = bareme === LIBRE ? vitesseLibreMpm : bareme;
  const vitesseOk = vitesseValide(vitesse);

  const pasMesure = (() => {
    const d = lireNombre(distanceEtalon);
    const n = lireNombre(pasEtalon);
    if (!(d > 0) || !(n > 0)) return null;
    return calibrateStepLength(toMeters(d, unitSystem), n);
  })();

  const horse = horses.find((h) => h.id === horseId) ?? null;

  const commencer = async () => {
    if (!horse || !vitesseOk) return;
    const walk = nouvelleReco({
      id: generateId(),
      date: new Date().toISOString(),
      horse,
      terrain,
      speed,
      speedMetersPerMinute: vitesse,
      longueurPas: riderStepLength,
      eventName,
    });
    await upsertCourseWalk(walk);
    navigation.replace('RecoWalk', { walkId: walk.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IntroCard title={t('reco.startTitle')} subtitle={t('reco.startSubtitle')} />

        {!etalonne ? (
          <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('reco.calibrationNeededTitle')}</Text>
            <Text style={[styles.cardText, { color: colors.text }]}>
              {t('reco.calibrationNeededText', { value: isoler(formatLength(riderStepLength, unitSystem)) })}
            </Text>
            <NumberField
              label={t('mounts.calibrationDistanceLabel')}
              value={distanceEtalon}
              onChangeText={setDistanceEtalon}
              suffix={inputUnitSuffix(unitSystem)}
            />
            <NumberField label={t('mounts.calibrationStepsLabel')} value={pasEtalon} onChangeText={setPasEtalon} />
            {pasMesure ? (
              <Text style={[styles.cardText, { color: colors.text, fontWeight: '700' }]}>
                {t('reco.measuredStep', { value: isoler(formatLength(pasMesure, unitSystem)) })}
              </Text>
            ) : null}
            <BigButton
              label={t('mounts.saveAsRiderStep')}
              icon={Ruler}
              disabled={!pasMesure}
              onPress={async () => {
                if (!pasMesure) return;
                await setRiderStepLength(pasMesure);
                setEtalonne(true);
              }}
            />
          </View>
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {t('reco.stepLengthUsed', { value: isoler(formatLength(riderStepLength, unitSystem)) })}
          </Text>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('horsePicker.label')}</Text>
        <HorseChips horses={horses} value={horseId} onChange={setHorseId} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.terrainLabel')}</Text>
        <SegmentedControl
          options={TERRAINS.map((v) => ({ value: v, label: t(`terrain.${v}`) }))}
          value={terrain}
          onChange={setTerrain}
          columns={2}
        />
        <View style={{ height: 14 }} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('converter.speedLabel')}</Text>
        <SegmentedControl
          options={SPEEDS.map((v) => ({
            value: v,
            label: t(`speed.${v}`, { value: formatSpeed(SPEED_METERS_PER_MINUTE[v], unitSystem) }),
          }))}
          value={speed}
          onChange={setSpeed}
        />
        <View style={{ height: 14 }} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('reco.baremeSpeedLabel')}</Text>
        <Chips<number | typeof LIBRE>
          options={[
            ...VITESSES_BAREME.map((v) => ({ value: v as number, label: isoler(formatSpeed(v, unitSystem)) })),
            { value: LIBRE, label: t('reco.freeSpeed') },
          ]}
          value={bareme}
          onChange={setBareme}
        />
        {bareme === LIBRE ? (
          <>
            <NumberField
              label={t('reco.freeSpeedLabel')}
              value={vitesseLibre}
              onChangeText={setVitesseLibre}
              suffix={speedUnitSuffix(unitSystem)}
            />
            {!vitesseOk && vitesseLibre.trim() ? (
              <Text style={[styles.erreur, { color: colors.danger }]}>
                {t('reco.freeSpeedRange', {
                  min: isoler(formatSpeed(VITESSE_BAREME.min, unitSystem)),
                  max: isoler(formatSpeed(VITESSE_BAREME.max, unitSystem)),
                })}
              </Text>
            ) : null}
          </>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('reco.eventNameLabel')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={eventName}
          onChangeText={setEventName}
          placeholder={t('journal.nameLabel')}
          placeholderTextColor={colors.placeholder}
        />

        <BigButton label={t('reco.begin')} icon={Footprints} onPress={commencer} disabled={!horse || !vitesseOk} tall />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  sectionLabel: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  hint: { fontSize: 13, marginBottom: 14 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  erreur: { fontSize: 13, marginTop: -8, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 6,
  },
});
