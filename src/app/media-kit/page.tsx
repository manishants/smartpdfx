import { ModernSection } from "@/components/modern-section";
import PageSectionsRenderer from "@/components/page-sections-renderer";

export const dynamic = 'force-dynamic';

export default function MediaKitPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Media Kit</h1>
        <p className="mt-2 text-muted-foreground">
          Brand assets, logos, and usage guidelines for press and partners.
        </p>
      </header>

      <ModernSection title="Overview" className="mt-10">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            Use our official assets when referencing SmartPDFX. Avoid altering colors, proportions,
            or applying effects. If you need a specific format or resolution, reach out and we’ll help.
          </p>
          <ul>
            <li>Do not rotate, stretch, or skew the logo.</li>
            <li>Maintain clear space around the logo equal to the logo height.</li>
            <li>Use on solid backgrounds for legibility.</li>
          </ul>
        </div>
      </ModernSection>

      {/* Builder-managed sections render below; add sections from Superadmin */}
      <PageSectionsRenderer slug="media-kit" />
    </div>
  );
}