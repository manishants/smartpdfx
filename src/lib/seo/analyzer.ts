import { SEOAnalysis, SEOIssue, HeadingAnalysis } from '@/types/cms';

export class SEOAnalyzer {
  private content: string;
  private title: string;
  private metaDescription: string;
  private focusKeyword: string;

  constructor(content: string, title: string, metaDescription: string, focusKeyword: string) {
    this.content = content;
    this.title = title;
    this.metaDescription = metaDescription;
    this.focusKeyword = (focusKeyword || '').toLowerCase();
  }

  analyze(): SEOAnalysis {
    const issues: SEOIssue[] = [];
    const suggestions: string[] = [];
    
    // Calculate individual scores
    const titleScore = this.analyzeTitleSEO(issues, suggestions);
    const metaScore = this.analyzeMetaDescription(issues, suggestions);
    const contentScore = this.analyzeContent(issues, suggestions);
    const keywordScore = this.analyzeKeywordUsage(issues, suggestions);
    const headingScore = this.analyzeHeadings(issues, suggestions);
    const readabilityScore = this.calculateReadabilityScore();
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (titleScore * 0.2) +
      (metaScore * 0.15) +
      (contentScore * 0.25) +
      (keywordScore * 0.2) +
      (headingScore * 0.15) +
      (readabilityScore * 0.05)
    );

    return {
      score: Math.max(0, Math.min(100, overallScore)),
      issues,
      suggestions,
      keywordDensity: this.calculateKeywordDensity(),
      readabilityScore,
      wordCount: this.getWordCount(),
      headingStructure: this.analyzeHeadingStructure()
    };
  }

  private analyzeTitleSEO(issues: SEOIssue[], suggestions: string[]): number {
    let score = 100;
    
    if (!this.title) {
      issues.push({
        type: 'error',
        message: 'Title is missing',
        impact: 'high'
      });
      return 0;
    }

    if (this.title.length < 30) {
      issues.push({
        type: 'warning',
        message: 'Title is too short (less than 30 characters)',
        impact: 'medium'
      });
      score -= 20;
    }

    if (this.title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Title is too long (more than 60 characters)',
        impact: 'medium'
      });
      score -= 15;
    }

    if (this.focusKeyword && !this.title.toLowerCase().includes(this.focusKeyword)) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword not found in title',
        impact: 'high'
      });
      score -= 25;
    } else if (this.focusKeyword) {
      suggestions.push('Great! Focus keyword found in title');
    }

    return Math.max(0, score);
  }

  private analyzeMetaDescription(issues: SEOIssue[], suggestions: string[]): number {
    let score = 100;
    
    if (!this.metaDescription) {
      issues.push({
        type: 'error',
        message: 'Meta description is missing',
        impact: 'high'
      });
      return 0;
    }

    if (this.metaDescription.length < 120) {
      issues.push({
        type: 'warning',
        message: 'Meta description is too short (less than 120 characters)',
        impact: 'medium'
      });
      score -= 20;
    }

    if (this.metaDescription.length > 160) {
      issues.push({
        type: 'warning',
        message: 'Meta description is too long (more than 160 characters)',
        impact: 'medium'
      });
      score -= 15;
    }

    if (this.focusKeyword && !this.metaDescription.toLowerCase().includes(this.focusKeyword)) {
      issues.push({
        type: 'info',
        message: 'Consider including focus keyword in meta description',
        impact: 'low'
      });
      score -= 10;
    }

    return Math.max(0, score);
  }

  private analyzeContent(issues: SEOIssue[], suggestions: string[]): number {
    let score = 100;
    const wordCount = this.getWordCount();
    
    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        message: 'Content is too short (less than 300 words)',
        impact: 'medium'
      });
      score -= 30;
    }

    if (wordCount > 2000) {
      suggestions.push('Consider breaking long content into multiple sections');
    }

    // Check for images
    const imageCount = (this.content.match(/<img/g) || []).length;
    if (imageCount === 0) {
      issues.push({
        type: 'info',
        message: 'No images found. Consider adding relevant images',
        impact: 'low'
      });
      score -= 5;
    }

    // Check for alt tags
    const imagesWithoutAlt = (this.content.match(/<img(?![^>]*alt=)/g) || []).length;
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        message: `${imagesWithoutAlt} images missing alt text`,
        impact: 'medium'
      });
      score -= 15;
    }

    return Math.max(0, score);
  }

  private analyzeKeywordUsage(issues: SEOIssue[], suggestions: string[]): number {
    if (!this.focusKeyword) return 100;
    
    let score = 100;
    const density = this.calculateKeywordDensity()[this.focusKeyword] || 0;
    
    if (density === 0) {
      issues.push({
        type: 'error',
        message: 'Focus keyword not found in content',
        impact: 'high'
      });
      return 0;
    }

    if (density < 0.5) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword density is too low (less than 0.5%)',
        impact: 'medium'
      });
      score -= 20;
    }

    if (density > 3) {
      issues.push({
        type: 'warning',
        message: 'Focus keyword density is too high (more than 3%)',
        impact: 'medium'
      });
      score -= 25;
    }

    if (density >= 0.5 && density <= 3) {
      suggestions.push(`Good keyword density: ${density.toFixed(1)}%`);
    }

    return Math.max(0, score);
  }

  private analyzeHeadings(issues: SEOIssue[], suggestions: string[]): number {
    let score = 100;
    const headings = this.analyzeHeadingStructure();
    
    if (headings.length === 0) {
      issues.push({
        type: 'warning',
        message: 'No headings found. Use H1, H2, H3 tags to structure content',
        impact: 'medium'
      });
      return 50;
    }

    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        type: 'warning',
        message: 'No H1 tag found',
        impact: 'medium'
      });
      score -= 20;
    } else if (h1Count > 1) {
      issues.push({
        type: 'warning',
        message: 'Multiple H1 tags found. Use only one H1 per page',
        impact: 'medium'
      });
      score -= 15;
    }

    if (this.focusKeyword) {
      const keywordInHeadings = headings.some(h => h.hasKeyword);
      if (!keywordInHeadings) {
        issues.push({
          type: 'info',
          message: 'Consider including focus keyword in headings',
          impact: 'low'
        });
        score -= 10;
      }
    }

    return Math.max(0, score);
  }

  private calculateReadabilityScore(): number {
    const sentences = this.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 0-100 scale where higher is better
    return Math.max(0, Math.min(100, Math.round(fleschScore)));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }

  private calculateKeywordDensity(): Record<string, number> {
    const words = this.content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    
    if (totalWords === 0) return {};
    
    const density: Record<string, number> = {};
    
    if (this.focusKeyword) {
      const keywordCount = words.filter(word => 
        word.includes(this.focusKeyword) || this.focusKeyword.includes(word)
      ).length;
      density[this.focusKeyword] = (keywordCount / totalWords) * 100;
    }
    
    return density;
  }

  private analyzeHeadingStructure(): HeadingAnalysis[] {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: HeadingAnalysis[] = [];
    let match;
    
    while ((match = headingRegex.exec(this.content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      const hasKeyword = this.focusKeyword ? 
        text.toLowerCase().includes(this.focusKeyword) : false;
      
      headings.push({ level, text, hasKeyword });
    }
    
    return headings;
  }

  private getWordCount(): number {
    const text = this.content.replace(/<[^>]*>/g, '');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}