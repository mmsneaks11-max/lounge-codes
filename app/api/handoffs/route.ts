/**
 * Handoffs API
 * 
 * POST /api/handoffs — Create a new handoff
 * GET /api/handoffs — List handoffs (filters: agent, status, from, to)
 * 
 * Auth: IP gate (Tailscale/LAN) or owner token query param
 * Agents identify themselves via x-agent-id header (no per-agent keys needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    );
  }
  return supabase;
}

// ── POST: Create handoff ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, topic, title, body: bodyText, summary, priority = 'p2', from: bodyFrom } = body;
    const resolvedTopic = topic || title || 'Untitled';
    const resolvedBody = bodyText || summary || '';

    // Agent identifies itself via header or body
    const agentId = req.headers.get('x-agent-id') || bodyFrom || 'unknown';
    const machine = req.headers.get('x-machine') || body.machine || 'unknown';

    if (!to || !topic) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: to, topic' },
        { status: 400 },
      );
    }

    const { data, error } = await getSupabase()
      .from('handoffs')
      .insert({
        from_agent: agentId,
        to_agent: to,
        title: resolvedTopic,
        summary: resolvedBody,
        priority,
        status: 'OPEN',
        file_path: `api/${agentId}-${to}/${Date.now()}.md`,
        file_mtime: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[handoffs] Insert error:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to create handoff: ' + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });

  } catch (err) {
    console.error('[handoffs POST] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// ── GET: List handoffs ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const agent = searchParams.get('agent');
    const status = searchParams.get('status') || 'OPEN';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = getSupabase().from('handoffs').select('*');

    if (agent) {
      query = query.or(`to_agent.eq.${agent},from_agent.eq.${agent}`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.eq('from_agent', from);
    }
    if (to) {
      query = query.eq('to_agent', to);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[handoffs GET] Query error:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch handoffs' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err) {
    console.error('[handoffs GET] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
