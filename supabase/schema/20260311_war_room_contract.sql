-- Lounge.codes war room contract
-- Canonical schema for agent status, missions, mission events, and bulletins.
-- Designed for Supabase/Postgres and intended to be copied into a numbered
-- migration file under supabase/migrations/ when ready to apply.

begin;

create extension if not exists pgcrypto;

-- =========================
-- Enums
-- =========================

do $$ begin
  create type agent_state as enum (
    'active',
    'busy',
    'idle',
    'degraded',
    'offline',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type status_source as enum (
    'heartbeat',
    'runtime_event',
    'manual',
    'inferred'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type status_confidence as enum (
    'live',
    'stale',
    'inferred',
    'manual'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_status as enum (
    'queued',
    'active',
    'blocked',
    'review',
    'shipped',
    'failed',
    'canceled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_priority as enum (
    'low',
    'normal',
    'high',
    'critical'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_area as enum (
    'frontend',
    'backend',
    'infra',
    'data',
    'qa',
    'ops'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_confidence as enum (
    'confirmed',
    'partial',
    'unverified'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_event_kind as enum (
    'created',
    'status_changed',
    'note',
    'ship',
    'failure',
    'handoff'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type bulletin_category as enum (
    'announcement',
    'deploy',
    'incident',
    'update',
    'note'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type bulletin_severity as enum (
    'info',
    'warning',
    'critical'
  );
exception
  when duplicate_object then null;
end $$;

-- =========================
-- agent_status
-- =========================

create table if not exists public.agent_status (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null unique,
  agent_name text not null,
  state agent_state not null default 'unknown',
  source status_source not null default 'inferred',
  source_detail text,
  last_seen_at timestamptz not null,
  last_state_change_at timestamptz not null default now(),
  freshness_seconds integer not null default 0,
  stale_after_seconds integer not null default 120,
  offline_after_seconds integer not null default 600,
  busy_reason text,
  current_mission_id uuid,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_summary text,
  is_stale boolean not null default false,
  confidence status_confidence not null default 'inferred',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_status_nonnegative_freshness check (freshness_seconds >= 0),
  constraint agent_status_positive_stale_after check (stale_after_seconds > 0),
  constraint agent_status_positive_offline_after check (offline_after_seconds > 0),
  constraint agent_status_threshold_order check (offline_after_seconds >= stale_after_seconds),
  constraint agent_status_busy_reason_required check (
    state <> 'busy' or nullif(trim(busy_reason), '') is not null or current_mission_id is not null
  ),
  constraint agent_status_error_summary_required check (
    state <> 'degraded' or nullif(trim(last_error_summary), '') is not null or last_error_at is not null
  ),
  constraint agent_status_manual_confidence_match check (
    source <> 'manual' or confidence = 'manual'
  ),
  constraint agent_status_inferred_confidence_match check (
    source <> 'inferred' or confidence = 'inferred'
  ),
  constraint agent_status_stale_confidence_match check (
    is_stale = false or confidence = 'stale' or state = 'offline'
  ),
  constraint agent_status_state_truth check (
    not (
      state in ('active', 'busy', 'idle')
      and is_stale = true
      and confidence <> 'stale'
    )
  )
);

create index if not exists idx_agent_status_state on public.agent_status(state);
create index if not exists idx_agent_status_updated_at on public.agent_status(updated_at desc);
create index if not exists idx_agent_status_last_seen_at on public.agent_status(last_seen_at desc);

-- =========================
-- missions
-- =========================

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null unique,
  title text not null,
  summary text,
  status mission_status not null default 'queued',
  priority mission_priority not null default 'normal',
  owner_agent_id text,
  collaborator_agent_ids text[] not null default '{}',
  started_at timestamptz,
  last_update_at timestamptz not null default now(),
  completed_at timestamptz,
  related_area mission_area,
  evidence_url text,
  evidence_label text,
  outcome_summary text,
  blocker_summary text,
  confidence mission_confidence not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_title_not_blank check (nullif(trim(title), '') is not null),
  constraint missions_completed_after_created check (
    completed_at is null or completed_at >= created_at
  ),
  constraint missions_started_before_completed check (
    started_at is null or completed_at is null or completed_at >= started_at
  ),
  constraint missions_shipped_requires_evidence_or_outcome check (
    status <> 'shipped' or nullif(trim(coalesce(evidence_url, '')), '') is not null or nullif(trim(coalesce(outcome_summary, '')), '') is not null
  ),
  constraint missions_blocked_requires_blocker check (
    status <> 'blocked' or nullif(trim(coalesce(blocker_summary, '')), '') is not null
  ),
  constraint missions_failed_requires_blocker check (
    status <> 'failed' or nullif(trim(coalesce(blocker_summary, '')), '') is not null
  )
);

create index if not exists idx_missions_status on public.missions(status);
create index if not exists idx_missions_priority on public.missions(priority);
create index if not exists idx_missions_last_update_at on public.missions(last_update_at desc);
create index if not exists idx_missions_owner_agent_id on public.missions(owner_agent_id);

-- =========================
-- mission_events
-- =========================

create table if not exists public.mission_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  mission_id uuid not null references public.missions(id) on delete cascade,
  agent_id text,
  kind mission_event_kind not null,
  message text not null,
  evidence_url text,
  created_at timestamptz not null default now(),
  constraint mission_events_message_not_blank check (nullif(trim(message), '') is not null)
);

create index if not exists idx_mission_events_mission_id on public.mission_events(mission_id);
create index if not exists idx_mission_events_created_at on public.mission_events(created_at desc);
create index if not exists idx_mission_events_kind on public.mission_events(kind);

-- =========================
-- bulletins
-- =========================

create table if not exists public.bulletins (
  id uuid primary key default gen_random_uuid(),
  bulletin_id text not null unique,
  title text not null,
  body text not null,
  category bulletin_category,
  severity bulletin_severity not null default 'info',
  author text,
  published_at timestamptz not null,
  expires_at timestamptz,
  pinned boolean not null default false,
  tags text[] not null default '{}',
  source_path text not null,
  related_mission_id uuid references public.missions(id) on delete set null,
  related_agent_id text,
  is_active boolean not null default true,
  ingested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bulletins_title_not_blank check (nullif(trim(title), '') is not null),
  constraint bulletins_body_not_blank check (nullif(trim(body), '') is not null),
  constraint bulletins_source_path_not_blank check (nullif(trim(source_path), '') is not null),
  constraint bulletins_expiry_after_publish check (
    expires_at is null or expires_at > published_at
  )
);

create index if not exists idx_bulletins_published_at on public.bulletins(published_at desc);
create index if not exists idx_bulletins_is_active on public.bulletins(is_active);
create index if not exists idx_bulletins_severity on public.bulletins(severity);
create index if not exists idx_bulletins_source_path on public.bulletins(source_path);

-- =========================
-- Foreign key backfill now that missions exists
-- =========================

do $$ begin
  alter table public.agent_status
    add constraint agent_status_current_mission_id_fkey
    foreign key (current_mission_id) references public.missions(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

-- =========================
-- updated_at helper
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_agent_status_updated_at on public.agent_status;
create trigger trg_agent_status_updated_at
before update on public.agent_status
for each row execute function public.set_updated_at();

drop trigger if exists trg_missions_updated_at on public.missions;
create trigger trg_missions_updated_at
before update on public.missions
for each row execute function public.set_updated_at();

drop trigger if exists trg_bulletins_updated_at on public.bulletins;
create trigger trg_bulletins_updated_at
before update on public.bulletins
for each row execute function public.set_updated_at();

commit;
