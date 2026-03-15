export type SupportedLanguage = 'en' | 'hr';

function normalizeLocaleToken(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function resolveAppLanguageFromLocale(input: {
  languageCode?: string | null;
  languageTag?: string | null;
}): SupportedLanguage {
  const code = normalizeLocaleToken(input.languageCode);
  const tag = normalizeLocaleToken(input.languageTag);

  if (code === 'hr' || tag.startsWith('hr')) {
    return 'hr';
  }

  return 'en';
}
