import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { ProductId, TabBarItem } from '../types/tryOn';
import { theme } from '../theme/tokens';

const TAB_PADDING = 8;
const TAB_GAP = 8;
const SHELL_BLEED = 10;

interface TryOnTabBarProps {
  activeId: ProductId;
  items: TabBarItem[];
  onSelect: (id: ProductId) => void;
}

export function TryOnTabBar({ activeId, items, onSelect }: TryOnTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.id === activeId)),
    [activeId, items],
  );
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  const tabWidth =
    containerWidth > 0
      ? (containerWidth - TAB_PADDING * 2 - (items.length - 1) * TAB_GAP) / items.length
      : 0;
  const activeShellWidth = tabWidth > 0 ? tabWidth + SHELL_BLEED : 0;

  useEffect(() => {
    if (!tabWidth) {
      return;
    }

    indicatorOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
    indicatorX.value = withSpring(activeIndex * (tabWidth + 8), {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
  }, [activeIndex, indicatorOpacity, indicatorX, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(520).springify().damping(18)} style={styles.wrap}>
      <BlurView intensity={34} tint="light" style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.glassTint} />
      <View pointerEvents="none" style={styles.waterShineTop} />
      <View pointerEvents="none" style={styles.waterShineOrb} />

      <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)} style={styles.track}>
        {tabWidth ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.activeShell, { width: activeShellWidth }, indicatorStyle]}
          >
            <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFillObject} />
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
              <Defs>
                <LinearGradient id="activeShellBase" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.62)" />
                  <Stop offset="48%" stopColor="rgba(255,247,242,0.34)" />
                  <Stop offset="100%" stopColor="rgba(255,233,224,0.26)" />
                </LinearGradient>
                <LinearGradient id="activeShellSheen" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.84)" />
                  <Stop offset="28%" stopColor="rgba(255,255,255,0.22)" />
                  <Stop offset="72%" stopColor="rgba(255,255,255,0.05)" />
                  <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" rx="18" fill="url(#activeShellBase)" />
              <Rect x="0" y="0" width="100%" height="100%" rx="18" fill="url(#activeShellSheen)" />
            </Svg>
            <View style={styles.activeCore} />
            <View style={styles.activeCoreSheen} />
          </Animated.View>
        ) : null}

        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={styles.tab}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 249, 244, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    padding: 8,
    overflow: 'hidden',
    shadowColor: '#6a4334',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 235, 229, 0.22)',
  },
  waterShineTop: {
    position: 'absolute',
    top: 1,
    left: 14,
    right: 14,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  waterShineOrb: {
    position: 'absolute',
    top: 10,
    right: 34,
    width: 76,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  track: {
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
  },
  activeShell: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    left: -5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.46)',
    backgroundColor: 'rgba(255, 250, 246, 0.2)',
    shadowColor: '#7a5145',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  activeCore: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 246, 241, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 92, 0.4)',
  },
  activeCoreSheen: {
    position: 'absolute',
    top: 7,
    left: 18,
    right: 18,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tabLabel: {
    color: '#6e615a',
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: theme.colors.accentDeep,
  },
});
