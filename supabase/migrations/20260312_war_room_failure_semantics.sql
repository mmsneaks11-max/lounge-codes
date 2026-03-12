alter table public.agent_status
  add column if not exists failure_reason text,
  add column if not exists observation_type text not null default 'direct_heartbeat';

alter table public.agent_status
  drop constraint if exists agent_status_failure_reason_check;

alter table public.agent_status
  add constraint agent_status_failure_reason_check check (
    failure_reason is null or failure_reason in (
      'agent_healthy',
      'agent_stale',
      'ssh_unreachable',
      'host_unreachable',
      'agent_write_failed',
      'supabase_write_failed',
      'scheduler_failed',
      'unknown'
    )
  );

alter table public.agent_status
  drop constraint if exists agent_status_observation_type_check;

alter table public.agent_status
  add constraint agent_status_observation_type_check check (
    observation_type in (
      'direct_heartbeat',
      'host_inferred',
      'seed_only',
      'manual_override',
      'synthetic_check'
    )
  );

update public.agent_status
set
  failure_reason = coalesce(
    failure_reason,
    case
      when state = 'offline' then 'agent_stale'
      when is_stale then 'agent_stale'
      else 'agent_healthy'
    end
  ),
  observation_type = coalesce(
    observation_type,
    case
      when source = 'manual' then 'manual_override'
      when source = 'inferred' then 'host_inferred'
      else 'direct_heartbeat'
    end
  );
