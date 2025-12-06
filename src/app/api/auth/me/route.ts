import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jar = cookies();
  const flag = jar.get('smartpdfx_superadmin')?.value;
  if (flag === 'true') {
    return NextResponse.json({ role: 'superadmin' }, { status: 200 });
  }
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
