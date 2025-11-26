import { ModernSection } from "@/components/modern-section";
import PageSectionsRenderer from "@/components/page-sections-renderer";

export const dynamic = 'force-dynamic';

export default function WriteForUsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Write for Us</h1>
        <p className="mt-2 text-muted-foreground">
          Share your expertise with our audience. If we like it and it fits our niche, we’ll publish it within a week.
        </p>
      </header>

      <ModernSection title="Submission Guidelines" className="mt-10">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            We welcome practical, well-researched articles related to PDFs, document workflows,
            productivity, automation, and developer tooling around content processing.
          </p>
          <ul>
            <li>Original content (not previously published elsewhere).</li>
            <li>Actionable insights and clear examples (800–1,500 words recommended).</li>
            <li>Include a short author bio and relevant links.</li>
            <li>Attach images or diagrams if helpful (ensure you have rights).</li>
          </ul>
          <p>
            Send your article to <a href="mailto:editor@smartpdfx.com" className="underline">editor@smartpdfx.com</a>.
            If approved and relevant, we aim to publish within a week.
          </p>
          <p>
            Prefer reaching out first? Use our <a href="/contact" className="underline">contact page</a> with “Write for Us” in the subject.
          </p>
        </div>
      </ModernSection>

      {/* Optional builder-managed sections render below */}
      <PageSectionsRenderer slug="write-for-us" />
    </div>
  );
}