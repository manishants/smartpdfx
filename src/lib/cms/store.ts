import { BlogPost, Page, DashboardStats, ActivityLog, Category, Tag, MediaFile, HomePageSection, SectionStats } from '@/types/cms';
import { SEOAnalyzer, generateSlug, calculateReadingTime } from '@/lib/seo/analyzer';

class CMSStore {
  private readonly STORAGE_KEYS = {
    POSTS: 'cms_blog_posts',
    PAGES: 'cms_pages',
    CATEGORIES: 'cms_categories',
    TAGS: 'cms_tags',
    MEDIA: 'cms_media',
    ACTIVITY: 'cms_activity',
    HOME_PAGE_SECTIONS: 'cms_home_page_sections'
  };

  // Blog Posts
  async getAllPosts(): Promise<BlogPost[]> {
    if (typeof window === 'undefined') return [];
    const posts = localStorage.getItem(this.STORAGE_KEYS.POSTS);
    return posts ? JSON.parse(posts) : this.getDefaultPosts();
  }

  async getPost(id: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.id === id) || null;
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    const posts = await this.getAllPosts();
    
    const newPost: BlogPost = {
      id: this.generateId(),
      title: postData.title || 'Untitled Post',
      slug: postData.slug || generateSlug(postData.title || 'untitled-post'),
      content: postData.content || '',
      excerpt: postData.excerpt || '',
      author: postData.author || 'Admin',
      status: postData.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: postData.status === 'published' ? new Date() : undefined,
      scheduledAt: postData.scheduledAt,
      metaTitle: postData.metaTitle || postData.title || '',
      metaDescription: postData.metaDescription || '',
      canonicalUrl: postData.canonicalUrl || '',
      focusKeyword: postData.focusKeyword || '',
      seoScore: 0,
      featuredImage: postData.featuredImage,
      featuredImageAlt: postData.featuredImageAlt || '',
      categories: postData.categories || [],
      tags: postData.tags || [],
      views: 0,
      readingTime: calculateReadingTime(postData.content || '')
    };

    // Calculate SEO score
    newPost.seoScore = this.calculateSEOScore(newPost);
    
    posts.push(newPost);
    this.savePosts(posts);
    
    // Log activity
    await this.logActivity({
      type: 'post_created',
      message: `Created new post: ${newPost.title}`,
      entityId: newPost.id
    });

    return newPost;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) return null;
    
    const updatedPost = {
      ...posts[index],
      ...updates,
      updatedAt: new Date(),
      readingTime: calculateReadingTime(updates.content || posts[index].content)
    };

    // Update publish date if status changed to published
    if (updates.status === 'published' && posts[index].status !== 'published') {
      updatedPost.publishedAt = new Date();
    }

    // Recalculate SEO score
    updatedPost.seoScore = this.calculateSEOScore(updatedPost);
    
    posts[index] = updatedPost;
    this.savePosts(posts);
    
    // Log activity
    await this.logActivity({
      type: updates.status === 'published' ? 'post_published' : 'post_created',
      message: `Updated post: ${updatedPost.title}`,
      entityId: updatedPost.id
    });

    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    const posts = await this.getAllPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) return false;
    
    this.savePosts(filteredPosts);
    return true;
  }

  // Pages
  async getAllPages(): Promise<Page[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const response = await fetch('/api/pages');
      if (!response.ok) throw new Error('Failed to fetch pages');
      
      const data = await response.json();
      const pages = data.pages || data; // Handle both { pages: [] } and [] formats
      
      // Convert StoredPage format to Page format
      return pages.map((page: any) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        sections: page.sections || [],
        status: page.status || 'published',
        createdAt: new Date(page.lastModified || Date.now()),
        updatedAt: new Date(page.lastModified || Date.now()),
        metaTitle: page.title,
        metaDescription: page.description || '',
        focusKeyword: '',
        seoScore: 85
      }));
    } catch (error) {
      console.error('Error loading pages from API:', error);
      // Fallback to localStorage if API fails
      const pages = localStorage.getItem(this.STORAGE_KEYS.PAGES);
      return pages ? JSON.parse(pages) : this.getDefaultPages();
    }
  }

  async getPages(): Promise<Page[]> {
    return this.getAllPages();
  }

  async getPage(id: string): Promise<Page | null> {
    try {
      const response = await fetch(`/api/pages/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch page');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading page:', error);
      // Fallback to loading all pages and finding the one we need
      const pages = await this.getAllPages();
      return pages.find(page => page.id === id) || null;
    }
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | null> {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update page');

      const updatedPage = await response.json();
      
      // Log activity
      await this.logActivity({
        type: 'page_updated',
        message: `Updated page: ${updatedPage.title}`,
        entityId: updatedPage.id
      });

      return updatedPage;
    } catch (error) {
      console.error('Error updating page:', error);
      return null;
    }
  }

  async createPage(pageData: Omit<Page, 'id'> & { id?: string }): Promise<Page | null> {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) throw new Error('Failed to create page');

      const createdPage = await response.json();
      
      // Log activity
      await this.logActivity({
        type: 'page_updated',
        message: `Created new page: ${createdPage.title}`,
        entityId: createdPage.id
      });

      return createdPage;
    } catch (error) {
      console.error('Error creating page:', error);
      return null;
    }
  }

  // Categories & Tags
  async getAllCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') return [];
    const categories = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : this.getDefaultCategories();
  }

  async getAllTags(): Promise<Tag[]> {
    if (typeof window === 'undefined') return [];
    const tags = localStorage.getItem(this.STORAGE_KEYS.TAGS);
    return tags ? JSON.parse(tags) : [];
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const posts = await this.getAllPosts();
    const pages = await this.getAllPages();
    const activity = await this.getRecentActivity();
    const sectionStats = await this.getSectionStats();
    
    const publishedPosts = posts.filter(p => p.status === 'published');
    const draftPosts = posts.filter(p => p.status === 'draft');
    const scheduledPosts = posts.filter(p => p.status === 'scheduled');
    
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const avgSeoScore = posts.length > 0 
      ? Math.round(posts.reduce((sum, post) => sum + post.seoScore, 0) / posts.length)
      : 0;

    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      scheduledPosts: scheduledPosts.length,
      totalPages: pages.length,
      averageSeoScore: avgSeoScore,
      totalViews,
      recentActivity: activity.slice(0, 10),
      // Section statistics
      totalHomePageSections: sectionStats.totalHomePageSections,
      activeSections: sectionStats.activeSections,
      // Tool section stats removed
    };
  }

  // Activity Logging
  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp' | 'userId'>): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const activities = await this.getRecentActivity();
    const newActivity: ActivityLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: 'superadmin',
      ...activity
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 100 activities
    const trimmedActivities = activities.slice(0, 100);
    localStorage.setItem(this.STORAGE_KEYS.ACTIVITY, JSON.stringify(trimmedActivities));
  }

  private async getRecentActivity(): Promise<ActivityLog[]> {
    if (typeof window === 'undefined') return [];
    const activity = localStorage.getItem(this.STORAGE_KEYS.ACTIVITY);
    return activity ? JSON.parse(activity) : [];
  }

  // SEO Calculations
  private calculateSEOScore(post: BlogPost): number {
    const analyzer = new SEOAnalyzer(
      post.content,
      post.metaTitle || post.title,
      post.metaDescription || '',
      post.focusKeyword || ''
    );
    return analyzer.analyze().score;
  }

  private calculatePageSEOScore(page: Page): number {
    const content = page.sections.map(s => s.content || '').join(' ');
    const analyzer = new SEOAnalyzer(
      content,
      page.metaTitle || page.title,
      page.metaDescription || '',
      page.focusKeyword || ''
    );
    return analyzer.analyze().score;
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private savePosts(posts: BlogPost[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  }

  private savePages(pages: Page[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PAGES, JSON.stringify(pages));
    }
  }

  // Default Data
  private getDefaultPosts(): BlogPost[] {
    return [
      {
        id: 'post-1',
        title: 'How to Optimize PDF Files for Better Performance',
        slug: 'optimize-pdf-files-performance',
        content: '<h1>How to Optimize PDF Files for Better Performance</h1><p>PDF optimization is crucial for web performance and user experience. In this comprehensive guide, we\'ll explore various techniques to reduce PDF file sizes while maintaining quality.</p><h2>Why PDF Optimization Matters</h2><p>Large PDF files can significantly impact your website\'s loading speed and user experience. Search engines also consider page speed as a ranking factor, making PDF optimization essential for SEO.</p><h2>Best Practices for PDF Optimization</h2><p>Here are the most effective methods to optimize your PDF files:</p><ul><li>Compress images within PDFs</li><li>Remove unnecessary metadata</li><li>Use efficient fonts</li><li>Optimize for web viewing</li></ul>',
        excerpt: 'Learn essential techniques to optimize PDF files for better web performance and user experience.',
        author: 'Admin',
        status: 'published',
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        metaTitle: 'PDF Optimization Guide: Improve Performance & SEO',
        metaDescription: 'Complete guide to PDF optimization techniques that improve web performance, reduce file sizes, and enhance user experience.',
        canonicalUrl: '/blog/optimize-pdf-files-performance',
        focusKeyword: 'pdf optimization',
        seoScore: 85,
        featuredImage: '/images/pdf-optimization.jpg',
        featuredImageAlt: 'PDF optimization techniques illustration',
        categories: ['tutorials', 'optimization'],
        tags: ['pdf', 'performance', 'seo'],
        views: 1250,
        readingTime: 5
      }
    ];
  }

  private getDefaultPages(): Page[] {
    return [
      {
        id: 'page-home',
        title: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            title: 'Smart PDF Tools for Everyone',
            content: 'Transform, compress, and manage your PDF files with our powerful online tools.',
            settings: {
              backgroundImage: '/images/hero-bg.jpg',
              buttonText: 'Get Started',
              buttonUrl: '/tools'
            },
            order: 1
          }
        ],
        status: 'published',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        metaTitle: 'SmartPDFx - Professional PDF Tools Online',
        metaDescription: 'Professional PDF tools for compression, conversion, and management. Fast, secure, and easy to use.',
        focusKeyword: 'pdf tools',
        seoScore: 90
      }
    ];
  }

  private getDefaultCategories(): Category[] {
    return [
      { id: 'cat-1', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides and tutorials', postCount: 0 },
      { id: 'cat-2', name: 'Tips & Tricks', slug: 'tips-tricks', description: 'Quick tips and tricks', postCount: 0 },
      { id: 'cat-3', name: 'News', slug: 'news', description: 'Latest news and updates', postCount: 0 }
    ];
  }

  // Tool sections management has been removed.

  // Tool section templates have been removed.

  // Home Page Sections Management
  async getAllHomePageSections(): Promise<HomePageSection[]> {
    if (typeof window === 'undefined') return [];
    const sections = localStorage.getItem(this.STORAGE_KEYS.HOME_PAGE_SECTIONS);
    return sections ? JSON.parse(sections) : this.getDefaultHomePageSections();
  }

  async createHomePageSection(sectionData: Omit<HomePageSection, 'id' | 'createdAt' | 'updatedAt'>): Promise<HomePageSection> {
    const sections = await this.getAllHomePageSections();
    
    const newSection: HomePageSection = {
      ...sectionData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sections.push(newSection);
    localStorage.setItem(this.STORAGE_KEYS.HOME_PAGE_SECTIONS, JSON.stringify(sections));
    
    await this.logActivity('create', 'home_page_section', newSection.id, `Created home page section "${newSection.title}"`);
    return newSection;
  }

  async updateHomePageSection(id: string, updates: Partial<HomePageSection>): Promise<HomePageSection | null> {
    const sections = await this.getAllHomePageSections();
    const index = sections.findIndex(section => section.id === id);
    
    if (index === -1) return null;

    sections[index] = { ...sections[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(this.STORAGE_KEYS.HOME_PAGE_SECTIONS, JSON.stringify(sections));
    
    await this.logActivity('update', 'home_page_section', id, `Updated home page section "${sections[index].title}"`);
    return sections[index];
  }

  async deleteHomePageSection(id: string): Promise<boolean> {
    const sections = await this.getAllHomePageSections();
    const index = sections.findIndex(section => section.id === id);
    
    if (index === -1) return false;

    const deletedSection = sections[index];
    sections.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEYS.HOME_PAGE_SECTIONS, JSON.stringify(sections));
    
    await this.logActivity('delete', 'home_page_section', id, `Deleted home page section "${deletedSection.title}"`);
    return true;
  }

  // Section Statistics
  async getSectionStats(): Promise<SectionStats> {
    const homePageSections = await this.getAllHomePageSections();
    
    const activeSections = homePageSections.filter(section => section.isActive).length;
    const inactiveSections = homePageSections.filter(section => !section.isActive).length;
    
    return {
      totalHomePageSections: homePageSections.length,
      activeSections,
      inactiveSections,
      lastUpdated: new Date()
    };
  }

  // Default tool section templates removed.

  private getDefaultHomePageSections(): HomePageSection[] {
    return [
      {
        id: 'home-hero',
        type: 'hero',
        title: 'Smart PDF Tools for Everyone',
        subtitle: 'Professional PDF Processing Made Simple',
        description: 'Transform, compress, and manage your PDF files with our powerful online tools.',
        buttonText: 'Get Started',
        buttonLink: '/tools',
        order: 1,
        isActive: true,
        settings: {
          backgroundImage: '/hero_section_smartpdfx.webp',
          showStats: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'home-features',
        type: 'features',
        title: 'Powerful Features',
        description: 'Everything you need for professional PDF processing',
        order: 2,
        isActive: true,
        settings: {
          columns: 3,
          showIcons: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

export const cmsStore = new CMSStore();