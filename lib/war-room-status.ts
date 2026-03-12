import type { AgentState, AgentStatusRow, StatusConfidence } from '@/lib/war-room.types'

export type FailureReason =
  | 'agent_healthy'
  | 'agent_stale'
  | 'ssh_unreachable'
  | 'host_unreachable'
  | 'agent_write_failed'
  | 'supabase_write_failed'
  | 'scheduler_failed'
  | 'unknown'

export type ObservationType =
  | 'direct_heartbeat'
  | 'host_inferred'
  | 'seed_only'
  | 'manual_override'
  | 'synthetic_check'

export interface DerivedAgentStatus {
  state: AgentState
  confidence: StatusConfidence
  isStale: boolean
  isOffline: boolean
  freshnessSeconds: number
  failureReason: FailureReason
  observationType: ObservationType
}

export function deriveAgentStatus(row: AgentStatusRow, nowMs = Date.now()): DerivedAgentStatus {
  const freshnessSeconds = Math.max(0, Math.floor((nowMs - new Date(row.last_seen_at).getTime()) / 1000))
  const isOffline = freshnessSeconds >= row.offline_after_seconds
  const isStale = freshnessSeconds >= row.stale_after_seconds || row.is_stale

  const observationType = row.observation_type ?? inferObservationType(row)

  if (isOffline) {
    return {
      state: 'offline',
      confidence: 'stale',
      isStale: true,
      isOffline: true,
      freshnessSeconds,
      failureReason: row.failure_reason ?? 'agent_stale',
      observationType,
    }
  }

  if (isStale) {
    return {
      state: row.state === 'offline' ? 'offline' : row.state,
      confidence: 'stale',
      isStale: true,
      isOffline: false,
      freshnessSeconds,
      failureReason: row.failure_reason ?? 'agent_stale',
      observationType,
    }
  }

  return {
    state: row.state,
    confidence: row.confidence,
    isStale: false,
    isOffline: false,
    freshnessSeconds,
    failureReason: row.failure_reason ?? 'agent_healthy',
    observationType,
  }
}

function inferObservationType(row: AgentStatusRow): ObservationType {
  if (row.source === 'manual') return 'manual_override'
  if (row.source === 'inferred') return row.last_seen_at === row.created_at ? 'seed_only' : 'host_inferred'
  return 'direct_heartbeat'
}
