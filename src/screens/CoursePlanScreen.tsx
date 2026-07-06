import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  LayoutChangeEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import Svg, { Polyline } from 'react-native-svg';
import { useSettings } from '../context/SettingsContext';
import {
  copyToPersistentStorage,
  loadCoursePlans,
  saveCoursePlans,
} from '../lib/storage';
import { CoursePlan, DrawingStroke, StrideMarker } from '../types';
import { FONTS } from '../constants/typography';
import { Camera, Images, MapPin, PenLine, Save, Share2, Trash2, Undo2 } from 'lucide-react-native';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type DrawMode = 'draw' | 'mark';

export function CoursePlanScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const captureViewRef = useRef<View>(null);

  const [plans, setPlans] = useState<CoursePlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CoursePlan | null>(null);
  const [mode, setMode] = useState<DrawMode>('draw');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [markers, setMarkers] = useState<StrideMarker[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{ x: number; y: number }[]>([]);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    (async () => {
      const stored = await loadCoursePlans();
      setPlans(stored);
    })();
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          if (mode === 'mark') {
            setMarkers((prev) => [...prev, { x: locationX, y: locationY, label: String(prev.length + 1) }]);
          } else {
            setCurrentStrokePoints([{ x: locationX, y: locationY }]);
          }
        },
        onPanResponderMove: (evt) => {
          if (mode !== 'draw') return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentStrokePoints((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          if (mode !== 'draw') return;
          setCurrentStrokePoints((prev) => {
            if (prev.length > 1) {
              setStrokes((strokesPrev) => [...strokesPrev, { points: prev }]);
            }
            return [];
          });
        },
      }),
    [mode]
  );

  const pickPhoto = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });

    if (result.canceled) return;

    try {
      const persistentUri = copyToPersistentStorage(result.assets[0].uri, `plan-${generateId()}.jpg`);
      const newPlan: CoursePlan = {
        id: generateId(),
        name: t('coursePlan.defaultName'),
        createdAt: new Date().toISOString(),
        photoUri: persistentUri,
        strokes: [],
        markers: [],
      };
      setCurrentPlan(newPlan);
      setStrokes([]);
      setMarkers([]);
    } catch (error) {
      Alert.alert(t('coursePlan.shareErrorTitle'), String(error));
    }
  };

  const loadPlan = (plan: CoursePlan) => {
    setCurrentPlan(plan);
    setStrokes(plan.strokes);
    setMarkers(plan.markers);
  };

  const handleSave = async () => {
    if (!currentPlan) return;
    const updatedPlan: CoursePlan = { ...currentPlan, strokes, markers };
    const next = [updatedPlan, ...plans.filter((p) => p.id !== updatedPlan.id)];
    setPlans(next);
    setCurrentPlan(updatedPlan);
    await saveCoursePlans(next);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    Alert.alert(t('coursePlan.clearConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          setStrokes([]);
          setMarkers([]);
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!captureViewRef.current) return;
    try {
      const uri = await captureRef(captureViewRef, { format: 'png', quality: 0.9 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      }
    } catch {
      Alert.alert(t('coursePlan.shareErrorTitle'));
    }
  };

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setImageLayout({ width, height });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text, fontFamily: FONTS.heading }]}>{t('coursePlan.title')}</Text>
      <Text style={[styles.subheading, { color: colors.textMuted }]}>{t('coursePlan.subtitle')}</Text>

      {plans.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planList}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planChip,
                {
                  backgroundColor: currentPlan?.id === plan.id ? colors.primary : colors.segmentBackground,
                },
              ]}
              onPress={() => loadPlan(plan)}
            >
              <Text
                style={{ color: currentPlan?.id === plan.id ? colors.primaryText : colors.text, fontWeight: '600' }}
              >
                {plan.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.photoButtonsRow}>
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.primary }]}
          onPress={() => pickPhoto('camera')}
        >
          <Camera size={16} color={colors.primaryText} />
          <Text style={[styles.photoButtonText, { color: colors.primaryText }]}>{t('coursePlan.takePhoto')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.segmentBackground }]}
          onPress={() => pickPhoto('library')}
        >
          <Images size={16} color={colors.accentGold} />
          <Text style={[styles.photoButtonText, { color: colors.text }]}>{t('coursePlan.pickPhoto')}</Text>
        </TouchableOpacity>
      </View>

      {currentPlan ? (
        <>
          <View style={{ marginTop: 14, marginBottom: 10 }}>
            <TextInput
              style={[styles.nameInput, { borderColor: colors.border, color: colors.text }]}
              value={currentPlan.name}
              onChangeText={(text) => setCurrentPlan((prev) => (prev ? { ...prev, name: text } : prev))}
              placeholder={t('coursePlan.defaultName')}
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: mode === 'draw' ? colors.primary : colors.segmentBackground }]}
              onPress={() => setMode('draw')}
            >
              <PenLine size={16} color={mode === 'draw' ? colors.primaryText : colors.accentGold} />
              <Text style={{ color: mode === 'draw' ? colors.primaryText : colors.text, fontWeight: '600' }}>
                {t('coursePlan.drawMode')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: mode === 'mark' ? colors.primary : colors.segmentBackground }]}
              onPress={() => setMode('mark')}
            >
              <MapPin size={16} color={mode === 'mark' ? colors.primaryText : colors.accentGold} />
              <Text style={{ color: mode === 'mark' ? colors.primaryText : colors.text, fontWeight: '600' }}>
                {t('coursePlan.markMode')}
              </Text>
            </TouchableOpacity>
          </View>

          <View ref={captureViewRef} collapsable={false} style={styles.canvasWrapper}>
            <Image
              source={{ uri: currentPlan.photoUri }}
              style={styles.image}
              resizeMode="contain"
              onLayout={onImageLayout}
            />
            <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
              <Svg width={imageLayout.width} height={imageLayout.height} style={StyleSheet.absoluteFill}>
                {strokes.map((stroke, index) => (
                  <Polyline
                    key={index}
                    points={stroke.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#e63946"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentStrokePoints.length > 1 ? (
                  <Polyline
                    points={currentStrokePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#e63946"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </Svg>
              {markers.map((marker, index) => (
                <View
                  key={index}
                  style={[styles.marker, { left: marker.x - 14, top: marker.y - 14 }]}
                  pointerEvents="none"
                >
                  <Text style={styles.markerText}>{marker.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]} onPress={handleUndo}>
              <Undo2 size={16} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>{t('coursePlan.undo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { borderColor: colors.danger }]} onPress={handleClear}>
              <Trash2 size={16} color={colors.danger} />
              <Text style={[styles.actionButtonText, { color: colors.danger }]}>{t('coursePlan.clear')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Save size={16} color={colors.primaryText} />
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{t('coursePlan.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.segmentBackground }]}
              onPress={handleShare}
            >
              <Share2 size={16} color={colors.accentGold} />
              <Text style={[styles.primaryButtonText, { color: colors.text }]}>{t('coursePlan.share')}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('coursePlan.hintNoPhoto')}</Text>
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
    marginBottom: 16,
  },
  planList: {
    marginBottom: 14,
  },
  planChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  photoButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  canvasWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
});
