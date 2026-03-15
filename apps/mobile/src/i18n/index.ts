import type { PropsWithChildren } from 'react';
import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import { getLocales } from 'expo-localization';
import { en } from './en';
import { hr } from './hr';
import { resolveAppLanguageFromLocale, type SupportedLanguage } from './language';

const dictionaries = { en, hr } as const;

export type AppLanguage = SupportedLanguage;
export type TranslationParams = Record<string, number | string>;
export type TranslateFn = (key: string, params?: TranslationParams) => string;

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectDeviceLanguage(): AppLanguage {
  const locale = getLocales()[0];
  return resolveAppLanguageFromLocale({
    languageCode: locale?.languageCode,
    languageTag: locale?.languageTag,
  });
}

function getByPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== 'object' || !(segment in acc)) {
      return undefined;
    }
    return (acc as Record<string, unknown>)[segment];
  }, value);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{{${token}}}` : String(value);
  });
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<AppLanguage>(detectDeviceLanguage());

  const t = useCallback<TranslateFn>(
    (key, params) => {
      const dictionary = dictionaries[language];
      const entry = getByPath(dictionary, key);
      if (typeof entry !== 'string') return key;
      return interpolate(entry, params);
    },
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.');
  }
  return context;
}
