import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '../locales';

/** Root navigation for the mobile app. */
export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
