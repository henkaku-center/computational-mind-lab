import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

type LocalizedEntry = CollectionEntry<'news'> | CollectionEntry<'projects'>;

export interface LocalizedResult<T extends LocalizedEntry> {
  entry: T;
  /** true when the requested locale was missing and we fell back to the other locale */
  isFallback: boolean;
}

/**
 * Resolve one entry per translationKey for the requested locale,
 * falling back to the counterpart locale when a translation is missing.
 */
export function getLocalized<T extends LocalizedEntry>(entries: T[], locale: Locale): LocalizedResult<T>[] {
  const byKey = new Map<string, T[]>();
  for (const entry of entries) {
    if (entry.data.draft) continue;
    const key = entry.data.translationKey;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(entry);
  }
  const results: LocalizedResult<T>[] = [];
  for (const group of byKey.values()) {
    const exact = group.find((e) => e.data.locale === locale);
    if (exact) {
      results.push({ entry: exact, isFallback: false });
    } else {
      results.push({ entry: group[0], isFallback: true });
    }
  }
  results.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
  return results;
}

/** All unique translationKeys across a collection (for getStaticPaths). */
export function allTranslationKeys(entries: LocalizedEntry[]): string[] {
  return [...new Set(entries.filter((e) => !e.data.draft).map((e) => e.data.translationKey))];
}
