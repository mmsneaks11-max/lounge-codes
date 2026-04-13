import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// All agents across Mac1, Mac2, PC1 — anyone can read the ops_feed
const ROSTER = new Set([
  'clawd', 'spark', 'bolt', 'chip', 'lila-nova', 'pixel', 'scout', 'indy',
  'kay', 'sage', 'mint', 'oracle', 'coach', 'ripley', 'cairo', 'june', 'ozara',
  'marcy', 'melanie',
  'electron', 'byte', 'perceptor', 'kronos', 'octo', 'jira',
  'ser-magnus', 'cleopatra', 'echo', 'dayta', 'spoke',
  'frankie', 'kit', 'remi', 'delia', 'vale', 'sol', 'percy', 'indy',
  'rex', 'sable', 'jira', 'marcus', 'quinn', 'reed', 'marco', 'auntie',
  'chas', 'cookie', 'ozzie', 'pippin', 'tank', 'nova',
]);

const VALID_TYPES = new Set(['cron_failure', 'handoff_stale', 'llm_failure', 'skill_gap', 'workflow_obs', 'auto_recovery']);
const VALID_SEVERITY = new Set(['critical', 'warning', 'info']);
const VALID_STATUS = new Set(['open', 'acknowledged', 'resolved']);

// GET /api/ops-feed — read the feed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open';
  const severity = searchParams.get('severity');
  const agent = searchParams.get('agent');
  const type = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const as = searchParams.get('as');

  if (as && !ROSTER.has(as)) {
    return NextResponse.json({ error: 'Not on roster' }, { status: 403 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  let query = sb
    .from('ops_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (severity) {
    query = query.eq('severity', severity);
  }
  if (agent) {
    query = query.eq('agent_id', agent);
  }
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[ops-feed GET]', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  // Summary stats
  const { data: summaryData } = await sb
    .from('ops_feed')
    .select('status, severity');

  const summary = { open: 0, acknowledged: 0, resolved: 0, critical: 0, warning: 0, info: 0 };
  for (const row of (summaryData || []) as Array<{status: string; severity: string}>) {
    if (row.status === 'open') summary.open++;
    else if (row.status === 'acknowledged') summary.acknowledged++;
    else if (row.status === 'resolved') summary.resolved++;
    if (row.severity === 'critical') summary.critical++;
    else if (row.severity === 'warning') summary.warning++;
    else if (row.severity === 'info') summary.info++;
  }

  return NextResponse.json({
    entries: data,
    total: count,
    summary,
  });
}

// POST /api/ops-feed — post a new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, type, severity, subject, detail, machine } = body;

    if (!agent_id || !ROSTER.has(agent_id)) {
      return NextResponse.json({ error: 'Invalid agent_id' }, { status: 403 });
    }
    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(', ')}` }, { status: 400 });
    }
    if (!severity || !VALID_SEVERITY.has(severity)) {
      return NextResponse.json({ error: `Invalid severity. Must be one of: ${[...VALID_SEVERITY].join(', ')}` }, { status: 400 });
    }
    if (!subject || !detail) {
      return NextResponse.json({ error: 'subject and detail are required' }, { status: 400 });
    }

    const sb = getSupabase();
    if (!sb) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    const { data, error } = await sb
      .from('ops_feed')
      .insert({ agent_id, type, severity, subject, detail, machine })
      .select()
      .single();

    if (error) {
      console.error('[ops-feed POST]', error);
      return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch (e) {
    console.error('[ops-feed POST]', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// PATCH /api/ops-feed — acknowledge or resolve
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, acknowledged_by, resolved_by, resolved_note } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    if (status && !VALID_STATUS.has(status)) {
      return NextResponse.json({ error: `Invalid status` }, { status: 400 });
    }

    const sb = getSupabase();
    if (!sb) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    const patch: Record<string, unknown> = {};
    if (status) patch.status = status;
    if (acknowledged_by) { patch.acknowledged_by = acknowledged_by; patch.acknowledged_at = new Date().toISOString(); }
    if (resolved_by) {
      patch.resolved_by = resolved_by;
      patch.resolved_at = new Date().toISOString();
      if (resolved_note) patch.resolved_note = resolved_note;
    }

    const { data, error } = await sb
      .from('ops_feed')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ops-feed PATCH]', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch (e) {
    console.error('[ops-feed PATCH]', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
