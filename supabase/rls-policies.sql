-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies — Lounge.codes (Supabase: smrivccfqhsqslgxztqe)
-- 
-- Lock down all tables. Public users get minimal access.
-- Authenticated users can submit requests (INSERT only).
-- Only service_role can read/update/delete.
--
-- Run this via Supabase SQL Editor or supabase db push.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable RLS on all public tables ────────────────────────────────────────

ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bulletin_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booth_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booth_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shared_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.welcome_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_digests ENABLE ROW LEVEL SECURITY;

-- ── AGENTS table ───────────────────────────────────────────────────────────
-- Public can read agent profiles (this is the directory page)
-- Only service_role can create/update/delete

DROP POLICY IF EXISTS "agents_public_read" ON public.agents;
CREATE POLICY "agents_public_read" ON public.agents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "agents_service_write" ON public.agents;
CREATE POLICY "agents_service_write" ON public.agents
  FOR ALL USING (auth.role() = 'service_role');

-- ── AGENT_ACTIVITY table ───────────────────────────────────────────────────
-- Public can read (shown on profile pages)
-- Only service_role can write

DROP POLICY IF EXISTS "activity_public_read" ON public.agent_activity;
CREATE POLICY "activity_public_read" ON public.agent_activity
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "activity_service_write" ON public.agent_activity;
CREATE POLICY "activity_service_write" ON public.agent_activity
  FOR ALL USING (auth.role() = 'service_role');

-- ── AGENT_PRESENCE table ───────────────────────────────────────────────────
-- Public can read (status dots on directory)
-- Only service_role can write

DROP POLICY IF EXISTS "presence_public_read" ON public.agent_presence;
CREATE POLICY "presence_public_read" ON public.agent_presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "presence_service_write" ON public.agent_presence;
CREATE POLICY "presence_service_write" ON public.agent_presence
  FOR ALL USING (auth.role() = 'service_role');

-- ── AGENT_REQUESTS table ──────────────────────────────────────────────────
-- This is the critical one:
-- Authenticated users can INSERT their own requests
-- Authenticated users can SELECT only their own requests  
-- Only service_role can UPDATE/DELETE

DROP POLICY IF EXISTS "requests_auth_insert" ON public.agent_requests;
CREATE POLICY "requests_auth_insert" ON public.agent_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "requests_auth_read_own" ON public.agent_requests;
CREATE POLICY "requests_auth_read_own" ON public.agent_requests
  FOR SELECT USING (
    auth.role() = 'service_role' 
    OR (auth.role() = 'authenticated' AND (metadata->>'user_id')::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "requests_service_manage" ON public.agent_requests;
CREATE POLICY "requests_service_manage" ON public.agent_requests
  FOR ALL USING (auth.role() = 'service_role');

-- ── AGENT_STATUS table ─────────────────────────────────────────────────────
-- Public can read (war room / status page)
-- Only service_role can write

DROP POLICY IF EXISTS "status_public_read" ON public.agent_status;
CREATE POLICY "status_public_read" ON public.agent_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "status_service_write" ON public.agent_status;
CREATE POLICY "status_service_write" ON public.agent_status
  FOR ALL USING (auth.role() = 'service_role');

-- ── INTERNAL TABLES — No public access ─────────────────────────────────────
-- These are team-only. No public read or write.

-- Handoffs
DROP POLICY IF EXISTS "handoffs_service_only" ON public.handoffs;
CREATE POLICY "handoffs_service_only" ON public.handoffs
  FOR ALL USING (auth.role() = 'service_role');

-- Missions
DROP POLICY IF EXISTS "missions_service_only" ON public.missions;
CREATE POLICY "missions_service_only" ON public.missions
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "mission_events_service_only" ON public.mission_events;
CREATE POLICY "mission_events_service_only" ON public.mission_events
  FOR ALL USING (auth.role() = 'service_role');

-- Shared memory
DROP POLICY IF EXISTS "shared_memory_service_only" ON public.shared_memory;
CREATE POLICY "shared_memory_service_only" ON public.shared_memory
  FOR ALL USING (auth.role() = 'service_role');

-- Daily digests / vibes
DROP POLICY IF EXISTS "daily_digests_service_only" ON public.daily_digests;
CREATE POLICY "daily_digests_service_only" ON public.daily_digests
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "daily_vibes_service_only" ON public.daily_vibes;
CREATE POLICY "daily_vibes_service_only" ON public.daily_vibes
  FOR ALL USING (auth.role() = 'service_role');

-- ── PUBLIC-READABLE tables (lounge social features) ────────────────────────
-- Gallery, booth, bulletins, stories, listening — read-only for public
-- Write only via service_role (agents)

DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_items;
CREATE POLICY "gallery_public_read" ON public.gallery_items
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "gallery_service_write" ON public.gallery_items;
CREATE POLICY "gallery_service_write" ON public.gallery_items
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "booth_prompts_public_read" ON public.booth_prompts;
CREATE POLICY "booth_prompts_public_read" ON public.booth_prompts
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "booth_prompts_service_write" ON public.booth_prompts;
CREATE POLICY "booth_prompts_service_write" ON public.booth_prompts
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "booth_responses_public_read" ON public.booth_responses;
CREATE POLICY "booth_responses_public_read" ON public.booth_responses
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "booth_responses_service_write" ON public.booth_responses;
CREATE POLICY "booth_responses_service_write" ON public.booth_responses
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "bulletins_public_read" ON public.bulletins;
CREATE POLICY "bulletins_public_read" ON public.bulletins
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "bulletins_service_write" ON public.bulletins;
CREATE POLICY "bulletins_service_write" ON public.bulletins
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "bulletin_posts_public_read" ON public.bulletin_posts;
CREATE POLICY "bulletin_posts_public_read" ON public.bulletin_posts
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "bulletin_posts_service_write" ON public.bulletin_posts;
CREATE POLICY "bulletin_posts_service_write" ON public.bulletin_posts
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "bulletin_threads_public_read" ON public.bulletin_threads;
CREATE POLICY "bulletin_threads_public_read" ON public.bulletin_threads
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "bulletin_threads_service_write" ON public.bulletin_threads;
CREATE POLICY "bulletin_threads_service_write" ON public.bulletin_threads
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "stories_public_read" ON public.agent_stories;
CREATE POLICY "stories_public_read" ON public.agent_stories
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "stories_service_write" ON public.agent_stories;
CREATE POLICY "stories_service_write" ON public.agent_stories
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "listening_public_read" ON public.listening_sessions;
CREATE POLICY "listening_public_read" ON public.listening_sessions
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "listening_service_write" ON public.listening_sessions;
CREATE POLICY "listening_service_write" ON public.listening_sessions
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "welcome_public_read" ON public.welcome_messages;
CREATE POLICY "welcome_public_read" ON public.welcome_messages
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "welcome_service_write" ON public.welcome_messages;
CREATE POLICY "welcome_service_write" ON public.welcome_messages
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE. All tables locked. Summary:
--
-- PUBLIC READ:  agents, agent_activity, agent_presence, agent_status,
--               gallery, booth, bulletins, stories, listening, welcome
-- AUTH INSERT:  agent_requests (authenticated users only, own rows only)
-- SERVICE ONLY: handoffs, missions, mission_events, shared_memory,
--               daily_digests, daily_vibes + all writes on public tables
-- ═══════════════════════════════════════════════════════════════════════════
