import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
// Sentry loaded dynamically to avoid type errors if deps not yet installed
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/react');
} catch (_) {
  Sentry = null;
}
import 'react-native-reanimated';
import '../global.css';
import { ENV_CONFIG } from '@/constants/env';
import { View, Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { HealthBanner } from '@/components/HealthBanner';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize Sentry early (once) if DSN available
if (ENV_CONFIG.SENTRY_DSN && Sentry?.init) {
  Sentry.init({ dsn: ENV_CONFIG.SENTRY_DSN, tracesSampleRate: 0.1 });
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          {/* Enhanced Background */}
          {Platform.OS === 'web' && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: -1,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
              opacity: 0.95,
            }} />
          )}
          
          {/* App Content */}
          <View style={{ flex: 1, zIndex: 1 }}>
            <HealthBanner />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
              <Stack.Screen name="generator" options={{ headerShown: false }} />
              <Stack.Screen name="file-convertor" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}
