import { describe, expect, it } from '@jest/globals';

import en from '../en.json';
import { changeLanguage, i18n, resolveSystemLanguage } from '../index';
import ko from '../ko.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix.length === 0 ? key : `${prefix}.${key}`;
    return typeof child === 'object' && child !== null
      ? flattenKeys(child as Record<string, unknown>, nextPrefix)
      : [nextPrefix];
  });
}

describe('locales', () => {
  it('keeps Korean and English translation keys aligned', () => {
    expect(flattenKeys(ko).sort()).toEqual(flattenKeys(en).sort());
  });

  it('uses English as the system-language fallback', () => {
    expect(resolveSystemLanguage('ko')).toBe('ko');
    expect(resolveSystemLanguage('fr')).toBe('en');
    expect(resolveSystemLanguage(undefined)).toBe('en');
  });

  it('changes the active translation language', async () => {
    await changeLanguage('ko');
    expect(i18n.t('menu.subtitle')).toBe('개발 중인 전략 보드게임');

    await changeLanguage('en');
    expect(i18n.t('menu.subtitle')).toBe('A strategy board game in development.');
  });
});
