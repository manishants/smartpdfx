import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// GET /api/cms/sections/templates - Get all section templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const templates = await cmsStore.getToolSectionTemplates();
    
    let filteredTemplates = templates;
    if (category) {
      filteredTemplates = templates.filter(template => 
        template.category === category
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      count: filteredTemplates.length
    });
  } catch (error) {
    console.error('Error fetching section templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section templates' },
      { status: 500 }
    );
  }
}

// POST /api/cms/sections/templates - Create a new section template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    if (!templateData.name || !templateData.type) {
      return NextResponse.json(
        { success: false, error: 'Template name and type are required' },
        { status: 400 }
      );
    }

    const newTemplate = await cmsStore.createToolSectionTemplate(templateData);

    return NextResponse.json({
      success: true,
      data: newTemplate
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating section template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section template' },
      { status: 500 }
    );
  }
}