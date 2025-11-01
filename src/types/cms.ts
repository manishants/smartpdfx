// CMS Types for SuperAdmin Dashboard

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  seoScore: number;
  
  // Media
  featuredImage?: string;
  featuredImageAlt?: string;
  
  // Categories & Tags
  categories: string[];
  tags: string[];
  
  // Analytics
  views: number;
  readingTime: number;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: PageSection[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  seoScore: number;
  
  // Schema & Advanced SEO
  schemaMarkup?: string;
  openGraphImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export interface PageSection {
  id: string;
  type: 'hero' | 'content' | 'features' | 'testimonials' | 'faq' | 'cta' | 'gallery';
  title?: string;
  content?: string;
  settings: Record<string, any>;
  order: number;
}

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  suggestions: string[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  wordCount: number;
  headingStructure: HeadingAnalysis[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface HeadingAnalysis {
  level: number;
  text: string;
  hasKeyword: boolean;
}

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalPages: number;
  averageSeoScore: number;
  totalViews: number;
  recentActivity: ActivityLog[];
  // Section statistics
  totalToolSections?: number;
  totalHomePageSections?: number;
  activeSections?: number;
  toolsWithSections?: number;
}

// Tool Sections Management
export interface ToolSection {
  id: string;
  toolName: string;
  type: 'hero' | 'content';
  title: string;
  description: string;
  features?: { icon: string; text: string }[];
  imagePlaceholder?: { icon: string; text: string };
  imageUrl?: string;
  gradient?: string;
  iconColor?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolSectionTemplate {
  id: string;
  name: string;
  description: string;
  sections: Omit<ToolSection, 'id' | 'toolName' | 'createdAt' | 'updatedAt'>[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Home Page Sections Management
export interface HomePageSection {
  id: string;
  type: 'hero' | 'features' | 'stats' | 'testimonials' | 'tools' | 'cta' | 'about';
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textColor?: string;
  order: number;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Section Management Stats
export interface SectionStats {
  totalToolSections: number;
  totalHomePageSections: number;
  activeSections: number;
  inactiveSections: number;
  toolsWithSections: number;
  totalTools: number;
  lastUpdated: Date;
}

export interface ActivityLog {
  id: string;
  type: 'post_created' | 'post_published' | 'page_updated' | 'seo_improved';
  message: string;
  timestamp: Date;
  userId: string;
  entityId?: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

// Form Types
export interface BlogPostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  focusKeyword: string;
  featuredImage?: string;
  featuredImageAlt: string;
  categories: string[];
  tags: string[];
}

export interface PageForm {
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  sections: PageSection[];
  seo: SEOData;
}