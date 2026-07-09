import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export function ScreenWatermark({ offsetTop = 0 }: { offsetTop?: number }) {
  const { colors } = useSettings();

  return (
    <View pointerEvents="none" style={[styles.watermark, { top: styles.watermark.top + offsetTop }]}>
      <Image
        source={require('../../assets/cheval-watermark.png')}
        style={[styles.watermarkImage, { tintColor: colors.text }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    top: 158,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.07,
  },
  watermarkImage: {
    width: 340,
    height: 322,
  },
});
