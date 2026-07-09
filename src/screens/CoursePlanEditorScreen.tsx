import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  LayoutChangeEvent,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Polyline } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, SharedValue } from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Minus, Plus, Trash2, Undo2, X } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { DrawingPoint, DrawingStroke, StrideMarker } from '../types';
import { fractionToPixel, getContainRect, pixelToFraction, Rect } from '../lib/imageGeometry';

type DrawMode = 'draw' | 'mark';

const STROKE_COLORS = ['#2563eb', '#e63946'];
const DEFAULT_STROKE_COLOR = '#e63946';
const MARKER_RADIUS = 16;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Repère avec id garanti : le champ est optionnel dans StrideMarker pour la compatibilité
 * avec les plans enregistrés avant l'ajout du glisser-déposer, mais toujours renseigné en
 * interne dans l'éditeur (voir withIds ci-dessous). */
type EditableMarker = StrideMarker & { id: string };

function withIds(markers: StrideMarker[]): EditableMarker[] {
  return markers.map((marker) => (marker.id ? (marker as EditableMarker) : { ...marker, id: generateId() }));
}

interface DraggableMarkerProps {
  marker: EditableMarker;
  x: number; // position en pixels dans le viewport (dérivée de la fraction stockée)
  y: number;
  scale: SharedValue<number>;
  onMove: (id: string, x: number, y: number) => void; // reporte une position en pixels
  onRemove: (id: string) => void;
  color: string;
}

function DraggableMarker({ marker, x, y, scale, onMove, onRemove, color }: DraggableMarkerProps) {
  const startX = useSharedValue(x);
  const startY = useSharedValue(y);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x;
      startY.value = y;
    })
    .onUpdate((e) => {
      const nextX = startX.value + e.translationX / scale.value;
      const nextY = startY.value + e.translationY / scale.value;
      runOnJS(onMove)(marker.id, nextX, nextY);
    });

  return (
    <GestureDetector gesture={dragGesture}>
      <View style={[styles.marker, { left: x - MARKER_RADIUS, top: y - MARKER_RADIUS, backgroundColor: color }]}>
        <Text style={styles.markerText}>{marker.label}</Text>
        <TouchableOpacity style={styles.markerDelete} onPress={() => onRemove(marker.id)}>
          <X size={11} color="#fff" />
        </TouchableOpacity>
      </View>
    </GestureDetector>
  );
}

interface CoursePlanEditorScreenProps {
  visible: boolean;
  photoUri: string | null;
  initialStrokes: DrawingStroke[];
  initialMarkers: StrideMarker[];
  initialMode: DrawMode;
  onClose: (strokes: DrawingStroke[], markers: StrideMarker[]) => void;
}

export function CoursePlanEditorScreen({
  visible,
  photoUri,
  initialStrokes,
  initialMarkers,
  initialMode,
  onClose,
}: CoursePlanEditorScreenProps) {
  const { t } = useTranslation();
  const { colors } = useSettings();

  const [mode, setMode] = useState<DrawMode>(initialMode);
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes);
  const [markers, setMarkers] = useState<EditableMarker[]>(withIds(initialMarkers));
  const [currentStrokePoints, setCurrentStrokePoints] = useState<DrawingPoint[]>([]);
  const [selectedColor, setSelectedColor] = useState(STROKE_COLORS[0]);
  const [markerNumber, setMarkerNumber] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!photoUri) return;
    Image.getSize(
      photoUri,
      (width, height) => setNaturalSize({ width, height }),
      () => setNaturalSize({ width: 0, height: 0 })
    );
  }, [photoUri]);

  const containRect: Rect = useMemo(
    () => getContainRect(viewportSize, naturalSize),
    [viewportSize, naturalSize]
  );

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  // Miroir de viewportSize lisible depuis les worklets (UI thread) : RN applique le transform
  // scale/translate autour du CENTRE de la vue, pas du coin haut-gauche, donc l'inversion
  // écran -> contenu doit passer par ce centre pour rester juste une fois zoomé/déplacé.
  const viewportWidthShared = useSharedValue(0);
  const viewportHeightShared = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    setMode(initialMode);
    setStrokes(initialStrokes);
    setMarkers(withIds(initialMarkers));
    setMarkerNumber(1);
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    onClose(strokes, markers);
  };

  const startStroke = (x: number, y: number) => {
    setCurrentStrokePoints([{ x, y }]);
  };

  const addPoint = (x: number, y: number) => {
    setCurrentStrokePoints((prev) => [...prev, { x, y }]);
  };

  const commitStroke = () => {
    setCurrentStrokePoints((prev) => {
      if (prev.length > 1) {
        const fractionPoints = prev.map((p) => pixelToFraction(p, containRect));
        setStrokes((strokesPrev) => [...strokesPrev, { points: fractionPoints, color: selectedColor }]);
      }
      return [];
    });
  };

  const drawGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(mode === 'draw')
    .onStart((e) => {
      const cx = viewportWidthShared.value / 2;
      const cy = viewportHeightShared.value / 2;
      const x = cx + (e.x - cx - translateX.value) / scale.value;
      const y = cy + (e.y - cy - translateY.value) / scale.value;
      runOnJS(startStroke)(x, y);
    })
    .onUpdate((e) => {
      const cx = viewportWidthShared.value / 2;
      const cy = viewportHeightShared.value / 2;
      const x = cx + (e.x - cx - translateX.value) / scale.value;
      const y = cy + (e.y - cy - translateY.value) / scale.value;
      runOnJS(addPoint)(x, y);
    })
    .onEnd(() => {
      runOnJS(commitStroke)();
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(6, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panZoomGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const zoomGesture = Gesture.Simultaneous(pinchGesture, panZoomGesture);
  const composedGesture = Gesture.Race(zoomGesture, drawGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportSize({ width, height });
    viewportWidthShared.value = width;
    viewportHeightShared.value = height;
  };

  const handleUndo = () => setStrokes((prev) => prev.slice(0, -1));
  const handleClearAll = () => {
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

  const handleAddMarker = () => {
    if (viewportSize.width === 0) return;
    // Le repère est posé au centre du viewport visible : comme screenX = cx, l'inversion se
    // simplifie, mais on garde la formule générale (cohérente avec drawGesture) pour la clarté.
    const cx = viewportSize.width / 2;
    const cy = viewportSize.height / 2;
    const pixelX = cx + (cx - cx - translateX.value) / scale.value;
    const pixelY = cy + (cy - cy - translateY.value) / scale.value;
    const frac = pixelToFraction({ x: pixelX, y: pixelY }, containRect);
    setMarkers((prev) => [...prev, { id: generateId(), x: frac.x, y: frac.y, label: String(markerNumber) }]);
    setMarkerNumber((prev) => prev + 1);
  };

  const handleMoveMarker = (id: string, x: number, y: number) => {
    const frac = pixelToFraction({ x, y }, containRect);
    setMarkers((prev) => prev.map((marker) => (marker.id === id ? { ...marker, x: frac.x, y: frac.y } : marker)));
  };

  const handleRemoveMarker = (id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'draw' && { backgroundColor: colors.primary }]}
              onPress={() => setMode('draw')}
            >
              <Text style={styles.modeButtonText}>{t('coursePlan.drawMode')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'mark' && { backgroundColor: colors.primary }]}
              onPress={() => setMode('mark')}
            >
              <Text style={styles.modeButtonText}>{t('coursePlan.markMode')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <GestureDetector gesture={composedGesture}>
          <View style={styles.viewport} onLayout={handleViewportLayout}>
            <Animated.View style={[styles.content, animatedStyle]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
              ) : null}
              <Svg style={StyleSheet.absoluteFill} width={viewportSize.width} height={viewportSize.height}>
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
                {currentStrokePoints.length > 1 ? (
                  <Polyline
                    points={currentStrokePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={selectedColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </Svg>
              {markers.map((marker) => {
                const pixel = fractionToPixel(marker, containRect);
                return (
                  <DraggableMarker
                    key={marker.id}
                    marker={marker}
                    x={pixel.x}
                    y={pixel.y}
                    scale={scale}
                    onMove={handleMoveMarker}
                    onRemove={handleRemoveMarker}
                    color={DEFAULT_STROKE_COLOR}
                  />
                );
              })}
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={[styles.bottomBar, { backgroundColor: colors.surface }]}>
          {mode === 'draw' ? (
            <View style={styles.drawToolbar}>
              <View style={styles.colorRow}>
                {STROKE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]} onPress={handleUndo}>
                  <Undo2 size={16} color={colors.accentGold} />
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>{t('coursePlan.undo')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.danger }]}
                  onPress={handleClearAll}
                >
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.actionButtonText, { color: colors.danger }]}>{t('coursePlan.clear')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.markerToolbar}>
              <Text style={[styles.markerLabel, { color: colors.text }]}>{t('coursePlan.markerNumberLabel')}</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepperButton, { borderColor: colors.border }]}
                  onPress={() => setMarkerNumber((prev) => Math.max(0, prev - 1))}
                >
                  <Minus size={16} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.stepperInput, { borderColor: colors.border, color: colors.text }]}
                  value={String(markerNumber)}
                  onChangeText={(text) => setMarkerNumber(Math.max(0, Number(text.replace(/[^0-9]/g, '')) || 0))}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.stepperButton, { borderColor: colors.border }]}
                  onPress={() => setMarkerNumber((prev) => prev + 1)}
                >
                  <Plus size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addMarkerButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddMarker}
                >
                  <Plus size={16} color={colors.primaryText} />
                  <Text style={[styles.addMarkerButtonText, { color: colors.primaryText }]}>
                    {t('coursePlan.addMarkerButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 6,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: MARKER_RADIUS * 2,
    height: MARKER_RADIUS * 2,
    borderRadius: MARKER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  markerDelete: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  drawToolbar: {
    gap: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#000',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
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
  markerToolbar: {
    gap: 8,
  },
  markerLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    width: 56,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    fontSize: 16,
    lineHeight: 20,
  },
  addMarkerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 8,
  },
  addMarkerButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
