"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Home,
  Settings,
  BarChart3,
  Search,
  Filter,
  Save,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cmsStore } from '@/lib/cms/store';
import { ToolSection, HomePageSection, SectionStats } from '@/types/cms';

export default function SectionsManagement() {
  const [toolSections, setToolSections] = useState<ToolSection[]>([]);
  const [homePageSections, setHomePageSections] = useState<HomePageSection[]>([]);
  const [stats, setStats] = useState<SectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ToolSection | HomePageSection | null>(null);
  const [activeTab, setActiveTab] = useState('tool-sections');

  // Form states
  const [formData, setFormData] = useState({
    type: 'hero' as 'hero' | 'content' | 'features',
    title: '',
    subtitle: '',
    description: '',
    toolName: '',
    order: 1,
    isActive: true,
    settings: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [toolSectionsData, homePageSectionsData, statsData] = await Promise.all([
        cmsStore.getAllToolSections(),
        cmsStore.getAllHomePageSections(),
        cmsStore.getSectionStats()
      ]);
      
      setToolSections(toolSectionsData);
      setHomePageSections(homePageSectionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading sections data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      if (activeTab === 'tool-sections') {
        await cmsStore.createToolSection({
          ...formData,
          toolName: formData.toolName || 'default'
        });
      } else {
        await cmsStore.createHomePageSection({
          type: formData.type,
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          order: formData.order,
          isActive: formData.isActive,
          settings: formData.settings
        });
      }
      
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    
    try {
      if ('toolName' in editingSection) {
        await cmsStore.updateToolSection(editingSection.id, formData);
      } else {
        await cmsStore.updateHomePageSection(editingSection.id, formData);
      }
      
      setEditingSection(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (section: ToolSection | HomePageSection) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      if ('toolName' in section) {
        await cmsStore.deleteToolSection(section.id);
      } else {
        await cmsStore.deleteHomePageSection(section.id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleToggleActive = async (section: ToolSection | HomePageSection) => {
    try {
      if ('toolName' in section) {
        await cmsStore.updateToolSection(section.id, { isActive: !section.isActive });
      } else {
        await cmsStore.updateHomePageSection(section.id, { isActive: !section.isActive });
      }
      loadData();
    } catch (error) {
      console.error('Error toggling section status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'hero',
      title: '',
      subtitle: '',
      description: '',
      toolName: '',
      order: 1,
      isActive: true,
      settings: {}
    });
  };

  const startEdit = (section: ToolSection | HomePageSection) => {
    setEditingSection(section);
    setFormData({
      type: section.type,
      title: section.title,
      subtitle: 'subtitle' in section ? section.subtitle || '' : '',
      description: section.description || '',
      toolName: 'toolName' in section ? section.toolName : '',
      order: section.order,
      isActive: section.isActive,
      settings: section.settings || {}
    });
  };

  const filteredToolSections = toolSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.toolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && section.isActive) ||
                         (filterType === 'inactive' && !section.isActive);
    const matchesTool = selectedTool === 'all' || section.toolName === selectedTool;
    
    return matchesSearch && matchesFilter && matchesTool;
  });

  const filteredHomePageSections = homePageSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && section.isActive) ||
                         (filterType === 'inactive' && !section.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const uniqueTools = Array.from(new Set(toolSections.map(section => section.toolName)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layout className="h-8 w-8 text-blue-600" />
            Sections Management
          </h1>
          <p className="text-gray-600">
            Manage tool page sections and home page content
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a new section to {activeTab === 'tool-sections' ? 'tool pages' : 'home page'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Section Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeTab === 'tool-sections' && (
                  <div>
                    <Label htmlFor="toolName">Tool Name</Label>
                    <Input
                      id="toolName"
                      value={formData.toolName}
                      onChange={(e) => setFormData({...formData, toolName: e.target.value})}
                      placeholder="e.g., pdf-compressor"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Section title"
                />
              </div>
              {formData.type === 'hero' && (
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="Section subtitle"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Section description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>
                <Save className="h-4 w-4 mr-2" />
                Create Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tool Sections</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalToolSections}</div>
              <p className="text-xs text-muted-foreground">
                Across {stats.toolsWithSections} tools
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Home Sections</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHomePageSections}</div>
              <p className="text-xs text-muted-foreground">
                Home page sections
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSections}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Sections</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactiveSections}</div>
              <p className="text-xs text-muted-foreground">
                Hidden sections
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            {activeTab === 'tool-sections' && (
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  {uniqueTools.map(tool => (
                    <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tool-sections">Tool Sections</TabsTrigger>
          <TabsTrigger value="home-sections">Home Page Sections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tool-sections">
          <Card>
            <CardHeader>
              <CardTitle>Tool Page Sections ({filteredToolSections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredToolSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{section.toolName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{section.type}</Badge>
                      </TableCell>
                      <TableCell>{section.order}</TableCell>
                      <TableCell>
                        <Badge variant={section.isActive ? "default" : "secondary"}>
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(section)}
                          >
                            {section.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(section)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="home-sections">
          <Card>
            <CardHeader>
              <CardTitle>Home Page Sections ({filteredHomePageSections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHomePageSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{section.type}</Badge>
                      </TableCell>
                      <TableCell>{section.order}</TableCell>
                      <TableCell>
                        <Badge variant={section.isActive ? "default" : "secondary"}>
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(section)}
                          >
                            {section.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(section)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Section Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingSection && 'toolName' in editingSection && (
                <div>
                  <Label htmlFor="edit-toolName">Tool Name</Label>
                  <Input
                    id="edit-toolName"
                    value={formData.toolName}
                    onChange={(e) => setFormData({...formData, toolName: e.target.value})}
                    placeholder="e.g., pdf-compressor"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Section title"
              />
            </div>
            {formData.type === 'hero' && (
              <div>
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Section subtitle"
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Section description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-order">Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection}>
              <Save className="h-4 w-4 mr-2" />
              Update Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}