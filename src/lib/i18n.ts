import 'server-only'
import { locales, defaultLocale, type Locale, isRtl } from '@/i18n/config'

type Dict = Record<string, any>

export async function getDictionary(locale: Locale): Promise<Dict> {
  const safeLocale = locales.includes(locale) ? locale : defaultLocale
  const dict = (await import(`@/i18n/dictionaries/${safeLocale}.json`)).default as Dict
  return dict
}

export function t(dict: Dict, path: string, fallback?: string): string {
  const parts = path.split('.')
  let cur: any = dict
  for (const p of parts) {
    cur = cur?.[p]
    if (cur === undefined || cur === null) {
      return fallback ?? path
    }
  }
  return typeof cur === 'string' ? cur : fallback ?? path
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return isRtl[locale] ? 'rtl' : 'ltr'
}