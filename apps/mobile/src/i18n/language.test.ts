import { describe, expect, it } from 'vitest';
import { resolveAppLanguageFromLocale } from './language';

describe('resolveAppLanguageFromLocale', () => {
  it('returns hr when languageCode is hr', () => {
    expect(resolveAppLanguageFromLocale({ languageCode: 'hr' })).toBe('hr');
  });

  it('returns hr when languageTag starts with hr', () => {
    expect(resolveAppLanguageFromLocale({ languageTag: 'hr-HR' })).toBe('hr');
  });

  it('returns en for any non-hr locale', () => {
    expect(resolveAppLanguageFromLocale({ languageCode: 'en' })).toBe('en');
    expect(resolveAppLanguageFromLocale({ languageCode: 'de' })).toBe('en');
    expect(resolveAppLanguageFromLocale({ languageTag: 'it-IT' })).toBe('en');
  });

  it('returns en when locale data is missing', () => {
    expect(resolveAppLanguageFromLocale({})).toBe('en');
    expect(resolveAppLanguageFromLocale({ languageCode: null, languageTag: null })).toBe('en');
  });
});
