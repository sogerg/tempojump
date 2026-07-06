import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSettings } from '../context/SettingsContext';
import { copyToPersistentStorage, loadJournalEntries, saveJournalEntries } from '../lib/storage';
import { strideDelta } from '../lib/mathUtils';
import { JournalEntry } from '../types';
import { FONTS } from '../constants/typography';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView style={styles.video} player={player} nativeControls />;
}

function DeltaLabel({ theoretical, actual }: { theoretical?: number; actual?: number }) {
  const { t } = useTranslation();
  const { colors } = useSettings();
  if (theoretical === undefined || actual === undefined) return null;
  const delta = strideDelta(theoretical, actual);
  const text =
    delta === 0
      ? t('journal.deltaExact')
      : delta > 0
      ? t('journal.deltaLong', { count: delta })
      : t('journal.deltaShort', { count: Math.abs(delta) });
  return <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 4 }}>{text}</Text>;
}

export function JournalScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [theoreticalStrides, setTheoreticalStrides] = useState('');
  const [actualStrides, setActualStrides] = useState('');
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
    setTheoreticalStrides('');
    setActualStrides('');
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
      theoreticalStrides: theoreticalStrides ? Number(theoreticalStrides.replace(',', '.')) : undefined,
      actualStrides: actualStrides ? Number(actualStrides.replace(',', '.')) : undefined,
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
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text, fontFamily: FONTS.heading }]}>{t('journal.title')}</Text>
      <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('journal.subtitle')}</Text>

      {entries.map((entry) => (
        <View key={entry.id} style={[styles.entryCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.entryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.entryName, { color: colors.text }]}>{entry.name}</Text>
              <Text style={[styles.entryDate, { color: colors.textMuted }]}>{entry.date}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
              <Text style={{ color: colors.danger, fontWeight: '600' }}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>

          <DeltaLabel theoretical={entry.theoreticalStrides} actual={entry.actualStrides} />
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
            value={theoreticalStrides}
            onChangeText={setTheoreticalStrides}
            placeholder={t('journal.theoreticalLabel')}
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={actualStrides}
            onChangeText={setActualStrides}
            placeholder={t('journal.actualLabel')}
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
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
              <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{t('journal.recordVideo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: colors.segmentBackground }]}
              onPress={() => pickVideo('library')}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('journal.pickVideo')}</Text>
            </TouchableOpacity>
          </View>
          {videoUri ? <Text style={{ color: colors.textMuted, marginTop: 6 }}>{t('journal.videoAttached')}</Text> : null}

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSaveEntry}>
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{t('journal.saveEntry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.segmentBackground }]}
            onPress={() => {
              resetForm();
              setIsAdding(false);
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => setIsAdding(true)}>
          <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{t('journal.addEntry')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    marginBottom: 20,
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
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
});
