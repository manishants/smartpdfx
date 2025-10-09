
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Zap, Goal } from "lucide-react";

export default function AboutUsPage() {
    return (
        <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
            <div className="space-y-12">
                <header className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About SmartPDFx</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your one-stop solution for simple, fast, and secure document and image management.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                       <div className="flex items-center gap-3">
                            <Goal className="h-8 w-8 text-primary" />
                            <CardTitle>Our Mission: A Better, Freer Internet</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            In a digital world, documents and images are central to our personal and professional lives. Yet, managing them can often be complicated, expensive, or insecure. SmartPDFx was born from a simple idea: to create a suite of powerful, free, and easy-to-use tools that are accessible to everyone, everywhere.
                        </p>
                        <p>
                            Our mission is to empower users by simplifying complex tasks. We believe that you shouldn't have to deal with aggressive pop-ups, hourly limits, or pay a premium for features that should be straightforward. Whether you need to compress a large file, convert a document, or secure private information, you should be able to do so without friction. We are committed to building tools that respect your privacy and your time.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Fast & Efficient</h3>
                        <p className="text-muted-foreground mt-2">Our tools are designed for speed. Get your tasks done in seconds, not minutes, with our optimized cloud-based processing.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">User-Focused</h3>
                        <p className="text-muted-foreground mt-2">We build for you. With clean interfaces and straightforward functionality, our tools are intuitive for both beginners and pros.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Privacy First</h3>
                        <p className="text-muted-foreground mt-2">We respect your privacy. Files you upload are processed securely and are automatically deleted from our servers within one hour.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Our Commitment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            SmartPDFx is a project driven by passion and a commitment to open accessibility. We are constantly working to improve our existing tools and develop new ones to meet your evolving needs. We believe in the power of free tools to level the playing field, and we are proud to offer this service to our users.
                        </p>
                        <p>
                            Thank you for choosing SmartPDFx. We're excited to be part of your productivity toolkit.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}
