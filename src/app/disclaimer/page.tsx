import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisclaimerPage() {
  return (
    <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Disclaimer</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            The information and tools provided by SmartPDFx are offered for general informational and utility
            purposes only. While we strive to ensure accuracy and reliability, we make no warranties, express
            or implied, regarding the results produced by our tools.
          </p>

          <h2>1. No Professional Advice</h2>
          <p>
            SmartPDFx does not provide legal, financial, or professional advice. You should consult a qualified
            professional for advice specific to your situation.
          </p>

          <h2>2. File Processing and Data</h2>
          <ul>
            <li><strong>Automatic Processing:</strong> Files are processed automatically by our systems.</li>
            <li><strong>Deletion:</strong> Uploaded files are automatically deleted within one hour of processing.</li>
            <li><strong>No Guarantees:</strong> We do not guarantee the accuracy, completeness, or suitability of processed outputs.</li>
          </ul>

          <h2>3. Limitation of Liability</h2>
          <p>
            SmartPDFx shall not be liable for any losses or damages arising from your use of the Service, including
            but not limited to data loss, loss of business, or other consequential damages.
          </p>

          <h2>4. Third‑Party Links and Ads</h2>
          <p>
            Our website may include links to external sites and display third‑party advertisements (e.g., Google AdSense).
            We do not control third‑party content or policies. Please review the privacy and cookie policies of those providers.
          </p>

          <h2>5. Changes</h2>
          <p>
            We may update this Disclaimer from time to time. Updates will be posted on this page.
          </p>

          <h2>6. Contact</h2>
          <p>
            For questions about this Disclaimer, please contact us via the Contact page.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}