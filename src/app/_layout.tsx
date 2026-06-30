import { Stack } from 'expo-router'
import Toast from 'react-native-toast-message'
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </ErrorBoundary>
  )
}
