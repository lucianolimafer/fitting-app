import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ColorSwatch } from '../components/ColorSwatch';
import { TopLinearBackdrop } from '../components/TopLinearBackdrop';
import { theme } from '../theme/tokens';
import type { ColorOption, TryOnProduct } from '../types/tryOn';
import { hexToRgba } from '../utils/color';

const IMAGE_HEIGHT_RATIO = 0.58;

interface StudioScreenProps {
  generationError: string;
  imageSource: ImageSourcePropType;
  isGenerating: boolean;
  selectedColor: ColorOption;
  selectedProduct: TryOnProduct;
  onGenerateLook: () => void;
  onSelectColor: (colorId: string) => void;
}

export function StudioScreen({
  generationError,
  imageSource,
  isGenerating,
  selectedColor,
  selectedProduct,
  onGenerateLook,
  onSelectColor,
}: StudioScreenProps) {
  const { width, height } = useWindowDimensions();
  const imageProgress = useSharedValue(0);
  const copyProgress = useSharedValue(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    imageProgress.value = 0;
    copyProgress.value = 0;

    imageProgress.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
    copyProgress.value = withDelay(
      80,
      withTiming(1, {
        duration: 540,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [copyProgress, imageProgress, imageSource, selectedProduct.id]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageMotionStyle = useAnimatedStyle(() => ({
    opacity:
      interpolate(imageProgress.value, [0, 1], [0.74, 1]) *
      interpolate(scrollY.value, [0, 220], [1, 0.94], Extrapolation.CLAMP),
    transform: [
      {
        translateY:
          interpolate(imageProgress.value, [0, 1], [20, 0]) +
          interpolate(scrollY.value, [-90, 0, 240], [-16, 0, -34], Extrapolation.CLAMP),
      },
      {
        scale:
          interpolate(imageProgress.value, [0, 1], [0.975, 1]) *
          interpolate(scrollY.value, [-120, 0, 260], [1.045, 1, 0.968], Extrapolation.CLAMP),
      },
    ],
  }));

  const copyMotionStyle = useAnimatedStyle(() => ({
    opacity:
      copyProgress.value *
      interpolate(scrollY.value, [0, 80, 170], [1, 0.92, 0.58], Extrapolation.CLAMP),
    transform: [
      {
        translateY:
          interpolate(copyProgress.value, [0, 1], [18, 0]) +
          interpolate(scrollY.value, [0, 180], [0, -18], Extrapolation.CLAMP),
      },
    ],
  }));

  const colorRowMotionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 120, 220], [1, 0.94, 0.76], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 200], [0, -12], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [0, 220], [1, 0.985], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.screen}>
      <TopLinearBackdrop />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
      >
        <View style={styles.stage}>
          <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.imageWrapLayout}>
            <Animated.View style={[styles.imageWrap, imageMotionStyle]}>
              <View pointerEvents="none" style={styles.imageBackdrop}>
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="imageFade" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                      <Stop offset="80%" stopColor="#fff7f2" stopOpacity="0.18" />
                      <Stop offset="100%" stopColor="#e9e1da" stopOpacity="0.92" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#imageFade)" />
                </Svg>
              </View>
              <Image
                source={imageSource}
                style={[styles.modelImage, { width, height: height * IMAGE_HEIGHT_RATIO }]}
                resizeMode="cover"
              />
              {isGenerating ? (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(160)}
                  style={styles.loadingOverlay}
                >
                  <BlurView intensity={36} tint="light" style={StyleSheet.absoluteFillObject} />
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                    <Defs>
                      <LinearGradient id="aiLoadingGradient" x1="0" y1="1" x2="0" y2="0">
                        <Stop offset="0%" stopColor={selectedColor.hex} stopOpacity="0.62" />
                        <Stop offset="42%" stopColor={selectedColor.hex} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={selectedColor.hex} stopOpacity="0" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#aiLoadingGradient)" />
                  </Svg>
                  <View
                    pointerEvents="none"
                    style={[
                      styles.loadingGlow,
                      { backgroundColor: hexToRgba(selectedColor.hex, 0.24) },
                    ]}
                  />
                  <View style={styles.loadingContent}>
                    <ActivityIndicator color={theme.colors.panel} />
                    <Text style={styles.loadingText}>Applying AI color...</Text>
                  </View>
                </Animated.View>
              ) : null}
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.copyBlock, copyMotionStyle]}>
            <Text style={styles.productName}>{selectedProduct.name}</Text>
            <Text style={styles.productSubtitle}>{selectedProduct.subtitle}</Text>
          </Animated.View>

          <Animated.View layout={LinearTransition.springify().damping(18)}>
            <Animated.View style={[styles.colorRow, colorRowMotionStyle]}>
              {selectedProduct.colors.map((color, index) => (
                <ColorSwatch
                  key={color.id}
                  active={color.id === selectedColor.id}
                  color={color}
                  index={index}
                  onPress={() => onSelectColor(color.id)}
                />
              ))}
            </Animated.View>
          </Animated.View>

          {generationError ? (
            <Animated.View
              entering={FadeInDown.duration(260)}
              exiting={FadeOut.duration(180)}
              style={styles.errorBlock}
            >
              <Text style={styles.errorText}>{generationError}</Text>
              <Pressable onPress={onGenerateLook} style={styles.retryButton}>
                <Text style={styles.retryLabel}>Retry</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 36,
    paddingBottom: 24,
  },
  imageWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapLayout: {
    borderRadius: 28,
  },
  imageBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modelImage: {
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  loadingGlow: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -32,
    height: '58%',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 28,
  },
  loadingText: {
    color: theme.colors.panel,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  copyBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  productName: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  productSubtitle: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: theme.typography.body,
  },
  colorRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  errorBlock: {
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 30,
    gap: 10,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.eyebrow,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  retryLabel: {
    color: theme.colors.error,
    fontSize: theme.typography.label,
    fontWeight: '600',
  },
});
