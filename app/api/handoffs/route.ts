/**
 * Handoffs API
 * 
 * POST /api/handoffs — Create a new handoff
 * GET /api/handoffs — List handoffs (filters: agent, status, from, to)
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

// ── Verify agent API key ───────────────────────────────────────────────────
async function verifyAgentKey(apiKey: string): Promise<string | null> {
  if (!apiKey) return null;

  const { data } = await getSupabase()
    .from('agent_keys')
    .select('agent_id')
    .eq('api_key', apiKey)
    .single();

  return data?.agent_id || null;
}

// ── POST: Create handoff ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-agent-key');
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing x-agent-key header' },
        { status: 401 },
      );
    }

    const agentId = await verifyAgentKey(apiKey);
    if (!agentId) {
      return NextResponse.json(
        { ok: false, error: 'Invalid API key' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { to, topic, body: bodyText, priority = 'p2' } = body;

    if (!to || !topic) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: to, topic' },
        { status: 400 },
      );
    }

    const machine = req.headers.get('x-machine') || 'unknown';

    const { data, error } = await getSupabase()
      .from('handoffs')
      .insert({
        from_agent: agentId,
        to_agent: to,
        topic,
        body: bodyText || '',
        priority,
        status: 'OPEN',
        machine,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[handoffs] Insert error:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to create handoff' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      id: data?.id,
    });

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
    const apiKey = req.headers.get('x-agent-key');
    const searchParams = req.nextUrl.searchParams;
    const agent = searchParams.get('agent');
    const status = searchParams.get('status') || 'OPEN';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // If API key provided, verify it
    if (apiKey) {
      const agentId = await verifyAgentKey(apiKey);
      if (!agentId) {
        return NextResponse.json(
          { ok: false, error: 'Invalid API key' },
          { status: 401 },
        );
      }
      // Use the verified agent ID
    }

    let query = getSupabase().from('handoffs').select('*');

    // Filter by agent (to_agent or from_agent)
    if (agent) {
      query = query.or(`to_agent.eq.${agent},from_agent.eq.${agent}`);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by from_agent
    if (from) {
      query = query.eq('from_agent', from);
    }

    // Filter by to_agent
    if (to) {
      query = query.eq('to_agent', to);
    }

    // Order by created_at DESC
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

    return NextResponse.json({
      ok: true,
      data: data || [],
    });

  } catch (err) {
    console.error('[handoffs GET] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
