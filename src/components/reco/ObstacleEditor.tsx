import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';
import { useSettings } from '../../context/SettingsContext';
import { SegmentedControl } from '../SegmentedControl';
import { NumberField } from '../NumberField';
import { CONTRAT_FOULEES, CourseWalkObstacle, HAUTEUR_OBSTACLE, PAS_INTERVALLE } from '../../lib/reco';
import { hauteurInitiale, inputUnitSuffix, lireNombre, toMeters } from '../../lib/units';
import { ObstacleType } from '../../types';
import { isoler } from '../../lib/bidi';

const TYPES: ObstacleType[] = ['Vertical', 'Oxer'];

/** Compteur − valeur + avec de grandes cibles (utilisable en marchant). */
export function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  accessibilityLabelMinus,
  accessibilityLabelPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  accessibilityLabelMinus: string;
  accessibilityLabelPlus: string;
}) {
  const { colors } = useSettings();
  return (
    <View style={styles.stepperBloc}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperButton, { borderColor: colors.border, backgroundColor: colors.segmentBackground }]}
          onPress={onMinus}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabelMinus}
        >
          <Minus size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.stepperValue, { color: colors.text }]}>{value}</Text>
        <TouchableOpacity
          style={[styles.stepperButton, { borderColor: colors.border, backgroundColor: colors.segmentBackground }]}
          onPress={onPlus}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabelPlus}
        >
          <Plus size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type Changement = Partial<Pick<CourseWalkObstacle, 'type' | 'hauteur' | 'pasDepuisPrecedent' | 'contrat' | 'note'>>;

/**
 * Édition d'un obstacle relevé : type, hauteur facultative, pas corrigés (+/−), contrat de foulées,
 * note. Chaque changement est rendu tout de suite à l'écran parent (qui recalcule et enregistre).
 */
export function ObstacleEditor({
  obstacle,
  onChange,
  showSteps = true,
}: {
  obstacle: CourseWalkObstacle;
  onChange: (changement: Changement) => void;
  showSteps?: boolean;
}) {
  const { t } = useTranslation();
  const { colors, unitSystem } = useSettings();
  const [hauteur, setHauteur] = useState(() =>
    obstacle.hauteur ? hauteurInitiale(obstacle.hauteur, unitSystem) : ''
  );
  const [note, setNote] = useState(obstacle.note ?? '');

  // Autre obstacle ou autre unité : on repart de la valeur enregistrée.
  useEffect(() => {
    setHauteur(obstacle.hauteur ? hauteurInitiale(obstacle.hauteur, unitSystem) : '');
    setNote(obstacle.note ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obstacle.id, unitSystem]);

  const changerHauteur = (texte: string) => {
    setHauteur(texte);
    if (!texte.trim()) {
      onChange({ hauteur: undefined });
      return;
    }
    const lu = lireNombre(texte);
    if (!Number.isFinite(lu)) return;
    const metres = toMeters(lu, unitSystem);
    if (metres >= HAUTEUR_OBSTACLE.min && metres <= HAUTEUR_OBSTACLE.max) onChange({ hauteur: metres });
  };
  const hauteurLue = lireNombre(hauteur);
  const hauteurHorsBornes =
    hauteur.trim() !== '' &&
    (!Number.isFinite(hauteurLue) ||
      toMeters(hauteurLue, unitSystem) < HAUTEUR_OBSTACLE.min ||
      toMeters(hauteurLue, unitSystem) > HAUTEUR_OBSTACLE.max);

  const contrat = obstacle.contrat;
  const changerContrat = (delta: number) => {
    const depart = contrat ?? obstacle.foulees ?? CONTRAT_FOULEES.defaut;
    const suivant = contrat === undefined ? depart : depart + delta;
    onChange({ contrat: Math.min(CONTRAT_FOULEES.max, Math.max(CONTRAT_FOULEES.min, suivant)) });
  };

  return (
    <View style={[styles.container, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('reco.typeLabel')}</Text>
      <SegmentedControl
        options={TYPES.map((type) => ({ value: type, label: t(`reco.type${type}`) }))}
        value={obstacle.type}
        onChange={(type) => onChange({ type })}
      />
      <View style={{ height: 12 }} />
      <NumberField
        label={t('reco.heightOptional')}
        value={hauteur}
        onChangeText={changerHauteur}
        suffix={inputUnitSuffix(unitSystem)}
        placeholder={hauteurInitiale(HAUTEUR_OBSTACLE.defaut, unitSystem)}
      />
      {hauteurHorsBornes ? (
        <Text style={[styles.erreur, { color: colors.danger }]}>
          {t('reco.heightRange', {
            min: isoler(hauteurInitiale(HAUTEUR_OBSTACLE.min, unitSystem)),
            max: isoler(hauteurInitiale(HAUTEUR_OBSTACLE.max, unitSystem)),
            unit: isoler(inputUnitSuffix(unitSystem)),
          })}
        </Text>
      ) : null}
      {showSteps ? (
        <Stepper
          label={t('reco.stepsSinceLast')}
          value={String(obstacle.pasDepuisPrecedent)}
          onMinus={() => onChange({ pasDepuisPrecedent: Math.max(PAS_INTERVALLE.min, obstacle.pasDepuisPrecedent - 1) })}
          onPlus={() => onChange({ pasDepuisPrecedent: Math.min(PAS_INTERVALLE.max, obstacle.pasDepuisPrecedent + 1) })}
          accessibilityLabelMinus={t('reco.oneStepLess')}
          accessibilityLabelPlus={t('reco.oneStepMore')}
        />
      ) : null}
      <Stepper
        label={t('exercises.tableTitle')}
        value={contrat === undefined ? t('reco.noContract') : t('exercises.strideCount', { count: contrat })}
        onMinus={() => changerContrat(-1)}
        onPlus={() => changerContrat(1)}
        accessibilityLabelMinus={t('reco.oneStrideLess')}
        accessibilityLabelPlus={t('reco.oneStrideMore')}
      />
      {contrat !== undefined ? (
        <TouchableOpacity onPress={() => onChange({ contrat: undefined })} hitSlop={8}>
          <Text style={[styles.lien, { color: colors.primary }]}>{t('reco.clearContract')}</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={[styles.label, { color: colors.textMuted, marginTop: 12 }]}>{t('journal.notesLabel')}</Text>
      <TextInput
        style={[styles.note, { borderColor: colors.border, color: colors.text }]}
        value={note}
        onChangeText={(texte) => {
          setNote(texte);
          onChange({ note: texte.trim() ? texte : undefined });
        }}
        placeholder={t('reco.notePlaceholder')}
        placeholderTextColor={colors.placeholder}
        multiline
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  erreur: {
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
  },
  stepperBloc: {
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  lien: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  note: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
