import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// POST /api/cms/sections/[id]/toggle - Toggle section active status
export async function POST(
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

    let updatedSection;

    if (type === 'tool') {
      const toolSections = await cmsStore.getToolSections();
      const section = toolSections.find(s => s.id === id);
      
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      updatedSection = await cmsStore.updateToolSection(id, {
        isActive: !section.isActive
      });
    } else {
      const homeSections = await cmsStore.getHomePageSections();
      const section = homeSections.find(s => s.id === id);
      
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      updatedSection = await cmsStore.updateHomePageSection(id, {
        isActive: !section.isActive
      });
    }

    if (!updatedSection) {
      return NextResponse.json(
        { success: false, error: 'Failed to toggle section status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSection,
      message: `Section ${updatedSection.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling section status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle section status' },
      { status: 500 }
    );
  }
}