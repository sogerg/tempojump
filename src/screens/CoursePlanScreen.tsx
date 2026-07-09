import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  LayoutChangeEvent,
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
import { copyToPersistentStorage, loadCoursePlans, saveCoursePlans } from '../lib/storage';
import { CoursePlan, DrawingStroke, StrideMarker } from '../types';
import { fractionToPixel, getContainRect } from '../lib/imageGeometry';
import { IntroCard } from '../components/IntroCard';
import { ScreenWatermark } from '../components/ScreenWatermark';
import { CoursePlanEditorScreen } from './CoursePlanEditorScreen';
import { Camera, Images, MapPin, PenLine, Save, Share2 } from 'lucide-react-native';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type DrawMode = 'draw' | 'mark';

const DEFAULT_STROKE_COLOR = '#e63946';

export function CoursePlanScreen() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const captureViewRef = useRef<View>(null);

  const [plans, setPlans] = useState<CoursePlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CoursePlan | null>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [markers, setMarkers] = useState<StrideMarker[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<DrawMode>('draw');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!currentPlan?.photoUri) return;
    Image.getSize(
      currentPlan.photoUri,
      (width, height) => setNaturalSize({ width, height }),
      () => setNaturalSize({ width: 0, height: 0 })
    );
  }, [currentPlan?.photoUri]);

  const containRect = useMemo(() => getContainRect(canvasSize, naturalSize), [canvasSize, naturalSize]);

  React.useEffect(() => {
    (async () => {
      const stored = await loadCoursePlans();
      setPlans(stored);
    })();
  }, []);

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

  const openEditor = (mode: DrawMode) => {
    if (!currentPlan) return;
    setEditorMode(mode);
    setEditorVisible(true);
  };

  const handleEditorClose = (nextStrokes: DrawingStroke[], nextMarkers: StrideMarker[]) => {
    setStrokes(nextStrokes);
    setMarkers(nextMarkers);
    setEditorVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenWatermark />
      <ScrollView contentContainerStyle={styles.content}>
      <IntroCard title={t('coursePlan.title')} subtitle={t('coursePlan.subtitle')} />

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
          <Camera size={16} color={colors.iconGoldActive} />
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
              style={[styles.modeButton, { backgroundColor: colors.segmentBackground }]}
              onPress={() => openEditor('draw')}
            >
              <PenLine size={16} color={colors.accentGold} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('coursePlan.drawMode')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: colors.segmentBackground }]}
              onPress={() => openEditor('mark')}
            >
              <MapPin size={16} color={colors.accentGold} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('coursePlan.markMode')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={() => openEditor('draw')}>
            <View
              ref={captureViewRef}
              collapsable={false}
              style={styles.canvasWrapper}
              onLayout={(event: LayoutChangeEvent) => {
                const { width, height } = event.nativeEvent.layout;
                setCanvasSize({ width, height });
              }}
            >
              <Image source={{ uri: currentPlan.photoUri }} style={styles.image} resizeMode="contain" />
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                  {strokes.map((stroke, index) => (
                    <Polyline
                      key={index}
                      points={stroke.points
                        .map((p) => fractionToPixel(p, containRect))
                        .map((p) => `${p.x},${p.y}`)
                        .join(' ')}
                      fill="none"
                      stroke={stroke.color ?? DEFAULT_STROKE_COLOR}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </Svg>
                {markers.map((marker) => {
                  const pixel = fractionToPixel(marker, containRect);
                  return (
                    <View
                      key={marker.id ?? `${marker.x}-${marker.y}`}
                      style={[styles.marker, { left: pixel.x - 14, top: pixel.y - 14 }]}
                    >
                      <Text style={styles.markerText}>{marker.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Save size={16} color={colors.iconGoldActive} />
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

      <CoursePlanEditorScreen
        visible={editorVisible}
        photoUri={currentPlan?.photoUri ?? null}
        initialStrokes={strokes}
        initialMarkers={markers}
        initialMode={editorMode}
        onClose={handleEditorClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
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
