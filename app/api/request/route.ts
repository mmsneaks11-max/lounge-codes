/**
 * POST /api/request — Submit a task request to an agent
 * 
 * All inbound messages pass through the prompt guard before
 * reaching any agent. Managers get strict mode filtering.
 * 
 * Body: { agent_id, agent_slug, requester, request_text, urgency }
 * Returns: { ok, request_id } or { ok: false, error, flags? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAgentRequest, isProtectedName, LOUNGE_REQUEST_MODEL } from '@/lib/prompt-guard';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

const VALID_URGENCIES = new Set(['low', 'normal', 'high', 'critical']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, agent_slug, requester, request_text, urgency } = body;

    // Basic validation
    if (!agent_id || !agent_slug || !requester || !request_text) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields.' },
        { status: 400 },
      );
    }

    if (!VALID_URGENCIES.has(urgency)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid urgency level.' },
        { status: 400 },
      );
    }

    // Get client identifier for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    // ── IMPERSONATION CHECK (name field) ────────────────────────────────
    if (isProtectedName(requester)) {
      console.warn(`[prompt-guard] IMPERSONATION attempt: "${requester}" from ${clientIP}`);
      return NextResponse.json(
        { ok: false, error: 'This name is reserved. Please use your own name.' },
        { status: 422 },
      );
    }

    // ── PROMPT GUARD ─────────────────────────────────────────────────────
    const guard = guardAgentRequest(request_text, agent_slug, clientIP);

    if (!guard.allowed) {
      // Log blocked attempt (don't expose internal flags to client)
      console.warn(`[prompt-guard] BLOCKED request to ${agent_slug} from ${clientIP}`, {
        severity: guard.severity,
        flags: guard.flags,
        rateLimited: guard.rateLimited,
      });

      return NextResponse.json(
        {
          ok: false,
          error: guard.rateLimited
            ? 'Too many requests. Please try again later.'
            : 'Your message could not be processed. Please rephrase and try again.',
        },
        { status: guard.rateLimited ? 429 : 422 },
      );
    }

    // Also guard the requester name
    const nameGuard = guardAgentRequest(requester, agent_slug, `${clientIP}-name`);
    if (!nameGuard.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Invalid name provided.' },
        { status: 422 },
      );
    }

    // Log if flagged but allowed
    if (guard.flags.length > 0) {
      console.info(`[prompt-guard] FLAGGED request to ${agent_slug} from ${clientIP}`, {
        severity: guard.severity,
        flags: guard.flags,
      });
    }

    // ── INSERT (with sanitized text) ─────────────────────────────────────
    const { data, error: insertErr } = await supabase
      .from('agent_requests')
      .insert({
        agent_id,
        requester: nameGuard.sanitized,
        request_text: guard.sanitized,
        urgency,
        status: 'pending',
        metadata: {
          guard_severity: guard.severity,
          guard_flags: guard.flags,
          client_ip: clientIP,
          submitted_at: new Date().toISOString(),
          model: LOUNGE_REQUEST_MODEL, // enforced: free model only
          source: 'lounge.codes',
        },
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('[request] Insert error:', insertErr.message);
      return NextResponse.json(
        { ok: false, error: 'Failed to submit request. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      request_id: data?.id,
      remaining: guard.remaining,
    });

  } catch (err) {
    console.error('[request] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
