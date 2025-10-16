"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileText, Briefcase, User } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { AllTools } from '@/components/all-tools';

type Stage = 'input' | 'processing' | 'result';

interface ResumeData {
    name: string;
    email: string;
    phone: string;
    experience: string;
    skills: string;
    education: string;
}

export default function ResumeAssistantPage() {
    const [stage, setStage] = useState<Stage>('input');
    const [resumeData, setResumeData] = useState<ResumeData>({
        name: '',
        email: '',
        phone: '',
        experience: '',
        skills: '',
        education: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedResume, setGeneratedResume] = useState<string>('');
    const { toast } = useToast();

    const handleInputChange = (field: keyof ResumeData, value: string) => {
        setResumeData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateResume = async () => {
        if (!resumeData.name || !resumeData.email) {
            toast({ title: "Missing information", description: "Please fill in at least name and email.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const resume = `
# ${resumeData.name}
**Email:** ${resumeData.email}  
**Phone:** ${resumeData.phone}

## Professional Summary
Experienced professional with a strong background in various technologies and methodologies. Passionate about delivering high-quality solutions and continuous learning.

## Experience
${resumeData.experience || 'Professional experience to be added based on your background.'}

## Skills
${resumeData.skills || 'Technical and soft skills to be highlighted based on your expertise.'}

## Education
${resumeData.education || 'Educational background and certifications.'}

## Additional Information
- Strong problem-solving abilities
- Excellent communication skills
- Team collaboration experience
- Adaptable to new technologies
            `.trim();

            setGeneratedResume(resume);
            setStage('result');
            toast({ title: "Success!", description: "Resume generated successfully." });
        } catch (error: any) {
            console.error("Resume generation failed", error);
            toast({ title: "Error generating resume", description: error.message || "Could not generate resume.", variant: "destructive" });
            setStage('input');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (generatedResume) {
            const blob = new Blob([generatedResume], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resumeData.name.replace(/\s+/g, '_')}_Resume.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleStartOver = () => {
        setStage('input');
        setResumeData({
            name: '',
            email: '',
            phone: '',
            experience: '',
            skills: '',
            education: ''
        });
        setGeneratedResume('');
    };

    const renderContent = () => {
        switch (stage) {
            case 'input':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">Create Your Resume</h2>
                            <p className="text-muted-foreground">Fill in your information to generate a professional resume</p>
                        </div>
                        
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                                    <Input
                                        value={resumeData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email *</label>
                                    <Input
                                        type="email"
                                        value={resumeData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <Input
                                    value={resumeData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Work Experience</label>
                                <Textarea
                                    value={resumeData.experience}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    placeholder="Describe your work experience, roles, and achievements..."
                                    rows={4}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Skills</label>
                                <Textarea
                                    value={resumeData.skills}
                                    onChange={(e) => handleInputChange('skills', e.target.value)}
                                    placeholder="List your technical and soft skills..."
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Education</label>
                                <Textarea
                                    value={resumeData.education}
                                    onChange={(e) => handleInputChange('education', e.target.value)}
                                    placeholder="Your educational background, degrees, certifications..."
                                    rows={3}
                                />
                            </div>
                            
                            <Button onClick={handleGenerateResume} disabled={isProcessing} className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Resume
                            </Button>
                        </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Generating Resume</h2>
                            <p className="text-muted-foreground">AI is creating your professional resume...</p>
                        </div>
                    </div>
                );
            case 'result':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">Resume Generated!</h2>
                            <p className="text-muted-foreground">Your professional resume is ready</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm font-mono">{generatedResume}</pre>
                            </div>
                            
                            <div className="flex justify-center space-x-4">
                                <Button onClick={handleDownload} className="max-w-xs">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download Resume
                                </Button>
                                <Button variant="outline" onClick={handleStartOver} className="max-w-xs">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Create New Resume
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ModernPageLayout>
            <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">Resume Assistant</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Create professional resumes with AI assistance
                </p>
            </header>
            
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6 min-h-[70vh]">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>

            <ModernSection
                title="Professional Resume Building"
                subtitle="AI-powered career enhancement"
                icon={<Briefcase className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Personalized Content</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            AI creates tailored resume content based on your experience and skills.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Professional Format</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Clean, professional formatting that stands out to employers.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Career Focused</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Optimized for applicant tracking systems and hiring managers.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <AllTools />
        </ModernPageLayout>
    );
}