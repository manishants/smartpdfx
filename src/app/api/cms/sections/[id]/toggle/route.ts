import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// POST /api/cms/sections/[id]/toggle - Toggle section active status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const homeSections = await cmsStore.getAllHomePageSections();
    const section = homeSections.find(s => s.id === id);

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    const updatedSection = await cmsStore.updateHomePageSection(id, {
      isActive: !section.isActive
    });

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