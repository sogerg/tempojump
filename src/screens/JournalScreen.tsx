import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSettings } from '../context/SettingsContext';
import { copyToPersistentStorage, loadJournalEntries, saveJournalEntries } from '../lib/storage';
import { JournalEntry } from '../types';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { FolderOpen, Plus, Save, Trash2, Video, X } from 'lucide-react-native';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView style={styles.video} player={player} nativeControls />;
}

export function JournalScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ranking, setRanking] = useState('');
  const [feeling, setFeeling] = useState('');
  const [improvement, setImprovement] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await loadJournalEntries();
      setEntries(stored);
    })();
  }, []);

  const resetForm = () => {
    setName('');
    setDate(new Date().toISOString().slice(0, 10));
    setRanking('');
    setFeeling('');
    setImprovement('');
    setNotes('');
    setVideoUri(null);
  };

  const pickVideo = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.7 });

    if (result.canceled) return;
    const persistentUri = copyToPersistentStorage(result.assets[0].uri, `journal-${generateId()}.mp4`);
    setVideoUri(persistentUri);
  };

  const handleSaveEntry = async () => {
    if (!name.trim()) {
      Alert.alert(t('journal.missingNameTitle'));
      return;
    }
    const entry: JournalEntry = {
      id: generateId(),
      name: name.trim(),
      date,
      videoUri: videoUri ?? undefined,
      ranking: ranking.trim() || undefined,
      feeling: feeling.trim() || undefined,
      improvement: improvement.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    const next = [entry, ...entries];
    setEntries(next);
    await saveJournalEntries(next);
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
              <Text style={[styles.entryDate, { color: colors.textMuted }]}>{entry.date}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={styles.deleteRow}>
              <Trash2 size={15} color={colors.iconGoldActive} />
              <Text style={{ color: colors.danger, fontWeight: '600' }}>{t('common.delete')}</Text>
            </TouchableOpacity>
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
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
          />
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
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
