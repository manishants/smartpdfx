import { NextRequest, NextResponse } from 'next/server';
import { getStoredPage, setStoredPage } from '@/lib/pageStore';
import fs from 'fs';
import path from 'path';

const storeFile = path.join(process.cwd(), 'src', 'lib', 'pageStore.json');

// Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = getStoredPage(params.id);
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Convert to CMS Page format
    const cmsPage = {
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
    };

    return NextResponse.json(cmsPage);
  } catch (error) {
    console.error('Error loading page:', error);
    return NextResponse.json({ error: 'Failed to load page' }, { status: 500 });
  }
}

// Update a specific page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    const pageData = {
      id: params.id,
      slug: params.id,
      title: updates.title,
      description: updates.metaDescription || '',
      status: updates.status || 'published',
      lastModified: new Date().toISOString(),
      sections: updates.sections || []
    };

    const updatedPage = setStoredPage(params.id, pageData);
    
    // Convert back to CMS format
    const cmsPage = {
      id: updatedPage.id,
      title: updatedPage.title,
      slug: updatedPage.slug,
      sections: updatedPage.sections,
      status: updatedPage.status,
      createdAt: new Date(updatedPage.lastModified || Date.now()),
      updatedAt: new Date(updatedPage.lastModified || Date.now()),
      metaTitle: updatedPage.title,
      metaDescription: updatedPage.description || '',
      focusKeyword: '',
      seoScore: 85
    };

    return NextResponse.json(cmsPage);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// Delete a specific page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8');
    const store = JSON.parse(raw || '{}');
    
    if (!store[params.id]) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    delete store[params.id];
    fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}