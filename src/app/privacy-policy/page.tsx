
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
                        Welcome to SmartPDFx. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and its tools.
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
                        <li><strong>File Deletion:</strong> To protect your privacy, all uploaded files are automatically and permanently deleted from our servers within one hour of processing. We do not store your files longer than necessary to provide the service.</li>
                        <li><strong>Security Measures:</strong> We use standard security measures, including HTTPS encryption, to protect data transmitted between your browser and our servers.</li>
                    </ul>

                    <h2>4. Advertising and Third-Party Services</h2>
                    <p>We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
                    <ul>
                        <li>Google's use of the DART cookie enables it to serve ads to your users based on their visit to your sites and other sites on the Internet.</li>
                        <li>Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.</li>
                    </ul>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to use our service with the assurance that your data is handled responsibly. Since we do not create user accounts or store personal information, the primary right is the control you have over the files you upload. You can be assured that your files are not stored on our systems after the brief processing period.</p>

                    <h2>6. Changes to This Privacy Policy</h2>
                    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                    <h2>7. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us through our contact page.</p>
                </CardContent>
            </Card>
        </main>
    );
}
