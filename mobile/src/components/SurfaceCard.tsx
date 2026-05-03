import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { shadow, theme } from '../theme/tokens';

interface SurfaceCardProps extends PropsWithChildren {
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SurfaceCard({ children, style, elevated = false }: SurfaceCardProps) {
  return <View style={[styles.card, elevated && shadow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.frostedStrong,
    overflow: 'hidden',
  },
});
