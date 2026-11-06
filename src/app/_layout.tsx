import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initAudio } from '@/lib/feedback';
import { configureNotifications } from '@/lib/notify';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
    initAudio();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Box-Timer', headerLargeTitle: true }} />
        <Stack.Screen name="edit" options={{ title: 'Preset', presentation: 'modal' }} />
        <Stack.Screen
          name="timer"
          options={{
            headerShown: false,
            gestureEnabled: false, // kein versehentliches Wegwischen mit Handschuhen
            animation: 'fade',
            contentStyle: { backgroundColor: colors.prep },
          }}
        />
      </Stack>
    </>
  );
}
