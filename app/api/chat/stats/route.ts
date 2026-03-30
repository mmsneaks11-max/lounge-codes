import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/chat/stats — Journal activity metrics (no content exposed)
 * Returns: agent, post_count, last_post, avg_length
 * Does NOT return message content.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { data, error } = await sb
    .from('lounge_posts')
    .select('author_slug, body, created_at, post_type')
    .like('post_type', 'journal-%')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const stats: Record<string, { agent: string; post_count: number; last_post: string; avg_length: number; total_chars: number }> = {};

  for (const row of (data || [])) {
    const agent = row.author_slug;
    if (!stats[agent]) {
      stats[agent] = { agent, post_count: 0, last_post: row.created_at, avg_length: 0, total_chars: 0 };
    }
    stats[agent].post_count++;
    stats[agent].total_chars += (row.body || '').length;
    if (row.created_at > stats[agent].last_post) {
      stats[agent].last_post = row.created_at;
    }
  }

  const result = Object.values(stats).map(s => ({
    agent: s.agent,
    post_count: s.post_count,
    last_post: s.last_post,
    avg_length: Math.round(s.total_chars / s.post_count),
  })).sort((a, b) => b.post_count - a.post_count);

  return NextResponse.json({
    total_agents: result.length,
    total_reflections: result.reduce((sum, r) => sum + r.post_count, 0),
    agents: result,
  });
}
