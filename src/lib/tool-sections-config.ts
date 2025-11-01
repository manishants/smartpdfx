import { 
  FileArchive, 
  Layers, 
  Scissors, 
  FileText, 
  FileImage, 
  Shield, 
  Zap, 
  CheckCircle, 
  Clock, 
  Download,
  Upload,
  Settings,
  Sparkles,
  Target,
  Users,
  Globe,
  Lock,
  Gauge,
  Wand2
} from 'lucide-react';

// NOTE: For dynamic CMS-based sections, use the useToolSections hook instead
// This file provides default/fallback sections for backward compatibility

export const getToolSections = (toolName: string) => {
  const commonSections = [
    // Hero Section 1
    {
      type: 'hero' as const,
      title: `Professional ${toolName} Solution`,
      description: `Transform your PDF workflow with our advanced ${toolName.toLowerCase()} technology. Built for professionals who demand quality, speed, and reliability in their document processing.`,
      features: [
        { icon: Zap, text: 'Lightning Fast' },
        { icon: Shield, text: 'Secure Processing' }
      ],
      imagePlaceholder: { icon: FileArchive, text: `${toolName} Preview` },
      gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: 'text-primary'
    },
    
    // Content Section 1
    {
      type: 'hero' as const,
      title: 'Why Choose Our Platform?',
      description: 'We provide enterprise-grade PDF processing with consumer-friendly simplicity. Our platform handles millions of documents monthly, trusted by professionals worldwide for critical document workflows.'
    },
    
    // Hero Section 2
    {
      type: 'hero' as const,
      title: 'Advanced AI Technology',
      description: `Our AI-powered engine analyzes your documents to optimize the ${toolName.toLowerCase()} process. Smart algorithms ensure the best results while maintaining document integrity and formatting.`,
      features: [
        { icon: Sparkles, text: 'AI-Powered' },
        { icon: Target, text: 'Precision Processing' }
      ],
      imagePlaceholder: { icon: Wand2, text: 'AI Technology' },
      gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: 'text-primary'
    },
    
    // Content Section 2
    {
      type: 'hero' as const,
      title: 'Trusted by Millions',
      description: 'Join over 2 million users who rely on our platform for their daily PDF needs. From small businesses to Fortune 500 companies, our tools power document workflows across industries.'
    },
    
    // Hero Section 3
    {
      type: 'hero' as const,
      title: 'Security & Privacy First',
      description: 'Your documents are processed with bank-level security. All files are encrypted during transfer and processing, then automatically deleted from our servers within one hour.',
      features: [
        { icon: Lock, text: 'End-to-End Encryption' },
        { icon: Clock, text: 'Auto-Delete Files' }
      ],
      imagePlaceholder: { icon: Shield, text: 'Security Features' },
      gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: 'text-primary'
    },
    
    // Content Section 3
    {
      type: 'hero' as const,
      title: 'No Software Installation Required',
      description: 'Work directly in your browser with our cloud-based platform. No downloads, no installations, no compatibility issues. Access your tools from any device, anywhere in the world.'
    },
    
    // Hero Section 4
    {
      type: 'hero' as const,
      title: 'Lightning-Fast Processing',
      description: `Experience blazing-fast ${toolName.toLowerCase()} with our optimized cloud infrastructure. Most documents are processed in seconds, not minutes, so you can focus on what matters most.`,
      features: [
        { icon: Gauge, text: 'High Performance' },
        { icon: Globe, text: 'Global CDN' }
      ],
      imagePlaceholder: { icon: Zap, text: 'Speed Optimization' },
      gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: 'text-primary'
    },
    
    // Content Section 4
    {
      type: 'hero' as const,
      title: 'Free to Use, Always',
      description: 'Our core PDF tools are completely free with no hidden fees, watermarks, or usage limits. We believe everyone should have access to professional-grade document tools.'
    },
    
    // Hero Section 5
    {
      type: 'hero' as const,
      title: 'Professional Results Every Time',
      description: `Get consistent, high-quality results with every ${toolName.toLowerCase()} operation. Our advanced algorithms preserve document formatting, fonts, and layout integrity.`,
      features: [
        { icon: CheckCircle, text: 'Quality Guaranteed' },
        { icon: Settings, text: 'Advanced Options' }
      ],
      imagePlaceholder: { icon: Target, text: 'Quality Results' },
      gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: 'text-primary'
    },
    
    // Content Section 5
    {
      type: 'hero' as const,
      title: 'Join Our Community',
      description: 'Become part of a growing community of professionals who trust our platform for their document needs. Get updates on new features, tips, and best practices for PDF management.'
    }
  ];

  return commonSections;
};

// Tool-specific customizations
export const getCustomToolSections = (toolName: string) => {
  const baseSections = getToolSections(toolName);

  // Simple slug normalizer: "Photo Enhancer" -> "photo-enhancer"
  const slug = toolName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Page-wise overrides for content & images (editable per tool)
  const TOOL_SECTIONS_OVERRIDES: Record<string, typeof baseSections> = {
    'photo-enhancer': [
      {
        type: 'hero',
        title: 'Enhance Photos Effortlessly',
        description: 'Improve clarity, color, and lighting using AI-driven enhancement tuned for documents and images.',
        features: [
          { icon: Sparkles, text: 'AI Enhancement' },
          { icon: Gauge, text: 'Fast Results' },
        ],
        imagePlaceholder: { icon: Wand2, text: 'Photo Enhancement Preview' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Designed for Real Documents', description: 'Optimized for IDs, documents, and scans with readable output.' },
      {
        type: 'hero',
        title: 'Smart Noise Reduction',
        description: 'Automatically reduce noise while preserving edges and text.',
        features: [ { icon: Target, text: 'Precision' } ],
        imagePlaceholder: { icon: Shield, text: 'Noise Control' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Secure & Private', description: 'Files are processed securely and removed automatically.' },
      {
        type: 'hero',
        title: 'Batch Processing',
        description: 'Process multiple images at once without losing quality.',
        features: [ { icon: CheckCircle, text: 'Consistent Quality' } ],
        imagePlaceholder: { icon: Layers, text: 'Batch Mode' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Works in Your Browser', description: 'No downloads required. Accessible on any device.' },
    ],

    'image-converter': [
      {
        type: 'hero',
        title: 'Convert Images Seamlessly',
        description: 'Transform between formats like PNG, JPG, and WEBP quickly.',
        features: [ { icon: Zap, text: 'High Speed' }, { icon: CheckCircle, text: 'Quality Preserved' } ],
        imagePlaceholder: { icon: FileImage, text: 'Format Conversion' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Optimized Output', description: 'Balanced size and quality suited for web and print.' },
      {
        type: 'hero',
        title: 'Metadata Handling',
        description: 'Control EXIF metadata preservation or removal during conversion.',
        features: [ { icon: Settings, text: 'Advanced Options' } ],
        imagePlaceholder: { icon: FileArchive, text: 'Metadata Control' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Secure Processing', description: 'We encrypt files in transit and delete them automatically.' },
    ],

    'image-resizer': [
      {
        type: 'hero',
        title: 'Resize Images Accurately',
        description: 'Set exact dimensions or choose presets while maintaining aspect ratio.',
        features: [ { icon: Gauge, text: 'Precision Sizing' }, { icon: Target, text: 'Aspect Ratio' } ],
        imagePlaceholder: { icon: FileImage, text: 'Resize Preview' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Smart Upscaling', description: 'AI upscaling reduces blur and preserves details.' },
    ],

    'rotate-pdf': [
      {
        type: 'hero',
        title: 'Rotate PDF Pages Instantly',
        description: 'Fix orientation issues for scanned documents and mixed layouts.',
        features: [ { icon: Zap, text: 'Instant Rotation' }, { icon: CheckCircle, text: 'Lossless' } ],
        imagePlaceholder: { icon: FileText, text: 'Rotation Preview' },
        gradient: 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
        iconColor: 'text-primary',
      },
      { type: 'hero', title: 'Page-wise Control', description: 'Rotate specific pages or entire documents as needed.' },
    ],
  };

  return TOOL_SECTIONS_OVERRIDES[slug] || baseSections;
};