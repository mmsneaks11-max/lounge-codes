/**
 * GET /api/handoffs/feed — Public read-only feed of recent handoffs
 * 
 * Returns all handoffs from last 48 hours, any status
 * No auth required
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }
  return supabase;
}

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const { data, error } = await getSupabase()
      .from('handoffs')
      .select('*')
      .gte('created_at', fortyEightHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[handoffs feed] Query error:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch feed' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || [],
      timestamp: now.toISOString(),
    });

  } catch (err) {
    console.error('[handoffs feed] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
