import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { IntroCard } from '../components/IntroCard';
import { useSettings } from '../context/SettingsContext';
import { allowedTime } from '../lib/mathUtils';

function formatSecondsAsClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function ChronoScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const [courseLength, setCourseLength] = useState('');
  const [speed, setSpeed] = useState('');

  const result = useMemo(() => {
    const lengthMeters = Number(courseLength.replace(',', '.'));
    const speedMetersPerMinute = Number(speed.replace(',', '.'));
    if (!lengthMeters || lengthMeters <= 0 || !speedMetersPerMinute || speedMetersPerMinute <= 0) return null;
    return allowedTime(lengthMeters, speedMetersPerMinute);
  }, [courseLength, speed]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <IntroCard title={t('chrono.title')} subtitle={t('chrono.subtitle')} />

      <NumberField
        label={t('chrono.lengthLabel')}
        value={courseLength}
        onChangeText={setCourseLength}
        placeholder={t('chrono.lengthPlaceholder')}
        suffix="m"
      />

      <NumberField
        label={t('chrono.speedLabel')}
        value={speed}
        onChangeText={setSpeed}
        placeholder={t('chrono.speedPlaceholder')}
        suffix="m/min"
      />

      {result !== null ? (
        <ResultCard
          title={t('chrono.resultTitle')}
          rows={[
            {
              label: t('chrono.allowedTimeLabel'),
              value: `${formatSecondsAsClock(result)} (${result.toFixed(1)} s)`,
              emphasis: true,
            },
          ]}
        />
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('chrono.hintNoInput')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
