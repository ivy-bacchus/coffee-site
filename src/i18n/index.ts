import ja from './ja.json';
import en from './en.json';

export const languages = {
  ja: '日本語',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'ja';

const translations = { ja, en } as const;

type NestedRecord = { [key: string]: string | NestedRecord };

function getNestedValue(obj: NestedRecord, path: string): string {
  const keys = path.split('.');
  let current: string | NestedRecord = obj;
  for (const key of keys) {
    if (typeof current === 'string') return path;
    current = current[key];
    if (current === undefined) return path;
  }
  return typeof current === 'string' ? current : path;
}

export function t(lang: Lang, key: string): string {
  return getNestedValue(translations[lang] as unknown as NestedRecord, key);
}

export function getStaticPathsForLang() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}
