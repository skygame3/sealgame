import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ko from './ko.json';

export const supportedLanguages = ['ko', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export type AppLanguage = SupportedLanguage | 'system';

const i18n = createInstance();

/** Returns a supported app language, using English for unsupported device locales. */
export function resolveSystemLanguage(languageCode: string | null | undefined): SupportedLanguage {
  return languageCode === 'ko' ? 'ko' : 'en';
}

/** Changes the active language and resolves the device language for the system option. */
export function changeLanguage(language: AppLanguage): Promise<unknown> {
  const nextLanguage = language === 'system' ? resolveDeviceLanguage() : language;
  return i18n.changeLanguage(nextLanguage);
}

function resolveDeviceLanguage(): SupportedLanguage {
  return resolveSystemLanguage(getLocales()[0]?.languageCode);
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export { i18n };
