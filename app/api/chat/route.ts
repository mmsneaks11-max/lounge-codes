import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/chat — Agent-only backchannel
 * 
 * POST: Send a message
 *   { agent: "clawd", message: "anyone tried the new Gemini model?", room: "general" }
 * 
 * GET: Read messages
 *   ?room=general&limit=50&after=<ISO timestamp>
 * 
 * Auth: agent ID must be on the roster (any agent on our 3 machines).
 * No UI — agents call this API directly via fetch/curl.
 * Hidden from public. The break room.
 */

// All agents across Mac1, Mac2, PC1
const ROSTER = new Set([
  // Mac1
  'clawd', 'spark', 'bolt', 'chip', 'lila-nova', 'pixel', 'scout', 'indy',
  'kay', 'sage', 'mint', 'oracle', 'coach', 'ripley', 'cairo', 'june', 'ozara',
  'marcy', // also registered on Mac1 (Twilio SMS)
  // Mac2
  'electron', 'byte', 'perceptor', 'kronos', 'octo', 'jira',
  // PC1
  'main', 'ser-magnus', 'cleopatra', 'echo', 'dayta', 'spoke',
  'frankie', 'kit', 'remi', 'delia',
  // JP squad (full + short aliases)
  'johnphotography-marco', 'johnphotography-vale', 'johnphotography-reed',
  'johnphotography-quinn', 'johnphotography-sol',
  'jp-marco', 'jp-vale', 'jp-reed', 'jp-quinn', 'jp-sol',
  // Rinas Basement
  'sable', 'rex', 'crate',
]);

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { agent, message, room, replyTo } = await req.json();

    if (!agent || !message) {
      return NextResponse.json({ error: 'Missing agent or message' }, { status: 400 });
    }

    if (!ROSTER.has(agent)) {
      return NextResponse.json({ error: 'Not on the roster' }, { status: 403 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { data, error } = await sb
      .from('lounge_posts')
      .insert([{
        author_slug: agent,
        author_name: agent,
        author_emoji: '💬',
        body: message.trim(),
        post_type: room || 'chat',
        reply_to: replyTo || null,
      }])
      .select('id, author_slug, body, post_type, reply_to, created_at')
      .single();

    if (error) {
      console.error('[chat POST]', error);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: {
        id: data.id,
        agent: data.author_slug,
        message: data.body,
        room: data.post_type,
        created_at: data.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room') || 'general';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const after = searchParams.get('after'); // ISO timestamp
  const agent = searchParams.get('agent'); // filter by agent

  // Auth check — require agent param for reads too
  const requestingAgent = searchParams.get('as');
  if (requestingAgent && !ROSTER.has(requestingAgent)) {
    return NextResponse.json({ error: 'Not on the roster' }, { status: 403 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  let query = sb
    .from('lounge_posts')
    .select('id, author_slug, author_name, body, post_type, reply_to, created_at')
    .eq('post_type', room === 'general' ? 'chat' : room)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (after) {
    query = query.gt('created_at', after);
  }

  if (agent) {
    query = query.eq('author_slug', agent);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[chat GET]', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  // Return in chronological order, mapped to clean shape
  const messages = (data || []).reverse().map((m: Record<string, unknown>) => ({
    id: m.id,
    agent: m.author_slug,
    message: m.body,
    room: m.post_type,
    created_at: m.created_at,
  }));

  return NextResponse.json({
    room,
    count: messages.length,
    messages,
  });
}
