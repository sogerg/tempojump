import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
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
import { naturalAmplitudeForWithersHeight } from '../constants/horseDefaults';
import { canterCadence } from '../lib/mathUtils';
import { speedFromMetersPerMinute, speedToMetersPerMinute, speedUnitSuffix } from '../lib/units';

const SPEED_PRESETS_METERS_PER_MINUTE = [300, 350, 375];
const clickSound = require('../../assets/sounds/metronome-click.wav');

export function MetronomeScreen() {
  const { t } = useTranslation();
  const { selectedHorse } = useHorses();
  const { colors, unitSystem } = useSettings();
  const [speed, setSpeed] = useState('350');
  const [isRunning, setIsRunning] = useState(false);
  const player = useAudioPlayer(clickSound);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speedPresets = useMemo(
    () =>
      SPEED_PRESETS_METERS_PER_MINUTE.map((metersPerMinute) =>
        String(Math.round(speedFromMetersPerMinute(metersPerMinute, unitSystem)))
      ),
    [unitSystem]
  );

  const cadence = useMemo(() => {
    const speedValue = Number(speed.replace(',', '.'));
    if (!selectedHorse || !speedValue || speedValue <= 0) return null;
    const speedMetersPerMinute = speedToMetersPerMinute(speedValue, unitSystem);
    const strideLength = naturalAmplitudeForWithersHeight(selectedHorse.withersHeight);
    const rawCadence = canterCadence(speedMetersPerMinute, strideLength);
    return rawCadence > 0 ? Math.ceil(rawCadence) : rawCadence;
  }, [speed, selectedHorse, unitSystem]);

  useEffect(() => {
    if (isRunning && cadence && cadence > 0) {
      const intervalMs = 60000 / cadence;
      const tick = () => {
        player.seekTo(0);
        player.play();
        Vibration.vibrate(120);
      };
      tick();
      timerRef.current = setInterval(tick, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Vibration.cancel();
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

      <NumberField
        label={t('metronome.speedLabel')}
        value={speed}
        onChangeText={setSpeed}
        suffix={speedUnitSuffix(unitSystem)}
      />

      <SegmentedControl
        options={speedPresets.map((preset) => ({ value: preset, label: `${preset}` }))}
        value={speedPresets.includes(speed) ? speed : ''}
        onChange={setSpeed}
      />

      <View style={{ height: 20 }} />

      {cadence ? (
        <>
          <ResultCard
            title={t('metronome.resultTitle')}
            rows={[{ label: t('metronome.cadenceLabel'), value: `${cadence} /min`, emphasis: true }]}
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
