// Canonical types for the handoffs table
// Derived from live Supabase schema — 2026-03-12

export type HandoffStatus = 'pending' | 'picked_up' | 'completed' | 'stale' | 'rejected'
export type HandoffPriority = 'low' | 'normal' | 'high' | 'critical'

export interface HandoffRow {
  id: string
  created_at: string
  updated_at: string
  from_agent: string
  to_agent: string
  file_path: string
  file_mtime: string | null
  title: string | null
  summary: string | null
  raw_preview: string | null
  priority: HandoffPriority
  tags: string[] | null
  status: HandoffStatus
  picked_up_at: string | null
  picked_up_by: string | null
  indexed_by: string
  parsed_by_echo: boolean
  parsed_at: string | null
}
