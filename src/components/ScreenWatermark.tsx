import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export function ScreenWatermark() {
  const { colors } = useSettings();

  return (
    <View pointerEvents="none" style={styles.watermark}>
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
    top: 120,
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
