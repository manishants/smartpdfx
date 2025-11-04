import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// GET /api/cms/sections - Get all sections with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // only 'home' is supported
    const active = searchParams.get('active');

    let sections = [];
    // Only home page sections are supported
    sections = await cmsStore.getAllHomePageSections();

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
    const sectionData = body;
    const newSection = await cmsStore.createHomePageSection(sectionData);

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