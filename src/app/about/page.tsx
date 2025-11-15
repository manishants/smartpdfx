
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Zap, Goal, Sparkles, Star, Heart, Trophy, Linkedin, Twitter, Mail } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { getPageSEO } from "@/lib/seoStore";
export const dynamic = 'force-dynamic';

const teamMembers = [
  {
    id: 1,
    name: "Manish Singh",
    title: "Founder & CEO of Smartpdfx",
    description: "Manish Singh, the visionary Founder of Smartpdfx, comes from a strong technical background and has always been passionate about building digital solutions that empower people. The idea of Smartpdfx was born when Manish noticed that most of the popular online PDF tools were developed by foreign companies and charged users for even basic features. Believing that technology should be accessible to everyone, he envisioned creating a 100% free, made-in-India alternative.\n\nWith his deep understanding of web technologies, Manish took the initiative to design, develop, and launch Smartpdfx from the ground up. He later shared this innovative idea with Nishant Singh, his like-minded partner, who also came from a technical background. Together, they refined the vision and laid the foundation for what is now one of India's most promising free PDF tool platforms.\n\nManish's leadership is driven by innovation, transparency, and a mission to make Smartpdfx a global name in digital productivity — proudly built in India, for the world.",
    seoKeywords: "Manish Singh Smartpdfx, CEO of Smartpdfx, Indian free PDF tools founder, made in India PDF website",
    image: "/team/ceo_founder_manish_singh_smartpdfx.png",
    role: "Visionary Leader",
    badges: ["CEO", "Founder", "Tech Visionary"]
  },
  
  {
    id: 3,
    name: "Sumitra Singh",
    title: "Investor & HR Director",
    description: "Sumitra Singh, Investor and HR Director at Smartpdfx, brings years of experience from her professional career in Human Resources in Bengaluru's corporate ecosystem. When she heard about Manish and Nishant's vision to build a completely free suite of online PDF tools, she immediately connected with the idea. Having often used paid productivity tools in her own work, she understood the value of creating something free, efficient, and user-friendly for professionals and students alike.\n\nSumitra decided to invest in Smartpdfx not only financially but also strategically, helping to shape its HR structure, company culture, and long-term organizational goals. Her insight into people management and team development has played a vital role in building a collaborative and motivated workforce behind Smartpdfx.\n\nWith her belief that innovation and inclusivity drive real success, Sumitra continues to ensure that Smartpdfx remains a people-first company — one that empowers both its users and its team members.",
    seoKeywords: "Sumitra Singh Smartpdfx, HR Director Smartpdfx, investor in Indian startup, female investor India",
    image: "/team/sumitra_singh_hr_director.webp",
    role: "People & Culture Leader",
    badges: ["HR Director", "Investor", "Culture Champion"]
  },
  {
    id: 4,
    name: "Nishant Singh",
    title: "Co-Founder",
    description: "Nishant Singh, Co-Founder of Smartpdfx, is a technology enthusiast and a strong advocate for digital independence. With a background in software development, Nishant has always been driven by innovation and simplicity in user experience. When Manish Singh shared his idea of building a free Indian alternative to costly foreign PDF platforms, Nishant instantly recognized its potential and came on board as Co-Founder.\n\nHis deep technical understanding and strategic input have been instrumental in guiding Smartpdfx's development. Nishant focuses on improving platform performance, security, and usability — ensuring every user enjoys a seamless experience. He continuously provides direction and advice, helping the team refine and enhance the product.\n\nNishant's vision is to make Smartpdfx a trusted global brand from India, offering users world-class tools without the barrier of cost. His dedication and technical acumen make him a cornerstone of the company's innovation and growth.",
    seoKeywords: "Nishant Singh Smartpdfx, Co-Founder Smartpdfx, Indian tech entrepreneur, free PDF tools developer",
    image: "/team/nishant_singh_cofounder.jpg",
    role: "Technical Innovator",
    badges: ["Co-Founder", "Tech Lead", "Product Strategist"]
  }
];

export default function AboutUsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
                    <div className="text-center space-y-8">
                        <div className="flex justify-center">
                            <Badge className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Meet Our Amazing Team
                            </Badge>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                            About SmartPDFx
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                            Built with passion in India, SmartPDFx is revolutionizing document management with 100% free, 
                            world-class tools that empower millions of users globally.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 shadow-lg">
                                <Heart className="w-5 h-5 text-red-500" />
                                <span className="text-sm font-medium">Made with Love in India</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 shadow-lg">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium">100% Free Forever</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl border border-white/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                        <div className="relative p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                                        <Goal className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Our Mission: A Better, Freer Internet
                                </h2>
                            </div>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p>
                                    In a digital world, documents and images are central to our personal and professional lives. Yet, managing them can often be complicated, expensive, or insecure. SmartPDFx was born from a simple idea: to create a suite of powerful, free, and easy-to-use tools that are accessible to everyone, everywhere.
                                </p>
                                <p>
                                    Our mission is to empower users by simplifying complex tasks. We believe that you shouldn't have to deal with aggressive pop-ups, hourly limits, or pay a premium for features that should be straightforward. Whether you need to compress a large file, convert a document, or secure private information, you should be able to do so without friction. We are committed to building tools that respect your privacy and your time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="w-full py-20 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Meet Our <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Team</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            The passionate minds behind SmartPDFx, working tirelessly to bring you the best free document tools.
                        </p>
                    </div>

                    <div className="space-y-20">
                        {teamMembers.map((member, index) => (
                            <div key={member.id} className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                                {/* Image */}
                                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-3xl" />
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={600}
                                            height={400}
                                            className="relative mx-auto aspect-video overflow-hidden object-cover w-full shadow-2xl border border-white/10"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col justify-center space-y-8 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border-primary/20">
                                                <Star className="w-3 h-3 mr-1" />
                                                {member.role}
                                            </Badge>
                                        </div>
                                        
                                        <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
                                            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                                                {member.name}
                                            </span>
                                        </h3>
                                        
                                        <p className="text-xl font-medium text-primary">
                                            {member.title}
                                        </p>
                                        
                                        <div className="prose prose-lg dark:prose-invert max-w-none">
                                            {member.description.split('\n\n').slice(0, 2).map((paragraph, pIndex) => (
                                                <p key={pIndex} className="text-muted-foreground leading-relaxed">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {member.badges.map((badge, bIndex) => (
                                                <Badge key={bIndex} variant="outline" className="bg-background/50 border-primary/20">
                                                    {badge}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex gap-3 pt-4">
                                            <div className="p-2 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                                                <Linkedin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="p-2 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                                                <Twitter className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="p-2 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                                                <Mail className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6">
                            Our Core Values
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/10 overflow-hidden">
                            <div className="p-8">
                                <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 mb-6 mx-auto w-fit">
                                    <Zap className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Fast & Efficient</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Our tools are designed for speed. Get your tasks done in seconds, not minutes, with our optimized cloud-based processing.
                                </p>
                            </div>
                        </div>

                        <div className="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/10 overflow-hidden">
                            <div className="p-8">
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 mb-6 mx-auto w-fit">
                                    <Users className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">User-Focused</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    We build for you. With clean interfaces and straightforward functionality, our tools are intuitive for both beginners and pros.
                                </p>
                            </div>
                        </div>

                        <div className="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-white/10 overflow-hidden">
                            <div className="p-8">
                                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 mb-6 mx-auto w-fit">
                                    <Shield className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Privacy First</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    We respect your privacy. Files you upload are processed securely and are automatically deleted from our servers within one hour.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Commitment Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-white/20 backdrop-blur-sm">
                                        <Star className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold">Our Commitment to You</h2>
                            </div>
                            <div className="space-y-6 text-lg leading-relaxed">
                                <p>
                                    SmartPDFx is a project driven by passion and a commitment to open accessibility. We are constantly working to improve our existing tools and develop new ones to meet your evolving needs. We believe in the power of free tools to level the playing field, and we are proud to offer this service to our users.
                                </p>
                                <p className="text-center text-xl font-semibold">
                                    Thank you for choosing SmartPDFx. We're excited to be part of your productivity toolkit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* JSON-LD Schema for AboutPage */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'AboutPage',
                  name: 'About SmartPDFx',
                  url: 'https://smartpdfx.com/about',
                  description: 'Learn about SmartPDFx, our mission, team, and commitment to free, privacy-first document tools.',
                  publisher: {
                    '@type': 'Organization',
                    name: 'SmartPDFx',
                    url: 'https://smartpdfx.com'
                  }
                })
              }}
            />
        </main>
    );
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = getPageSEO("/about");
  const title = seo?.title?.trim();
  const description = seo?.description?.trim();
  const keywords = seo?.keywords && seo.keywords.length > 0 ? seo.keywords : undefined;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: "/about" },
  };
}
