"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, EyeOff, Home, Sparkles, Zap, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { HomePageSection } from '@/types/cms';
import { useToast } from '@/hooks/use-toast';

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomePageSection | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    sectionType: 'hero' as 'hero' | 'features' | 'stats' | 'cta',
    content: '{}',
    isActive: true,
    order: 1
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/cms/sections?type=home');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch home sections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let content;
      try {
        content = JSON.parse(formData.content);
      } catch {
        content = {};
      }

      const sectionData = {
        ...formData,
        content,
        type: 'home' as const
      };

      const url = editingSection 
        ? `/api/cms/sections/${editingSection.id}`
        : '/api/cms/sections';
      
      const method = editingSection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Section ${editingSection ? 'updated' : 'created'} successfully`
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSections();
      } else {
        throw new Error('Failed to save section');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (section: HomePageSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      subtitle: section.subtitle || '',
      description: section.description || '',
      sectionType: section.sectionType,
      content: JSON.stringify(section.content, null, 2),
      isActive: section.isActive,
      order: section.order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/cms/sections/${id}?type=home`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Section deleted successfully"
        });
        fetchSections();
      } else {
        throw new Error('Failed to delete section');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/sections/${id}/toggle?type=home`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Section status updated"
        });
        fetchSections();
      } else {
        throw new Error('Failed to toggle section');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section status",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      sectionType: 'hero',
      content: '{}',
      isActive: true,
      order: 1
    });
    setEditingSection(null);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return Home;
      case 'features': return Sparkles;
      case 'stats': return Zap;
      case 'cta': return Star;
      default: return Home;
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return JSON.stringify({
          stats: [
            { label: 'Tools Available', value: '50+' },
            { label: 'Files Processed', value: '1M+' },
            { label: 'Free to Use', value: '100%' }
          ],
          buttons: [
            { text: 'Start Creating', href: '#tools', variant: 'primary' },
            { text: 'Support Us', action: 'donate', variant: 'outline' }
          ],
          image: '/hero_section_smartpdfx.webp'
        }, null, 2);
      case 'features':
        return JSON.stringify({
          features: [
            {
              icon: 'Zap',
              title: 'Lightning Fast',
              description: 'Process files in seconds',
              color: 'from-yellow-500 to-orange-500'
            }
          ]
        }, null, 2);
      case 'stats':
        return JSON.stringify({
          stats: [
            { label: 'Users', value: '10K+' },
            { label: 'Files', value: '1M+' }
          ]
        }, null, 2);
      case 'cta':
        return JSON.stringify({
          buttons: [
            { text: 'Get Started', href: '#tools', variant: 'primary' }
          ]
        }, null, 2);
      default:
        return '{}';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Home Page Sections</h1>
          <p className="text-muted-foreground">Manage sections displayed on the home page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </DialogTitle>
              <DialogDescription>
                Configure the home page section details and content
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sectionType">Section Type</Label>
                  <Select
                    value={formData.sectionType}
                    onValueChange={(value: 'hero' | 'features' | 'stats' | 'cta') => {
                      setFormData({ 
                        ...formData, 
                        sectionType: value,
                        content: getDefaultContent(value)
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="stats">Stats</SelectItem>
                      <SelectItem value="cta">Call to Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content (JSON)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Enter JSON content for the section"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSection ? 'Update' : 'Create'} Section
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No home sections found. Create your first section!</p>
            </CardContent>
          </Card>
        ) : (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const Icon = getSectionIcon(section.sectionType);
              return (
                <Card key={section.id} className={`${!section.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {section.title}
                            <Badge variant={section.isActive ? "default" : "secondary"}>
                              {section.sectionType}
                            </Badge>
                          </CardTitle>
                          {section.subtitle && (
                            <CardDescription>{section.subtitle}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Order: {section.order}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(section.id)}
                        >
                          {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(section)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {section.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Content JSON
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(section.content, null, 2)}
                        </pre>
                      </details>
                    </CardContent>
                  )}
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}