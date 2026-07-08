import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from 'expo-audio';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ResultCard } from '../components/ResultCard';
import { MountSummaryCard } from '../components/MountSummaryCard';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { useHorses } from '../context/HorseContext';
import { useSettings } from '../context/SettingsContext';
import { naturalAmplitudeForWithersHeight, naturalSpeedForWithersHeight } from '../constants/horseDefaults';
import { canterCadence } from '../lib/mathUtils';

const SPEED_PRESETS = ['300', '350', '375'];
const clickSound = require('../../assets/sounds/metronome-click.wav');

export function MetronomeScreen() {
  const { t } = useTranslation();
  const { selectedHorse } = useHorses();
  const { colors } = useSettings();
  const [speed, setSpeed] = useState('350');
  const [isRunning, setIsRunning] = useState(false);
  const player = useAudioPlayer(clickSound);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cadence = useMemo(() => {
    const speedValue = Number(speed.replace(',', '.'));
    if (!selectedHorse || !speedValue || speedValue <= 0) return null;
    const naturalAmplitude = naturalAmplitudeForWithersHeight(selectedHorse.withersHeight);
    const naturalSpeed = naturalSpeedForWithersHeight(selectedHorse.withersHeight);
    const strideLength = naturalAmplitude * (speedValue / naturalSpeed);
    return canterCadence(speedValue, strideLength);
  }, [speed, selectedHorse]);

  useEffect(() => {
    if (isRunning && cadence && cadence > 0) {
      const intervalMs = 60000 / cadence;
      timerRef.current = setInterval(() => {
        player.seekTo(0);
        player.play();
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, cadence, player]);

  useEffect(() => {
    if (!cadence) setIsRunning(false);
  }, [cadence]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
      <IntroCard title={t('metronome.title')} subtitle={t('metronome.subtitle')} />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('horsePicker.label')}</Text>
      <MountSummaryCard />

      <NumberField label={t('metronome.speedLabel')} value={speed} onChangeText={setSpeed} suffix="m/min" />

      <SegmentedControl
        options={SPEED_PRESETS.map((preset) => ({ value: preset, label: `${preset}` }))}
        value={SPEED_PRESETS.includes(speed) ? speed : ''}
        onChange={setSpeed}
      />

      <View style={{ height: 20 }} />

      {cadence ? (
        <>
          <ResultCard
            title={t('metronome.resultTitle')}
            rows={[{ label: t('metronome.cadenceLabel'), value: `${cadence.toFixed(0)} /min`, emphasis: true }]}
          />
          <View style={{ height: 20 }} />
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: isRunning ? colors.danger : colors.primary }]}
            onPress={() => setIsRunning((prev) => !prev)}
          >
            <Text style={[styles.playButtonText, { color: colors.primaryText }]}>
              {isRunning ? t('metronome.stop') : t('metronome.start')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {selectedHorse ? t('metronome.hintNoSpeed') : t('metronome.hintNoMount')}
        </Text>
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
  sectionLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  playButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  playButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
