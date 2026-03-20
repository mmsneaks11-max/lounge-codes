/**
 * PATCH /api/handoffs/[id] — Update handoff status
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
    const { status, resolution, blocked_on } = body;

    if (!status) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: status' },
        { status: 400 },
      );
    }

    // Validate status
    if (!['OPEN', 'BLOCKED', 'RESOLVED'].includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid status. Must be OPEN, BLOCKED, or RESOLVED' },
        { status: 400 },
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'RESOLVED') {
      updateData.resolution = resolution || '';
      updateData.resolved_at = new Date().toISOString();
    }

    if (status === 'BLOCKED') {
      updateData.blocked_on = blocked_on || '';
    }

    const { data, error } = await supabase
      .from('handoffs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[handoffs PATCH] Update error:', error.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to update handoff' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });

  } catch (err) {
    console.error('[handoffs PATCH] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
