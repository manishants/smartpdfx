"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { locales, localeLabels } from '@/i18n/config'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function stripLocale(pathname: string): { base: string; locale: string | null } {
  const match = pathname.match(/^\/(en|hi|es|fr|de)(?:\/(.*))?$/)
  if (match) {
    const current = match[1]
    const rest = match[2] ? `/${match[2]}` : '/'
    return { base: rest, locale: current }
  }
  return { base: pathname || '/', locale: null }
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const { base, locale } = stripLocale(pathname)
  const current = (locale && locales.includes(locale as any)) ? (locale as any) : null

  const handleSelect = (l: string) => {
    router.push(`/${l}${base === '/' ? '' : base}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent" aria-label="Change language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((l) => (
          <DropdownMenuItem key={l} onClick={() => handleSelect(l)} className="flex items-center justify-between">
            <span>{localeLabels[l]}</span>
            {current === l && <span className="text-xs text-muted-foreground">Current</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}