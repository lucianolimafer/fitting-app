import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VirtualFittingRoomApp } from './src/VirtualFittingRoomApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <VirtualFittingRoomApp />
    </SafeAreaProvider>
  );
}
