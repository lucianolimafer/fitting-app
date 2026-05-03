import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TryOnTabBar } from './components/TryOnTabBar';
import { useTryOn } from './hooks/useTryOn';
import { StudioScreen } from './screens/StudioScreen';
import { theme } from './theme/tokens';

export function VirtualFittingRoomApp() {
  const {
    activeTabId,
    setActiveTabId,
    selectedProduct,
    selectedColor,
    generatedPreviewUris,
    isGeneratingByProduct,
    generationErrors,
    tabItems,
    handleSelectColor,
    handleGenerateLook,
  } = useTryOn();

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.topSafeAreaFill} />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <View style={styles.appFrame}>
          <View style={styles.screenWrap}>
            <View style={styles.stageBackground} />
            <StudioScreen
              generationError={generationErrors[selectedProduct.id] ?? ''}
              imageSource={
                generatedPreviewUris[selectedProduct.id]
                  ? { uri: generatedPreviewUris[selectedProduct.id] as string }
                  : selectedProduct.studioImage
              }
              isGenerating={Boolean(isGeneratingByProduct[selectedProduct.id])}
              selectedColor={selectedColor}
              selectedProduct={selectedProduct}
              onGenerateLook={handleGenerateLook}
              onSelectColor={handleSelectColor}
            />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.tabBarWrap}>
        <TryOnTabBar
          activeId={activeTabId}
          items={tabItems}
          onSelect={setActiveTabId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.sand,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  appFrame: {
    flex: 1,
    backgroundColor: theme.colors.sand,
  },
  screenWrap: {
    flex: 1,
  },
  stageBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.sand,
  },
  topSafeAreaFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: theme.colors.accent,
  },
  tabBarWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 12,
  },
});
