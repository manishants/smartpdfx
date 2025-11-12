import { BlogPost, Page, DashboardStats, ActivityLog, Category, Tag, MediaFile, HomePageSection, SectionStats } from '@/types/cms';
import { SEOAnalyzer, generateSlug, calculateReadingTime } from '@/lib/seo/analyzer';

class CMSStore {
  private readonly STORAGE_KEYS = {
    POSTS: 'cms_blog_posts',
    PAGES: 'cms_pages',
    CATEGORIES: 'cms_categories',
    CATEGORIES_INIT: 'cms_categories_initialized',
    TAGS: 'cms_tags',
    MEDIA: 'cms_media',
    ACTIVITY: 'cms_activity',
    HOME_PAGE_SECTIONS: 'cms_home_page_sections'
  };

  // Blog Posts
  async getAllPosts(): Promise<BlogPost[]> {
    if (typeof window === 'undefined') return [];
    // Try to load from Supabase via API first
    try {
      const resp = await fetch('/api/blog/posts');
      if (resp.ok) {
        const json = await resp.json();
        const apiPosts = Array.isArray(json.posts) ? json.posts : json;
        if (Array.isArray(apiPosts) && apiPosts.length > 0) {
          return apiPosts.map((p: any) => ({
            id: String(p.id),
            title: p.title,
            slug: p.slug,
            content: p.content || '',
            excerpt: p.excerpt || '',
            author: p.author || 'Admin',
            status: p.status || (p.published ? 'published' : 'draft'),
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            metaTitle: p.metaTitle || p.title,
            metaDescription: p.metaDescription || '',
            canonicalUrl: p.canonicalUrl || '',
            focusKeyword: p.focusKeyword || '',
            seoScore: this.calculateSEOScore({
              id: String(p.id),
              title: p.title,
              slug: p.slug,
              content: p.content || '',
              author: p.author || 'Admin',
              status: p.status || 'draft',
              createdAt: new Date(p.createdAt || Date.now()),
              updatedAt: new Date(p.updatedAt || Date.now()),
              metaTitle: p.metaTitle || p.title,
              metaDescription: p.metaDescription || '',
              seoScore: 0,
              categories: [],
              tags: [],
              views: 0,
              readingTime: 0,
              featuredImage: p.featuredImage,
              featuredImageAlt: '',
              layoutSettings: p.layoutSettings || {
                showBreadcrumbs: true,
                leftSidebarEnabled: true,
                rightSidebarEnabled: true,
                leftSticky: false,
                tocFontSize: 'text-sm',
                tocH3Indent: 12,
                tocHoverColor: 'hover:text-primary'
              }
            } as BlogPost),
            featuredImage: p.featuredImage,
            featuredImageAlt: p.featuredImageAlt || '',
            categories: p.category ? [p.category] : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            views: Number(p.views || 0),
            readingTime: calculateReadingTime(p.content || ''),
            manualToc: Array.isArray(p.manualToc) ? p.manualToc : [],
            layoutSettings: p.layoutSettings || {
              showBreadcrumbs: true,
              leftSidebarEnabled: true,
              rightSidebarEnabled: true,
              leftSticky: false,
              tocFontSize: 'text-sm',
              tocH3Indent: 12,
              tocHoverColor: 'hover:text-primary'
            }
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load posts from API, falling back to localStorage:', e);
    }
    // Fallback to localStorage
    const posts = localStorage.getItem(this.STORAGE_KEYS.POSTS);
    return posts ? JSON.parse(posts) : this.getDefaultPosts();
  }

  async getPost(id: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.id === id) || null;
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    try {
      // Try to save to Supabase first
      const response = await fetch('/api/cms/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          // Convert to Supabase-compatible format
          title: postData.title || 'Untitled Post',
          slug: postData.slug || generateSlug(postData.title || 'untitled-post'),
          content: postData.content || '',
          author: postData.author || 'Admin',
          status: postData.status || 'draft',
          metaTitle: postData.metaTitle || postData.title || '',
          metaDescription: postData.metaDescription || '',
          canonicalUrl: postData.canonicalUrl || '',
          focusKeyword: postData.focusKeyword || '',
          excerpt: postData.excerpt || '',
          featuredImage: postData.featuredImage,
          featuredImageAlt: postData.featuredImageAlt || '',
          categories: postData.categories || [],
          tags: postData.tags || [],
          manualToc: postData.manualToc || [],
          layoutSettings: postData.layoutSettings || {
            showBreadcrumbs: true,
            leftSidebarEnabled: true,
            rightSidebarEnabled: true,
            leftSticky: false,
            tocFontSize: 'text-sm',
            tocH3Indent: 12,
            tocHoverColor: 'hover:text-primary'
          }
        }),
      });

      if (response.ok) {
        const supabasePost = await response.json();
        
        // Log activity
        await this.logActivity({
          type: 'post_created',
          message: `Created new post: ${supabasePost.title}`,
          entityId: String(supabasePost.id)
        });

        // Normalize Supabase payload back to CMS shape
        const cmsPost: BlogPost = {
          id: String(supabasePost.id),
          title: supabasePost.title,
          slug: supabasePost.slug,
          content: supabasePost.content || '',
          excerpt: postData.excerpt || '',
          author: supabasePost.author || 'Admin',
          status: supabasePost.published ? 'published' : 'draft',
          publishedAt: supabasePost.published ? new Date(supabasePost.date) : undefined,
          createdAt: new Date(supabasePost.date || Date.now()),
          updatedAt: new Date(supabasePost.date || Date.now()),
          metaTitle: supabasePost.seoTitle ?? supabasePost.seotitle ?? (postData.metaTitle || postData.title || ''),
          metaDescription: supabasePost.metaDescription ?? supabasePost.metadescription ?? (postData.metaDescription || ''),
          canonicalUrl: postData.canonicalUrl || '',
          focusKeyword: postData.focusKeyword || '',
          seoScore: 0,
          featuredImage: supabasePost.imageUrl ?? supabasePost.imageurl ?? postData.featuredImage,
          featuredImageAlt: postData.featuredImageAlt || '',
          categories: (postData.categories && postData.categories.length > 0)
            ? postData.categories
            : (supabasePost.category ? [supabasePost.category] : []),
          tags: postData.tags || [],
          views: 0,
          readingTime: calculateReadingTime(supabasePost.content || ''),
          manualToc: Array.isArray(postData.manualToc) ? postData.manualToc : [],
          layoutSettings: postData.layoutSettings || {
            showBreadcrumbs: true,
            leftSidebarEnabled: true,
            rightSidebarEnabled: true,
            leftSticky: false,
            tocFontSize: 'text-sm',
            tocH3Indent: 12,
            tocHoverColor: 'hover:text-primary'
          }
        };
        cmsPost.seoScore = this.calculateSEOScore(cmsPost);
        return cmsPost;
      }
    } catch (error) {
      console.error('Failed to save to Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage if Supabase fails
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
      readingTime: calculateReadingTime(postData.content || ''),
      manualToc: Array.isArray(postData.manualToc) ? postData.manualToc : [],
      layoutSettings: postData.layoutSettings || {
        showBreadcrumbs: true,
        leftSidebarEnabled: true,
        rightSidebarEnabled: true,
        leftSticky: false,
        tocFontSize: 'text-sm',
        tocH3Indent: 12,
        tocHoverColor: 'hover:text-primary'
      }
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
    try {
      // Try to update in Supabase first
      const response = await fetch(`/api/cms/blog/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          // Convert to Supabase-compatible format
          title: updates.title || '',
          content: updates.content || '',
          author: updates.author || '',
          slug: updates.slug,
          status: updates.status || 'draft',
          metaTitle: updates.metaTitle || updates.title || '',
          metaDescription: updates.metaDescription || '',
          canonicalUrl: updates.canonicalUrl || '',
          focusKeyword: updates.focusKeyword || '',
          excerpt: updates.excerpt || '',
          featuredImage: updates.featuredImage,
          featuredImageAlt: updates.featuredImageAlt || '',
          categories: updates.categories || [],
          tags: updates.tags || [],
          manualToc: updates.manualToc || [],
          layoutSettings: updates.layoutSettings || {
            showBreadcrumbs: true,
            leftSidebarEnabled: true,
            rightSidebarEnabled: true,
            leftSticky: false,
            tocFontSize: 'text-sm',
            tocH3Indent: 12,
            tocHoverColor: 'hover:text-primary'
          }
        }),
      });

      if (response.ok) {
        const supabasePost = await response.json();
        
        // Log activity
        await this.logActivity({
          type: updates.status === 'published' ? 'post_published' : 'page_updated',
          message: `Updated post: ${supabasePost.title}`,
          entityId: String(supabasePost.id)
        });

        // Normalize Supabase payload to CMS shape
        const cmsPost: BlogPost = {
          id: String(supabasePost.id),
          title: supabasePost.title,
          slug: supabasePost.slug,
          content: supabasePost.content || '',
          excerpt: updates.excerpt || '',
          author: supabasePost.author || updates.author || 'Admin',
          status: supabasePost.published ? 'published' : (updates.status || 'draft'),
          publishedAt: supabasePost.published ? new Date(supabasePost.date) : undefined,
          createdAt: new Date(supabasePost.date || Date.now()),
          updatedAt: new Date(supabasePost.date || Date.now()),
          metaTitle: supabasePost.seoTitle ?? supabasePost.seotitle ?? updates.metaTitle,
          metaDescription: supabasePost.metaDescription ?? supabasePost.metadescription ?? updates.metaDescription,
          canonicalUrl: updates.canonicalUrl || '',
          focusKeyword: updates.focusKeyword || '',
          seoScore: 0,
          featuredImage: supabasePost.imageUrl ?? supabasePost.imageurl ?? updates.featuredImage,
          featuredImageAlt: updates.featuredImageAlt || '',
          categories: (updates.categories && updates.categories.length > 0)
            ? updates.categories
            : (supabasePost.category ? [supabasePost.category] : []),
          tags: updates.tags || [],
          views: 0,
          readingTime: calculateReadingTime(supabasePost.content || updates.content || ''),
          manualToc: Array.isArray(updates.manualToc) ? updates.manualToc : [],
          layoutSettings: updates.layoutSettings || {
            showBreadcrumbs: true,
            leftSidebarEnabled: true,
            rightSidebarEnabled: true,
            leftSticky: false,
            tocFontSize: 'text-sm',
            tocH3Indent: 12,
            tocHoverColor: 'hover:text-primary'
          }
        };
        cmsPost.seoScore = this.calculateSEOScore(cmsPost);
        return cmsPost;
      }
    } catch (error) {
      console.error('Failed to update in Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage if Supabase fails
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
      type: updates.status === 'published' ? 'post_published' : 'page_updated',
      message: `Updated post: ${updatedPost.title}`,
      entityId: updatedPost.id
    });

    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      // Try to delete from Supabase first
      const response = await fetch(`/api/cms/blog/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Log activity
        await this.logActivity({
          type: 'post_deleted',
          message: `Deleted post with ID: ${id}`,
          entityId: id
        });

        return true;
      }
    } catch (error) {
      console.error('Failed to delete from Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage if Supabase fails
    const posts = await this.getAllPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) return false;
    
    this.savePosts(filteredPosts);
    
    // Log activity
    await this.logActivity({
      type: 'post_deleted',
      message: `Deleted post with ID: ${id}`,
      entityId: id
    });
    
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
    // Prefer server-backed categories stored in the project files
    try {
      const resp = await fetch('/api/cms/categories');
      if (resp.ok) {
        const json = await resp.json();
        const cats = Array.isArray(json.categories) ? json.categories : (Array.isArray(json.data) ? json.data : []);
        if (Array.isArray(cats)) return cats;
      }
    } catch {}

    // Fallback to localStorage
    const raw = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    // Only seed defaults once on first initialization; never re-seed after user modifications
    const initialized = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES_INIT);
    if (!initialized) {
      const defaults = this.getDefaultCategories();
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaults));
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES_INIT, 'true');
      return defaults;
    }
    return [];
  }

  async getAllTags(): Promise<Tag[]> {
    if (typeof window === 'undefined') return [];
    const tags = localStorage.getItem(this.STORAGE_KEYS.TAGS);
    return tags ? JSON.parse(tags) : [];
  }

  private saveCategories(categories: Category[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      // Mark as initialized to avoid re-seeding defaults after user changes
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES_INIT, 'true');
    }
  }

  private saveTags(tags: Tag[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.TAGS, JSON.stringify(tags));
    }
  }

  async createCategory(data: Omit<Category, 'id' | 'postCount' | 'slug'> & { slug?: string }): Promise<Category> {
    const name = (data.name || '').trim();
    const slug = (data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    // Try server-backed persistence first
    try {
      const resp = await fetch('/api/cms/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: data.description || '', slug })
      });
      if (resp.ok) {
        const created = await resp.json();
        await this.logActivity({ type: 'page_updated', message: `Created category: ${created.name}`, entityId: created.id });
        return created as Category;
      }
    } catch {}
    // Fallback to localStorage persistence
    const categories = await this.getAllCategories();
    const newCategory: Category = {
      id: this.generateId(),
      name,
      slug,
      description: data.description || '',
      postCount: 0
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    await this.logActivity({ type: 'page_updated', message: `Created category: ${newCategory.name}`, entityId: newCategory.id });
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    // Try server-backed update first
    try {
      const resp = await fetch(`/api/cms/categories/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (resp.ok) {
        const updated = await resp.json();
        await this.logActivity({ type: 'page_updated', message: `Updated category: ${updated.name}`, entityId: updated.id });
        return updated as Category;
      }
    } catch {}
    // Fallback to localStorage update
    const categories = await this.getAllCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated: Category = { ...categories[idx], ...updates };
    if (updates.name && !updates.slug) {
      updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    categories[idx] = updated;
    this.saveCategories(categories);
    await this.logActivity({ type: 'page_updated', message: `Updated category: ${updated.name}`, entityId: updated.id });
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Try server-backed delete first
    try {
      const resp = await fetch(`/api/cms/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (resp.status === 204) {
        await this.logActivity({ type: 'page_updated', message: `Deleted category: ${id}`, entityId: id });
        return true;
      }
    } catch {}
    // Fallback to localStorage delete
    const categories = await this.getAllCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const [deleted] = categories.splice(idx, 1);
    this.saveCategories(categories);
    await this.logActivity({ type: 'page_updated', message: `Deleted category: ${deleted.name}`, entityId: deleted.id });
    return true;
  }

  async createTag(data: Omit<Tag, 'id' | 'postCount' | 'slug'> & { slug?: string }): Promise<Tag> {
    const tags = await this.getAllTags();
    const name = (data.name || '').trim();
    const slug = (data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const newTag: Tag = {
      id: this.generateId(),
      name,
      slug,
      postCount: 0
    };
    tags.push(newTag);
    this.saveTags(tags);
    await this.logActivity({ type: 'page_updated', message: `Created tag: ${newTag.name}`, entityId: newTag.id });
    return newTag;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag | null> {
    const tags = await this.getAllTags();
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const updated: Tag = { ...tags[idx], ...updates };
    if (updates.name && !updates.slug) {
      updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    tags[idx] = updated;
    this.saveTags(tags);
    await this.logActivity({ type: 'page_updated', message: `Updated tag: ${updated.name}`, entityId: updated.id });
    return updated;
  }

  async deleteTag(id: string): Promise<boolean> {
    const tags = await this.getAllTags();
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const [deleted] = tags.splice(idx, 1);
    this.saveTags(tags);
    await this.logActivity({ type: 'page_updated', message: `Deleted tag: ${deleted.name}`, entityId: deleted.id });
    return true;
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
  async logActivity(activityOrAction: Omit<ActivityLog, 'id' | 'timestamp' | 'userId'> | 'create' | 'update' | 'delete', entityType?: string, entityId?: string, message?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const activities = await this.getRecentActivity();

    let payload: Omit<ActivityLog, 'id' | 'timestamp' | 'userId'>;
    if (typeof activityOrAction === 'string') {
      // Backward-compatible signature: (action, entityType, entityId, message)
      const action = activityOrAction;
      payload = {
        type: `${entityType || 'entity'}_${action}`,
        message: message || '',
        entityId: entityId || ''
      } as any;
    } else {
      payload = activityOrAction;
    }

    const newActivity: ActivityLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: 'superadmin',
      ...payload
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