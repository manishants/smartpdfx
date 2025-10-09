
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
    return (
        <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
                     <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p>
                        Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the SmartPDFx website (the "Service") operated by SmartPDFx ("us", "we", or "our").
                    </p>
                    <p>
                        Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.
                    </p>

                    <h2>1. Use of Service</h2>
                    <p>
                        SmartPDFx provides a collection of online tools for document and image processing. You agree to use our services for their intended purposes. You are responsible for the content of the files you upload. You agree not to upload any files that are illegal, malicious, or infringe on the copyrights of others.
                    </p>

                    <h2>2. File Handling and Privacy</h2>
                    <p>
                        We are committed to user privacy. All files uploaded to our servers are processed automatically and are permanently deleted within one hour. We do not access, view, or store your files beyond this temporary processing window. Please review our Privacy Policy for more detailed information.
                    </p>
                    
                    <h2>3. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of SmartPDFx. You may not duplicate, copy, or reuse any portion of the HTML/CSS, Javascript, or visual design elements or concepts without express written permission from us.
                    </p>

                    <h2>4. Disclaimers and Limitation of Liability</h2>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted, secure, or error-free.
                    </p>
                     <p>
                        While we strive for accuracy, we do not guarantee that the processing of your files will be flawless. The output from our tools should be reviewed for accuracy. SmartPDFx shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses, resulting from the use of our services.
                    </p>
                    
                    <h2>5. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of our jurisdiction, without regard to its conflict of law provisions.
                    </p>

                    <h2>6. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
