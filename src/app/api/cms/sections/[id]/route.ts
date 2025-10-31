import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// GET /api/cms/sections/[id] - Get a specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'tool' or 'home'

    let section = null;

    if (type === 'tool') {
      const toolSections = await cmsStore.getToolSections();
      section = toolSections.find(s => s.id === id);
    } else if (type === 'home') {
      const homeSections = await cmsStore.getHomePageSections();
      section = homeSections.find(s => s.id === id);
    } else {
      // Search in both types
      const toolSections = await cmsStore.getToolSections();
      const homeSections = await cmsStore.getHomePageSections();
      section = [...toolSections, ...homeSections].find(s => s.id === id);
    }

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/sections/[id] - Update a specific section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { type, ...updateData } = body;

    if (!type || !['tool', 'home'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section type. Must be "tool" or "home"' },
        { status: 400 }
      );
    }

    let updatedSection;

    if (type === 'tool') {
      updatedSection = await cmsStore.updateToolSection(id, updateData);
    } else {
      updatedSection = await cmsStore.updateHomePageSection(id, updateData);
    }

    if (!updatedSection) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/sections/[id] - Delete a specific section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'tool' or 'home'

    if (!type || !['tool', 'home'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Section type is required. Must be "tool" or "home"' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'tool') {
      success = await cmsStore.deleteToolSection(id);
    } else {
      success = await cmsStore.deleteHomePageSection(id);
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}