import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// GET /api/cms/sections - Get all sections with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'tool' or 'home'
    const toolName = searchParams.get('toolName');
    const active = searchParams.get('active');

    let sections = [];

    if (type === 'tool') {
      sections = await cmsStore.getToolSections(toolName || undefined);
    } else if (type === 'home') {
      sections = await cmsStore.getHomePageSections();
    } else {
      // Get all sections
      const toolSections = await cmsStore.getToolSections();
      const homeSections = await cmsStore.getHomePageSections();
      sections = [...toolSections, ...homeSections];
    }

    // Filter by active status if specified
    if (active !== null) {
      const isActive = active === 'true';
      sections = sections.filter(section => section.isActive === isActive);
    }

    return NextResponse.json({
      success: true,
      data: sections,
      count: sections.length
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/cms/sections - Create a new section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...sectionData } = body;

    if (!type || !['tool', 'home'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section type. Must be "tool" or "home"' },
        { status: 400 }
      );
    }

    let newSection;

    if (type === 'tool') {
      if (!sectionData.toolName) {
        return NextResponse.json(
          { success: false, error: 'toolName is required for tool sections' },
          { status: 400 }
        );
      }
      newSection = await cmsStore.createToolSection(sectionData);
    } else {
      newSection = await cmsStore.createHomePageSection(sectionData);
    }

    return NextResponse.json({
      success: true,
      data: newSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section' },
      { status: 500 }
    );
  }
}