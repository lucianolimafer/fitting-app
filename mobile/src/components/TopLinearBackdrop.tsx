import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function TopLinearBackdrop() {
  const { width, height } = useWindowDimensions();
  const svgHeight = Math.max(420, height * 0.62);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width={width} height={svgHeight} style={styles.svg}>
        <Defs>
          <LinearGradient id="topWash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#ff6d50" stopOpacity="1" />
            <Stop offset="34%" stopColor="#ff8467" stopOpacity="0.92" />
            <Stop offset="64%" stopColor="#ffc0af" stopOpacity="0.42" />
            <Stop offset="100%" stopColor="#f6f2ed" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={width} height={svgHeight} fill="url(#topWash)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
