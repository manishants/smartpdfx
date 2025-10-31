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
      gradient: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-500'
    },
    
    // Content Section 1
    {
      type: 'content' as const,
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
      gradient: 'bg-gradient-to-br from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-500'
    },
    
    // Content Section 2
    {
      type: 'content' as const,
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
      gradient: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
      iconColor: 'text-green-500'
    },
    
    // Content Section 3
    {
      type: 'content' as const,
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
      gradient: 'bg-gradient-to-br from-orange-500/10 to-orange-500/5',
      iconColor: 'text-orange-500'
    },
    
    // Content Section 4
    {
      type: 'content' as const,
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
      gradient: 'bg-gradient-to-br from-red-500/10 to-red-500/5',
      iconColor: 'text-red-500'
    },
    
    // Content Section 5
    {
      type: 'content' as const,
      title: 'Join Our Community',
      description: 'Become part of a growing community of professionals who trust our platform for their document needs. Get updates on new features, tips, and best practices for PDF management.'
    }
  ];

  return commonSections;
};

// Tool-specific customizations
export const getCustomToolSections = (toolName: string) => {
  const sections = getToolSections(toolName);
  
  // Customize first hero section based on tool type
  switch (toolName.toLowerCase()) {
    case 'pdf compression':
      if (sections[0]) {
        sections[0].imagePlaceholder = { icon: FileArchive, text: 'Compression Preview' };
        sections[0].gradient = 'bg-gradient-to-br from-blue-500/10 to-blue-500/5';
      }
      break;
    case 'pdf merging':
      if (sections[0]) {
        sections[0].imagePlaceholder = { icon: Layers, text: 'Merge Preview' };
        sections[0].gradient = 'bg-gradient-to-br from-green-500/10 to-green-500/5';
      }
      break;
    case 'pdf splitting':
      if (sections[0]) {
        sections[0].imagePlaceholder = { icon: Scissors, text: 'Split Preview' };
        sections[0].gradient = 'bg-gradient-to-br from-red-500/10 to-red-500/5';
      }
      break;
    case 'pdf to word':
      if (sections[0]) {
        sections[0].imagePlaceholder = { icon: FileText, text: 'Conversion Preview' };
        sections[0].gradient = 'bg-gradient-to-br from-purple-500/10 to-purple-500/5';
      }
      break;
    case 'word to pdf':
      if (sections[0]) {
        sections[0].imagePlaceholder = { icon: FileImage, text: 'Conversion Preview' };
        sections[0].gradient = 'bg-gradient-to-br from-orange-500/10 to-orange-500/5';
      }
      break;
    default:
      // Keep default settings
      break;
  }
  
  return sections;
};