export type Locale = 'en' | 'hi' | 'es' | 'fr' | 'de'

export const locales: Locale[] = ['en', 'hi', 'es', 'fr', 'de']
export const defaultLocale: Locale = 'en'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

// For building hreflang and region-specific alternates
export const hreflangMap: Record<Locale, string> = {
  en: 'en',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
}

export const isRtl: Record<Locale, boolean> = {
  en: false,
  hi: false,
  es: false,
  fr: false,
  de: false,
}