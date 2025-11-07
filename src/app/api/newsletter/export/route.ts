import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

function toCsv(rows: any[]) {
  const headers = ['id','email','category','unsubscribed','created_at','updated_at'];
  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    let query = supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Export subscribers error:', error);
      return new Response(JSON.stringify({ error: 'Failed to export subscribers' }), { status: 500 });
    }

    const csv = toCsv(data || []);
    const filename = `newsletter_subscribers${category && category !== 'all' ? '_' + category : ''}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), { status: 500 });
  }
}