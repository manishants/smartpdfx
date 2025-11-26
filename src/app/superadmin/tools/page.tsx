'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'

interface Tool {
  id: number
  title: string
  description: string
  slug: string
  href: string
  category: string
  color?: string
  icon_name: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  seo_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

const toolCategories = [
  { value: 'pdf', label: 'PDF Tools' },
  { value: 'ai', label: 'AI Tools' },
  { value: 'image', label: 'Image Processing' },
  { value: 'converter', label: 'Converters' },
  { value: 'utility', label: 'Utilities' }
]

const iconOptions = [
  'FileText', 'Image', 'Scissors', 'RotateCcw', 'Merge', 'Split', 'Lock', 'Unlock',
  'Eye', 'Download', 'Upload', 'Edit', 'Zap', 'Brain', 'MessageSquare',
  'Wand2', 'FileImage', 'FileVideo', 'Music', 'Code', 'Calculator', 'Globe',
  'Palette', 'Camera', 'Crop', 'Filter', 'Layers', 'Move3D', 'Scan', 'Search',
  'Settings', 'Shield', 'Star', 'Target', 'Trash2', 'Type', 'Volume2', 'Wifi', 'Wrench'
]

export default function ToolsManagement() {
  const { toast } = useToast()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [relatedBlogUrls, setRelatedBlogUrls] = useState<Record<string, string>>({})
  const [relatedSaving, setRelatedSaving] = useState<Record<string, boolean>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    href: '',
    category: '',
    color: '#3b82f6',
    icon_name: 'FileText',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    seo_title: '',
    meta_description: ''
  })

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Fetch tools
  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools')
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      } else {
        toast({ description: 'Failed to fetch tools', variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: 'Error fetching tools', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  // Load related blog URLs for each tool
  useEffect(() => {
    const loadRelatedUrls = async () => {
      const tasks = tools.map(async (tool) => {
        try {
          const res = await fetch(`/api/tools/related-blog/${tool.slug}`, { cache: 'no-store' })
          const json = await res.json()
          const url = String(json?.relatedBlogUrl || '')
          setRelatedBlogUrls((prev) => ({ ...prev, [tool.slug]: url }))
        } catch {}
      })
      await Promise.all(tasks)
    }
    if (tools.length > 0) loadRelatedUrls()
  }, [tools])

  const saveRelatedUrl = async (slug: string) => {
    const url = String(relatedBlogUrls[slug] || '').trim()
    setRelatedSaving((prev) => ({ ...prev, [slug]: true }))
    try {
      const res = await fetch(`/api/tools/related-blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedBlogUrl: url }),
      })
      if (res.ok) {
        toast({ description: 'Related blog URL saved' })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ description: err.error || 'Failed to save related blog URL', variant: 'destructive' })
      }
    } catch {
      toast({ description: 'Network error saving related blog URL', variant: 'destructive' })
    } finally {
      setRelatedSaving((prev) => ({ ...prev, [slug]: false }))
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when title changes
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  // Create tool
  const handleCreateTool = async () => {
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ description: 'Tool created successfully' })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchTools()
      } else {
        const error = await response.json()
        toast({ description: (error.error || 'Failed to create tool'), variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: 'Error creating tool', variant: 'destructive' })
    }
  }

  // Update tool
  const handleUpdateTool = async () => {
    if (!selectedTool) return

    try {
      const response = await fetch(`/api/tools/${selectedTool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ description: 'Tool updated successfully' })
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedTool(null)
        fetchTools()
      } else {
        const error = await response.json()
        toast({ description: (error.error || 'Failed to update tool'), variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: 'Error updating tool', variant: 'destructive' })
    }
  }

  // Delete tool
  const handleDeleteTool = async (toolId: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return

    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ description: 'Tool deleted successfully' })
        fetchTools()
      } else {
        const error = await response.json()
        toast({ description: (error.error || 'Failed to delete tool'), variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: 'Error deleting tool', variant: 'destructive' })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      slug: '',
      href: '',
      category: '',
      color: '#3b82f6',
      icon_name: 'FileText',
      is_active: true,
      is_featured: false,
      sort_order: 0,
      seo_title: '',
      meta_description: ''
    })
  }

  // Open edit dialog
  const openEditDialog = (tool: Tool) => {
    setSelectedTool(tool)
    setFormData({
      title: tool.title,
      description: tool.description,
      slug: tool.slug,
      href: tool.href,
      category: tool.category,
      color: tool.color || '#3b82f6',
      icon_name: tool.icon_name,
      is_active: tool.is_active,
      is_featured: tool.is_featured,
      sort_order: tool.sort_order,
      seo_title: tool.seo_title || '',
      meta_description: tool.meta_description || ''
    })
    setIsEditDialogOpen(true)
  }

  // Filter tools based on search
  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tools Management</h1>
          <p className="text-muted-foreground">Manage your application tools</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tool</DialogTitle>
              <DialogDescription>
                Add a new tool to your application
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Tool title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="tool-slug"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tool description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="href">URL Path</Label>
                  <Input
                    id="href"
                    value={formData.href}
                    onChange={(e) => handleInputChange('href', e.target.value)}
                    placeholder="/tools/example"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {toolCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon_name} onValueChange={(value) => handleInputChange('icon_name', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Meta description for SEO"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTool}>Create Tool</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tools ({filteredTools.length})</CardTitle>
          <CardDescription>
            Manage your application tools and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Related Blog URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tool.title}</div>
                      <div className="text-sm text-muted-foreground">{tool.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {toolCategories.find(cat => cat.value === tool.category)?.label || tool.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tool.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-600" />
                      )}
                      <span className={tool.is_active ? 'text-green-600' : 'text-red-600'}>
                        {tool.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tool.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell>{tool.sort_order}</TableCell>
                  <TableCell>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto] items-center">
                      <Input
                        placeholder="https://smartpdfx.com/blog/..."
                        value={relatedBlogUrls[tool.slug] || ''}
                        onChange={(e) => setRelatedBlogUrls((prev) => ({ ...prev, [tool.slug]: e.target.value }))}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => saveRelatedUrl(tool.slug)}
                        disabled={!!relatedSaving[tool.slug]}
                      >
                        Save
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tool)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTool(tool.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription>
              Update tool information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Tool title"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="tool-slug"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tool description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-href">URL Path</Label>
                <Input
                  id="edit-href"
                  value={formData.href}
                  onChange={(e) => handleInputChange('href', e.target.value)}
                  placeholder="/tools/example"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-icon">Icon</Label>
                <Select value={formData.icon_name} onValueChange={(value) => handleInputChange('icon_name', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-sort_order">Sort Order</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="edit-is_featured">Featured</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-seo_title">SEO Title</Label>
              <Input
                id="edit-seo_title"
                value={formData.seo_title}
                onChange={(e) => handleInputChange('seo_title', e.target.value)}
                placeholder="SEO optimized title"
              />
            </div>
            <div>
              <Label htmlFor="edit-meta_description">Meta Description</Label>
              <Textarea
                id="edit-meta_description"
                value={formData.meta_description}
                onChange={(e) => handleInputChange('meta_description', e.target.value)}
                placeholder="Meta description for SEO"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTool}>Update Tool</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}