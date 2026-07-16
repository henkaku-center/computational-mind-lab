import en from './ui.en.json';
import ja from './ui.ja.json';

export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const dictionaries: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  ja: ja as Record<string, string>,
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ja' : 'en';
}

/** getStaticPaths helper: one path per locale. */
export function localeStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

/** Swap the locale prefix of a path: /en/news/x/ -> /ja/news/x/ */
export function swapLocalePath(path: string, to: Locale): string {
  const stripped = path.replace(/^\/(en|ja)(\/|$)/, '/');
  return `/${to}${stripped === '/' ? '/' : stripped}`;
}

export function formatDate(date: Date, locale: Locale): string {
  if (locale === 'ja') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
