import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModernPageLayout } from '@/components/modern-page-layout'
import { ModernSection } from '@/components/modern-section'
import { AllTools } from '@/components/all-tools'

export default function NotFound() {
  return (
    <ModernPageLayout
      title="Page Not Found"
      description="The page you’re looking for doesn’t exist or may have moved."
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
            <FileQuestion className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">404 — Page Not Found</h1>
          <p className="text-muted-foreground">
            Sorry, we couldn’t find that page. Check the URL or explore our tools below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </ModernSection>

      <ModernSection>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-3">Explore More Tools</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Discover our popular PDF and image tools to get your work done.
          </p>
          <AllTools />
        </div>
      </ModernSection>
    </ModernPageLayout>
  )
}