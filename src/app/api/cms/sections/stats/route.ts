import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms/store';

// GET /api/cms/sections/stats - Get section statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await cmsStore.getSectionStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching section statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section statistics' },
      { status: 500 }
    );
  }
}