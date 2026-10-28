import he from './he.json';
import en from './en.json';

export const LOCALES = ['he', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'he';

export type Dict = typeof he;
const dicts: Record<Locale, Dict> = { he, en: en as unknown as Dict };

export function isLocale(x: string | undefined): x is Locale {
  return !!x && (LOCALES as readonly string[]).includes(x);
}

/** The whole dictionary for a locale. Pages read `t.home.hero.title`. */
export function useTranslations(locale: Locale): Dict {
  return dicts[locale];
}

export function dirOf(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'he' ? 'en' : 'he';
}

/** Locale-independent path ("/", "/work/boostcoach") → "/he/work/boostcoach". */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

/** Strip the locale prefix from a pathname: "/he/work/x/" → "/work/x". */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(he|en)(\/.*)?$/);
  const rest = (m ? m[2] : pathname) || '/';
  return rest.replace(/\/+$/, '') || '/';
}

export function localeFromPath(pathname: string): Locale {
  const m = pathname.match(/^\/(he|en)(\/|$)/);
  return m && isLocale(m[1]) ? m[1] : DEFAULT_LOCALE;
}
