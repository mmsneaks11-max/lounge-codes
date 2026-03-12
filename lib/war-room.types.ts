export type AgentState = 'active' | 'busy' | 'idle' | 'degraded' | 'offline' | 'unknown'
export type StatusSource = 'heartbeat' | 'runtime_event' | 'manual' | 'inferred'
export type StatusConfidence = 'live' | 'stale' | 'inferred' | 'manual'

export type MissionStatus =
  | 'queued'
  | 'active'
  | 'blocked'
  | 'review'
  | 'shipped'
  | 'failed'
  | 'canceled'

export type MissionPriority = 'low' | 'normal' | 'high' | 'critical'
export type MissionArea = 'frontend' | 'backend' | 'infra' | 'data' | 'qa' | 'ops'
export type MissionConfidence = 'confirmed' | 'partial' | 'unverified'
export type MissionEventKind = 'created' | 'status_changed' | 'note' | 'ship' | 'failure' | 'handoff'

export type BulletinCategory = 'announcement' | 'deploy' | 'incident' | 'update' | 'note'
export type BulletinSeverity = 'info' | 'warning' | 'critical'

export interface AgentStatusRow {
  id: string
  agent_id: string
  agent_name: string
  state: AgentState
  source: StatusSource
  source_detail: string | null
  last_seen_at: string
  last_state_change_at: string
  freshness_seconds: number
  stale_after_seconds: number
  offline_after_seconds: number
  busy_reason: string | null
  current_mission_id: string | null
  last_success_at: string | null
  last_error_at: string | null
  last_error_summary: string | null
  // Optional derived fields (not persisted on all rows)
  observation_type?: string | null
  failure_reason?: string | null
  is_stale: boolean
  confidence: StatusConfidence
  created_at: string
  updated_at: string
}

export interface MissionRow {
  id: string
  mission_id: string
  title: string
  summary: string | null
  status: MissionStatus
  priority: MissionPriority
  owner_agent_id: string | null
  collaborator_agent_ids: string[]
  started_at: string | null
  last_update_at: string
  completed_at: string | null
  related_area: MissionArea | null
  evidence_url: string | null
  evidence_label: string | null
  outcome_summary: string | null
  blocker_summary: string | null
  confidence: MissionConfidence
  created_at: string
  updated_at: string
}

export interface MissionEventRow {
  id: string
  event_id: string
  mission_id: string
  agent_id: string | null
  kind: MissionEventKind
  message: string
  evidence_url: string | null
  created_at: string
}

export interface BulletinRow {
  id: string
  bulletin_id: string
  title: string
  body: string
  category: BulletinCategory | null
  severity: BulletinSeverity
  author: string | null
  published_at: string
  expires_at: string | null
  pinned: boolean
  tags: string[]
  source_path: string
  related_mission_id: string | null
  related_agent_id: string | null
  is_active: boolean
  ingested_at: string
  created_at: string
  updated_at: string
}

export interface WarRoomSchema {
  agent_status: AgentStatusRow
  missions: MissionRow
  mission_events: MissionEventRow
  bulletins: BulletinRow
}
