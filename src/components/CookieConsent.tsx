// Usage: Drop <CookieConsent /> near the root layout to show a bottom banner.
// The component persists consent in localStorage and exposes callbacks to gate scripts.
// Example gating (pseudocode):
//   const consent = JSON.parse(localStorage.getItem('cookie_consent') || '{}');
//   if (consent.status === 'accepted') {
//     loadAnalytics(); // safe to initialize analytics/ad scripts
//   }
//
// TypeScript users: you can add types for props below; JS is provided first.

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import './cookie-consent.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter as CardFooter,
} from '@/components/ui/card'

type Preferences = { analytics: boolean; ads: boolean }

export default function CookieConsent({
  onAccept,
  onReject,
  onSavePreferences,
  consentKey = 'cookie_consent',
  expiryDays = 365,
}: {
  onAccept?: (prefs: Preferences) => void | Promise<void>
  onReject?: () => void | Promise<void>
  onSavePreferences?: (prefs: Preferences) => void | Promise<void>
  consentKey?: string
  expiryDays?: number
}) {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [prefs, setPrefs] = useState<Preferences>({ analytics: true, ads: true })
  const manageBtnRef = useRef<HTMLButtonElement | null>(null)

  // Helper: read consent from localStorage
  const readConsent = () => {
    try {
      const raw = localStorage.getItem(consentKey)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  // Helper: write consent
  const writeConsent = (status: 'accepted' | 'rejected' | 'custom') => {
    const payload = { status, timestamp: new Date().toISOString() }
    localStorage.setItem(consentKey, JSON.stringify(payload))
  }

  // Helper: expiration check
  const isExpired = (iso?: string) => {
    if (!iso) return true
    const ts = new Date(iso).getTime()
    const now = Date.now()
    const daysMs = expiryDays * 24 * 60 * 60 * 1000
    return now - ts > daysMs
  }

  useEffect(() => {
    // Show after mount; respect previously saved consent
    const saved = readConsent()
    if (saved && !isExpired(saved.timestamp)) {
      setVisible(false)
    } else {
      setVisible(true)
    }
    const id = setTimeout(() => setReady(true), 10)
    return () => clearTimeout(id)
  }, [])

  // Return focus to the Manage button when the dialog closes
  useEffect(() => {
    if (!showModal) {
      manageBtnRef.current?.focus()
    }
  }, [showModal])

  const acceptAll = async () => {
    writeConsent('accepted')
    setVisible(false)
    if (onAccept) await onAccept({ analytics: true, ads: true })
  }

  const rejectAll = async () => {
    writeConsent('rejected')
    setVisible(false)
    if (onReject) await onReject()
  }

  const openModal = () => setShowModal(true)
  const closeModal = () => {
    setShowModal(false)
  }

  const saveCustom = async () => {
    writeConsent('custom')
    setVisible(false)
    if (onSavePreferences) await onSavePreferences(prefs)
  }

  const dismissTemporary = () => {
    // Do not persist consent; just hide for now
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Sticky bottom banner styled with shadcn Card */}
      <Card
        data-ready={ready}
        className="cookie-consent-scope fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-auto max-w-2xl transition-all duration-300 ease-out motion-reduce:transition-none data-[ready=true]:opacity-100 opacity-0 data-[ready=true]:translate-y-0 translate-y-2"
        role="region"
        aria-label="Cookie consent banner"
      >
        <Button
          aria-label="Dismiss cookie banner"
          variant="default"
          size="icon"
          className="absolute right-3 top-3"
          onClick={dismissTemporary}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="pt-4 pr-12 pb-2 pl-4">
          <CardTitle className="text-sm font-semibold">We use cookies to improve your experience</CardTitle>
          <CardDescription>
            We and our partners use cookies to provide site functionality, analyze traffic and deliver personalized ads. You can accept all cookies or manage your preferences.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-0 px-4 pb-4 gap-2 flex flex-wrap items-center">
          <Button aria-label="Accept all cookies" variant="default" onClick={acceptAll}>
            Accept All
          </Button>
          <Button
            aria-label="Manage cookie preferences"
            variant="default"
            onClick={openModal}
            ref={manageBtnRef}
          >
            Manage
          </Button>
          <Button asChild variant="default" aria-label="Open privacy policy">
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Modal for managing preferences using shadcn Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="cookie-consent-scope">
          <DialogHeader>
            <DialogTitle>Manage Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="consent-analytics"
                checked={prefs.analytics}
                onCheckedChange={(checked) =>
                  setPrefs((p) => ({ ...p, analytics: Boolean(checked) }))
                }
                aria-label="Enable analytics cookies"
              />
              <Label htmlFor="consent-analytics">Analytics</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="consent-ads"
                checked={prefs.ads}
                onCheckedChange={(checked) =>
                  setPrefs((p) => ({ ...p, ads: Boolean(checked) }))
                }
                aria-label="Enable advertising cookies"
              />
              <Label htmlFor="consent-ads">Personalized Ads</Label>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button aria-label="Save cookie preferences" variant="default" onClick={saveCustom}>
              Save Preferences
            </Button>
            <Button aria-label="Reject all cookies" variant="default" onClick={rejectAll}>
              Reject All
            </Button>
            <Button aria-label="Cancel and close" variant="default" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/*
Tiny Tailwind animation example (respects reduced motion):
- The banner uses transition classes with `motion-reduce:transition-none`.
- You can further customize by adding utility classes or Tailwind keyframes.

Developer notes:
- Integrate analytics/ad scripts inside onAccept/onSavePreferences handlers.
  Example:
    export function loadAnalytics() {
      // initialize your analytics SDK here
    }
    // In a layout or component:
    // <CookieConsent onAccept={() => { loadAnalytics(); }} />

- Testing localStorage:
  - Open DevTools → Application → Local Storage, observe `cookie_consent`.
  - Delete the key or tweak expiryDays to simulate expiration.

Usage example:
  import CookieConsent from './CookieConsent'

  export default function AppRootLayout({ children }) {
    const handleAccept = ({ analytics, ads }) => {
      if (analytics) {
        // if (JSON.parse(localStorage.getItem('cookie_consent')||'{}').status === 'accepted') loadAnalytics()
        // loadAnalytics(); // safe to initialize
      }
    }
    const handleReject = () => {
      // stop or avoid initializing non-essential scripts
    }
    const handleSavePrefs = (prefs) => {
      if (prefs.analytics) {
        // loadAnalytics();
      }
      // decide on ads based on prefs.ads
    }
    return (
      <>
        <CookieConsent
          onAccept={handleAccept}
          onReject={handleReject}
          onSavePreferences={handleSavePrefs}
        />
        {children}
      </>
    )
  }
*/