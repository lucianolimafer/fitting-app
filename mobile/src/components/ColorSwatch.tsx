import { useEffect } from 'react';
import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { ColorOption } from '../types/tryOn';

interface ColorSwatchProps {
  active: boolean;
  color: ColorOption;
  index: number;
  onPress: PressableProps['onPress'];
}

export function ColorSwatch({ active, color, index, onPress }: ColorSwatchProps) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, {
      damping: 14,
      stiffness: 220,
      mass: 0.7,
    });
  }, [active, progress]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.1]) }],
    borderColor: active ? 'rgba(45, 34, 29, 0.9)' : 'rgba(45, 34, 29, 0)',
    backgroundColor: active ? 'rgba(47, 49, 54, 0.06)' : 'rgba(47, 49, 54, 0)',
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.04]) }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(180 + index * 45).duration(420)}>
      <Animated.View style={[styles.colorButton, wrapStyle]}>
        <Pressable onPress={onPress} style={styles.colorPressable}>
          <Animated.View style={dotStyle}>
            {color.isOriginal ? (
              <View style={styles.originalDot}>
                <View style={[styles.originalCrossStroke, styles.originalCrossStrokeLeft]} />
                <View style={[styles.originalCrossStroke, styles.originalCrossStrokeRight]} />
              </View>
            ) : (
              <View style={[styles.colorDot, { backgroundColor: color.hex }]} />
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  colorButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(48, 39, 34, 0.12)',
  },
  originalDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(48, 39, 34, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  originalCrossStroke: {
    position: 'absolute',
    width: 10,
    height: 1.6,
    borderRadius: 999,
    backgroundColor: 'rgba(48, 39, 34, 0.72)',
  },
  originalCrossStrokeLeft: {
    transform: [{ rotate: '45deg' }],
  },
  originalCrossStrokeRight: {
    transform: [{ rotate: '-45deg' }],
  },
});
