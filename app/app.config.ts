import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'SEAL',
  slug: 'seal',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'seal',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.skygame3.seal',
  },
  android: {
    package: 'com.skygame3.seal',
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router', 'expo-localization'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
