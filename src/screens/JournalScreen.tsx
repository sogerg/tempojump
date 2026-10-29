import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, I18nManager, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSettings } from '../context/SettingsContext';
import { copyToPersistentStorage, loadJournalEntries, saveJournalEntries } from '../lib/storage';
import { remuxToFastStart } from '../lib/mp4Faststart';
import { dateLisible, dateLocaleIso, decalerJours } from '../lib/dates';
import { JournalEntry } from '../types';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { onSessionLogged } from '../lib/rating';
import { ChevronLeft, ChevronRight, FolderOpen, Pencil, Plus, Save, Share2, Trash2, Video, X } from 'lucide-react-native';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView style={styles.video} player={player} nativeControls />;
}

export function JournalScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useSettings();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [date, setDate] = useState(() => dateLocaleIso());
  const [ranking, setRanking] = useState('');
  const [feeling, setFeeling] = useState('');
  const [improvement, setImprovement] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // Relu à chaque affichage de l'onglet : une fiche peut avoir été créée depuis une reco (1.1).
  useFocusEffect(
    useCallback(() => {
      loadJournalEntries().then(setEntries);
    }, [])
  );

  const resetForm = () => {
    setName('');
    setDate(dateLocaleIso());
    setRanking('');
    setFeeling('');
    setImprovement('');
    setNotes('');
    setVideoUri(null);
    setEditingId(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setName(entry.name);
    setDate(entry.date);
    setRanking(entry.ranking ?? '');
    setFeeling(entry.feeling ?? '');
    setImprovement(entry.improvement ?? '');
    setNotes(entry.notes ?? '');
    setVideoUri(entry.videoUri ?? null);
    setIsAdding(true);
  };

  const handleShareEntry = async (entry: JournalEntry) => {
    // Libellé + valeur avec la ponctuation de la langue (« Classement : » en français, « Ranking: » ailleurs).
    const sep = i18n.language === 'fr' ? ' : ' : ['ja', 'zh'].includes(i18n.language) ? '：' : ': ';
    const lines = [entry.name, dateLisible(entry.date, i18n.language)];
    if (entry.ranking) lines.push(`${t('journal.rankingLabel')}${sep}${entry.ranking}`);
    if (entry.feeling) lines.push(`${t('journal.feelingLabel')}${sep}${entry.feeling}`);
    if (entry.improvement) lines.push(`${t('journal.improvementLabel')}${sep}${entry.improvement}`);
    if (entry.notes) lines.push(entry.notes);
    await Share.share({ message: lines.join('\n') });

    if (entry.videoUri) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(entry.videoUri, {
          mimeType: 'video/mp4',
          UTI: 'public.mpeg-4',
          dialogTitle: entry.name,
        });
      }
    }
  };

  const pickVideo = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });

    if (result.canceled) return;
    const persistentUri = copyToPersistentStorage(result.assets[0].uri, `journal-${generateId()}.mp4`);
    remuxToFastStart(persistentUri);
    setVideoUri(persistentUri);
  };

  const handleSaveEntry = async () => {
    if (!name.trim()) {
      Alert.alert(t('journal.missingNameTitle'));
      return;
    }
    const entry: JournalEntry = {
      id: editingId ?? generateId(),
      name: name.trim(),
      date,
      videoUri: videoUri ?? undefined,
      ranking: ranking.trim() || undefined,
      feeling: feeling.trim() || undefined,
      improvement: improvement.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    const next = editingId ? entries.map((e) => (e.id === editingId ? entry : e)) : [entry, ...entries];
    setEntries(next);
    await saveJournalEntries(next);
    // Avis in-app : une nouvelle séance notée au carnet (pas une simple retouche).
    if (!editingId) onSessionLogged();
    resetForm();
    setIsAdding(false);
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(t('journal.deleteConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const next = entries.filter((e) => e.id !== id);
          setEntries(next);
          await saveJournalEntries(next);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
      <IntroCard title={t('journal.title')} subtitle={t('journal.subtitle')} />

      {entries.map((entry) => (
        <View key={entry.id} style={[styles.entryCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.entryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.entryName, { color: colors.text }]}>{entry.name}</Text>
              <Text style={[styles.entryDate, { color: colors.textMuted }]}>{dateLisible(entry.date, i18n.language)}</Text>
            </View>
            <View style={styles.entryActions}>
              <TouchableOpacity onPress={() => handleShareEntry(entry)} style={styles.entryActionButton}>
                <Share2 size={15} color={colors.accentGold} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEditEntry(entry)} style={styles.entryActionButton}>
                <Pencil size={15} color={colors.accentGold} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={styles.entryActionButton}>
                <Trash2 size={15} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>

          {entry.ranking ? (
            <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 4 }}>
              {t('journal.rankingLabel')} : {entry.ranking}
            </Text>
          ) : null}
          {entry.feeling ? (
            <Text style={{ color: colors.text, marginTop: 4 }}>
              <Text style={{ fontWeight: '600' }}>{t('journal.feelingLabel')} : </Text>
              {entry.feeling}
            </Text>
          ) : null}
          {entry.improvement ? (
            <Text style={{ color: colors.text, marginTop: 4 }}>
              <Text style={{ fontWeight: '600' }}>{t('journal.improvementLabel')} : </Text>
              {entry.improvement}
            </Text>
          ) : null}
          {entry.notes ? <Text style={{ color: colors.textMuted, marginTop: 4 }}>{entry.notes}</Text> : null}
          {entry.videoUri ? (
            <View style={styles.videoWrapper}>
              <VideoPreview uri={entry.videoUri} />
            </View>
          ) : null}
        </View>
      ))}

      {isAdding ? (
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t('journal.nameLabel')}
            placeholderTextColor={colors.placeholder}
          />
          {/* Date en toutes lettres + veille / lendemain (plus de saisie libre en AAAA-MM-JJ, S24 17/10/2026). */}
          <View style={[styles.input, styles.dateRow, { borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setDate((d) => decalerJours(d, -1))} accessibilityRole="button" accessibilityLabel={t('journal.dayBefore')} hitSlop={10}>
              {I18nManager.isRTL ? <ChevronRight size={22} color={colors.accentGold} /> : <ChevronLeft size={22} color={colors.accentGold} />}
            </TouchableOpacity>
            <Text style={[styles.dateText, { color: colors.text }]}>{dateLisible(date, i18n.language)}</Text>
            <TouchableOpacity onPress={() => setDate((d) => decalerJours(d, 1))} accessibilityRole="button" accessibilityLabel={t('journal.dayAfter')} hitSlop={10}>
              {I18nManager.isRTL ? <ChevronLeft size={22} color={colors.accentGold} /> : <ChevronRight size={22} color={colors.accentGold} />}
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={ranking}
            onChangeText={setRanking}
            placeholder={t('journal.rankingLabel')}
            placeholderTextColor={colors.placeholder}
          />
          <TextInput
            style={[styles.input, styles.notesInput, { borderColor: colors.border, color: colors.text }]}
            value={feeling}
            onChangeText={setFeeling}
            placeholder={t('journal.feelingLabel')}
            placeholderTextColor={colors.placeholder}
            multiline
          />
          <TextInput
            style={[styles.input, styles.notesInput, { borderColor: colors.border, color: colors.text }]}
            value={improvement}
            onChangeText={setImprovement}
            placeholder={t('journal.improvementLabel')}
            placeholderTextColor={colors.placeholder}
            multiline
          />
          <TextInput
            style={[styles.input, styles.notesInput, { borderColor: colors.border, color: colors.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('journal.notesLabel')}
            placeholderTextColor={colors.placeholder}
            multiline
          />

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: colors.primary }]}
              onPress={() => pickVideo('camera')}
            >
              <Video size={16} color={colors.iconGoldActive} />
              <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{t('journal.recordVideo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: colors.segmentBackground }]}
              onPress={() => pickVideo('library')}
            >
              <FolderOpen size={16} color={colors.accentGold} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('journal.pickVideo')}</Text>
            </TouchableOpacity>
          </View>
          {videoUri ? <Text style={{ color: colors.textMuted, marginTop: 6 }}>{t('journal.videoAttached')}</Text> : null}

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSaveEntry}>
            <Save size={16} color={colors.iconGoldActive} />
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{t('journal.saveEntry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.segmentBackground }]}
            onPress={() => {
              resetForm();
              setIsAdding(false);
            }}
          >
            <X size={16} color={colors.accentGold} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => setIsAdding(true)}>
          <Plus size={16} color={colors.iconGoldActive} />
          <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{t('journal.addEntry')}</Text>
        </TouchableOpacity>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryDate: {
    fontSize: 12,
    marginTop: 2,
  },
  videoWrapper: {
    marginTop: 10,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  form: {
    marginTop: 10,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { flex: 1, textAlign: 'center', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  videoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryActionButton: {
    padding: 8,
  },
});
