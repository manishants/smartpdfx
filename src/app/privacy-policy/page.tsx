
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                    <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p>
                        Welcome to SmartPDFx. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and tools.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>We minimize data collection to what is essential for providing our services.</p>
                    <ul>
                        <li><strong>Uploaded Files:</strong> The files you upload for processing (e.g., PDFs, images) are sent to our servers solely for the purpose of performing the requested operation.</li>
                        <li><strong>Usage Data:</strong> We may collect non-personal information about how you interact with our services, such as the tools you use and the frequency of your visits. This helps us understand user needs and improve our website. This data is anonymized and cannot be used to identify you.</li>
                        <li><strong>Cookies:</strong> We use cookies to enhance your experience. Cookies are small files stored on your device that help our website function correctly. We may use cookies for purposes such as session management and analytics.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <ul>
                        <li><strong>To Provide and Maintain Our Service:</strong> Your uploaded files are used only to perform the function you have selected (e.g., compressing a PDF, converting an image).</li>
                        <li><strong>To Improve Our Service:</strong> Anonymized usage data helps us identify popular features and areas for improvement.</li>
                    </ul>

                    <h2>3. Data Handling and Security</h2>
                    <p>We take your privacy and security seriously.</p>
                    <ul>
                        <li><strong>File Processing:</strong> All file processing is done automatically. There is no manual intervention or viewing of your files by our team.</li>
                        <li><strong>File Deletion:</strong> Uploaded files are automatically and permanently deleted from our servers within one hour of processing. We do not store your files longer than necessary to provide the service.</li>
                        <li><strong>Security Measures:</strong> We use standard security measures, including HTTPS encryption, to protect data transmitted between your browser and our servers.</li>
                    </ul>

                    <h2>4. Advertising and Cookies (Google AdSense)</h2>
                    <p>We use Google AdSense to display ads. AdSense may use cookies to serve ads based on a user's prior visits to this and other websites.</p>
                    <ul>
                        <li>Google and its partners use advertising cookies to serve ads based on your visits to this and other sites.</li>
                        <li>You can opt out of personalized advertising by visiting Google's Ads Settings: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">https://adssettings.google.com</a>.</li>
                        <li>Alternatively, opt out of some third-party vendors' use of cookies for personalized ads at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">https://www.aboutads.info/choices/</a>.</li>
                        <li>Review Google's Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.</li>
                    </ul>

                    <h3>Third-Party Links</h3>
                    <p>Our site may include links to third-party websites. We are not responsible for their privacy practices. Please review the privacy policies of any external sites you visit.</p>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to use our service with the assurance that your data is handled responsibly. Since we do not create user accounts or store personal information, your primary right is control over the files you upload.</p>

                    <h2>6. Children's Privacy</h2>
                    <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>

                    <h2>7. Changes to This Privacy Policy</h2>
                    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                    <h2>8. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us through our contact page.</p>
                </CardContent>
            </Card>
        </main>
    );
}
