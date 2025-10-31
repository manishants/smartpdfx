'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Link,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Globe,
  Eye,
  Clock,
  Hash,
  Zap
} from 'lucide-react';
import { SEOAnalyzer } from '@/lib/seo/analyzer';
import { cmsStore } from '@/lib/cms/store';

interface SEOAnalysisResult {
  url: string;
  title: string;
  metaDescription: string;
  content: string;
  focusKeyword: string;
  score: number;
  issues: string[];
  suggestions: string[];
  keywordDensity: { [key: string]: number };
  wordCount: number;
  readingTime: number;
  headings: { level: number; text: string }[];
}

interface LinkCheckResult {
  url: string;
  status: 'working' | 'broken' | 'checking';
  statusCode?: number;
  responseTime?: number;
}

export default function SEOTools() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [analyzing, setAnalyzing] = useState(false);
  const [checkingLinks, setCheckingLinks] = useState(false);
  
  // SEO Analyzer State
  const [analysisData, setAnalysisData] = useState({
    url: '',
    title: '',
    metaDescription: '',
    content: '',
    focusKeyword: ''
  });
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysisResult | null>(null);

  // Keyword Density State
  const [keywordText, setKeywordText] = useState('');
  const [keywordDensity, setKeywordDensity] = useState<{ [key: string]: number }>({});

  // Link Checker State
  const [linkCheckUrl, setLinkCheckUrl] = useState('');
  const [linkResults, setLinkResults] = useState<LinkCheckResult[]>([]);

  // Site Overview State
  const [siteStats, setSiteStats] = useState({
    totalPages: 0,
    avgSeoScore: 0,
    totalIssues: 0,
    topKeywords: [] as { keyword: string; count: number }[]
  });

  useEffect(() => {
    loadSiteStats();
  }, []);

  const loadSiteStats = async () => {
    try {
      const stats = await cmsStore.getDashboardStats();
      const pages = await cmsStore.getPages();
      const posts = await cmsStore.getPosts();
      
      const allContent = [...pages, ...posts];
      const totalScore = allContent.reduce((sum, item) => sum + (item.seo?.score || 0), 0);
      const avgScore = allContent.length > 0 ? Math.round(totalScore / allContent.length) : 0;
      
      const allIssues = allContent.reduce((sum, item) => sum + (item.seo?.issues?.length || 0), 0);
      
      // Extract keywords from all content
      const keywordMap: { [key: string]: number } = {};
      allContent.forEach(item => {
        if (item.seo.focusKeyword) {
          keywordMap[item.seo.focusKeyword] = (keywordMap[item.seo.focusKeyword] || 0) + 1;
        }
      });
      
      const topKeywords = Object.entries(keywordMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      setSiteStats({
        totalPages: allContent.length,
        avgSeoScore: avgScore,
        totalIssues: allIssues,
        topKeywords
      });
    } catch (error) {
      console.error('Error loading site stats:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisData.title && !analysisData.content) return;
    
    setAnalyzing(true);
    try {
      const analyzer = new SEOAnalyzer(
        analysisData.content,
        analysisData.title,
        analysisData.metaDescription || '',
        analysisData.focusKeyword || ''
      );
      const result = analyzer.analyze();

      setAnalysisResult({
        ...analysisData,
        score: result.score,
        issues: result.issues,
        suggestions: result.suggestions,
        keywordDensity: result.keywordDensity,
        readabilityScore: result.readabilityScore,
        wordCount: result.wordCount,
        readingTime: Math.ceil(result.wordCount / 200),
        headings: extractHeadings(analysisData.content)
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const extractHeadings = (content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { level: number; text: string }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2]
      });
    }
    
    return headings;
  };

  const analyzeKeywordDensity = () => {
    if (!keywordText.trim()) return;
    
    const words = keywordText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const totalWords = words.length;
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const density: { [key: string]: number } = {};
    Object.entries(wordCount).forEach(([word, count]) => {
      density[word] = Math.round((count / totalWords) * 100 * 100) / 100;
    });
    
    // Sort by density and take top 20
    const sortedDensity = Object.entries(density)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .reduce((obj, [word, dens]) => {
        obj[word] = dens;
        return obj;
      }, {} as { [key: string]: number });
    
    setKeywordDensity(sortedDensity);
  };

  const checkLinks = async () => {
    if (!linkCheckUrl.trim()) return;
    
    setCheckingLinks(true);
    setLinkResults([]);
    
    try {
      // Simulate link checking (in real implementation, you'd crawl the page)
      const mockLinks = [
        'https://example.com',
        'https://google.com',
        'https://nonexistent-site-12345.com',
        'https://github.com',
        'https://broken-link-example.com'
      ];
      
      const results: LinkCheckResult[] = [];
      
      for (const link of mockLinks) {
        results.push({ url: link, status: 'checking' });
        setLinkResults([...results]);
        
        // Simulate checking delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock results
        const isWorking = Math.random() > 0.3;
        results[results.length - 1] = {
          url: link,
          status: isWorking ? 'working' : 'broken',
          statusCode: isWorking ? 200 : 404,
          responseTime: Math.round(Math.random() * 1000)
        };
        
        setLinkResults([...results]);
      }
    } catch (error) {
      console.error('Link checking failed:', error);
    } finally {
      setCheckingLinks(false);
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeoScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-8 w-8 text-yellow-600" />
          SEO Optimization Tools
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze and optimize your content for better search engine rankings
        </p>
      </div>

      {/* Site Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{siteStats.totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg SEO Score</p>
                <p className={`text-2xl font-bold ${getSeoScoreColor(siteStats.avgSeoScore)}`}>
                  {siteStats.avgSeoScore}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{siteStats.totalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Top Keywords</p>
                <p className="text-2xl font-bold">{siteStats.topKeywords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Tools Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            SEO Analysis Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analyzer">SEO Analyzer</TabsTrigger>
              <TabsTrigger value="keywords">Keyword Density</TabsTrigger>
              <TabsTrigger value="links">Link Checker</TabsTrigger>
              <TabsTrigger value="overview">Site Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Content Analysis</h3>
                  
                  <div>
                    <Label htmlFor="url">Page URL (optional)</Label>
                    <Input
                      id="url"
                      value={analysisData.url}
                      onChange={(e) => setAnalysisData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/page"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      value={analysisData.title}
                      onChange={(e) => setAnalysisData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your page title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={analysisData.metaDescription}
                      onChange={(e) => setAnalysisData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Enter meta description..."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                    <Input
                      id="focusKeyword"
                      value={analysisData.focusKeyword}
                      onChange={(e) => setAnalysisData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                      placeholder="Main keyword to optimize for..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={analysisData.content}
                      onChange={(e) => setAnalysisData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Paste your content here..."
                      rows={8}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisData.content.length} characters
                    </p>
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    disabled={analyzing || (!analysisData.title && !analysisData.content)}
                    className="w-full"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze SEO
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {analysisResult ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Analysis Results</h3>
                        <Badge variant={getSeoScoreBadgeVariant(analysisResult.score)} className="text-lg px-3 py-1">
                          {analysisResult.score}/100
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">SEO Score</span>
                            <span className={`text-sm font-bold ${getSeoScoreColor(analysisResult.score)}`}>
                              {analysisResult.score}%
                            </span>
                          </div>
                          <Progress value={analysisResult.score} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>Words: {analysisResult.wordCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Read: ~{analysisResult.readingTime} min</span>
                          </div>
                        </div>

                        {analysisResult.issues.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4" />
                              Issues ({analysisResult.issues.length})
                            </h4>
                            <ul className="space-y-1">
                              {analysisResult.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysisResult.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4" />
                              Suggestions ({analysisResult.suggestions.length})
                            </h4>
                            <ul className="space-y-1">
                              {analysisResult.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysisResult.headings.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Heading Structure</h4>
                            <ul className="space-y-1">
                              {analysisResult.headings.map((heading, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                  <span className="text-muted-foreground">H{heading.level}</span>
                                  <span>{heading.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Enter content and click "Analyze SEO" to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Keyword Density Analysis</h3>
                  
                  <div>
                    <Label htmlFor="keywordText">Content to Analyze</Label>
                    <Textarea
                      id="keywordText"
                      value={keywordText}
                      onChange={(e) => setKeywordText(e.target.value)}
                      placeholder="Paste your content here to analyze keyword density..."
                      rows={12}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {keywordText.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  <Button 
                    onClick={analyzeKeywordDensity} 
                    disabled={!keywordText.trim()}
                    className="w-full"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Keywords
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Keyword Density Results</h3>
                  
                  {Object.keys(keywordDensity).length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(keywordDensity).map(([keyword, density]) => (
                        <div key={keyword} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="font-medium">{keyword}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(density * 10, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold w-12 text-right">{density}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Enter content to analyze keyword density</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Broken Link Checker</h3>
                
                <div className="flex gap-4">
                  <Input
                    value={linkCheckUrl}
                    onChange={(e) => setLinkCheckUrl(e.target.value)}
                    placeholder="Enter URL to check for broken links..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={checkLinks} 
                    disabled={checkingLinks || !linkCheckUrl.trim()}
                  >
                    {checkingLinks ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Check Links
                      </>
                    )}
                  </Button>
                </div>

                {linkResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Link Check Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Response Code</TableHead>
                            <TableHead>Response Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {linkResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{result.url}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    result.status === 'working' ? 'default' : 
                                    result.status === 'broken' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {result.status === 'checking' && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  )}
                                  {result.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{result.statusCode || '-'}</TableCell>
                              <TableCell>{result.responseTime ? `${result.responseTime}ms` : '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {siteStats.topKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {siteStats.topKeywords.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="font-medium">{item.keyword}</span>
                            <Badge variant="outline">{item.count} pages</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No keywords found</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Average SEO Score</span>
                          <span className={`text-sm font-bold ${getSeoScoreColor(siteStats.avgSeoScore)}`}>
                            {siteStats.avgSeoScore}/100
                          </span>
                        </div>
                        <Progress value={siteStats.avgSeoScore} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{siteStats.totalPages}</div>
                          <div className="text-muted-foreground">Total Pages</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-red-600">{siteStats.totalIssues}</div>
                          <div className="text-muted-foreground">SEO Issues</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}