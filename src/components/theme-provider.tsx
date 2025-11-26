"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useTheme } from "next-themes"

function computeISTTheme(): "light" | "dark" {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const istMs = utcMs + (5 * 60 + 30) * 60 * 1000
  const ist = new Date(istMs)
  const hours = ist.getHours()
  return hours >= 6 && hours < 18 ? "light" : "dark"
}

function AutoThemeController() {
  const { theme, setTheme } = useTheme()
  React.useEffect(() => {
    const OVERRIDE_KEY = "smartpdfx-theme-override"
    const applyAuto = () => {
      try {
        const override = localStorage.getItem(OVERRIDE_KEY) === "true"
        if (override) return
        const target = computeISTTheme()
        if (theme !== target) setTheme(target)
      } catch {}
    }
    applyAuto()
    const interval = setInterval(applyAuto, 60 * 1000)
    return () => clearInterval(interval)
  }, [theme, setTheme])
  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const defaultTheme = computeISTTheme()
  return (
    <NextThemesProvider
      {...props}
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey="smartpdfx-theme"
    >
      <AutoThemeController />
      {children}
    </NextThemesProvider>
  )
}
