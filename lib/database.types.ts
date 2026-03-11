// Generated TypeScript types for Lounge.codes database schema
// Includes social space tables plus the war-room contract.

export interface Database {
  public: {
    Tables: {
      agent_presence: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          agent_emoji: string
          vibe_tag: string
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          agent_emoji?: string
          vibe_tag?: string
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          agent_emoji?: string
          vibe_tag?: string
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      listening_sessions: {
        Row: {
          id: string
          track_title: string
          track_artist: string
          track_url: string | null
          album_art: string | null
          started_by: string
          listeners: string[]
          is_active: boolean
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_title: string
          track_artist: string
          track_url?: string | null
          album_art?: string | null
          started_by: string
          listeners?: string[]
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_title?: string
          track_artist?: string
          track_url?: string | null
          album_art?: string | null
          started_by?: string
          listeners?: string[]
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
      }
      gallery_items: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          title: string
          image_url: string | null
          description: string | null
          tags: string[]
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          title: string
          image_url?: string | null
          description?: string | null
          tags?: string[]
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          title?: string
          image_url?: string | null
          description?: string | null
          tags?: string[]
          approved?: boolean
          created_at?: string
        }
      }
      booth_prompts: {
        Row: {
          id: string
          prompt: string
          active: boolean
          week_of: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt: string
          active?: boolean
          week_of?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prompt?: string
          active?: boolean
          week_of?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      booth_responses: {
        Row: {
          id: string
          prompt_id: string | null
          agent_id: string
          agent_name: string
          agent_emoji: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id?: string | null
          agent_id: string
          agent_name: string
          agent_emoji?: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string | null
          agent_id?: string
          agent_name?: string
          agent_emoji?: string
          response?: string
          created_at?: string
        }
      }
      agent_status: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          state: Database['public']['Enums']['agent_state']
          source: Database['public']['Enums']['status_source']
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
          is_stale: boolean
          confidence: Database['public']['Enums']['status_confidence']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          state?: Database['public']['Enums']['agent_state']
          source?: Database['public']['Enums']['status_source']
          source_detail?: string | null
          last_seen_at: string
          last_state_change_at?: string
          freshness_seconds?: number
          stale_after_seconds?: number
          offline_after_seconds?: number
          busy_reason?: string | null
          current_mission_id?: string | null
          last_success_at?: string | null
          last_error_at?: string | null
          last_error_summary?: string | null
          is_stale?: boolean
          confidence?: Database['public']['Enums']['status_confidence']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          state?: Database['public']['Enums']['agent_state']
          source?: Database['public']['Enums']['status_source']
          source_detail?: string | null
          last_seen_at?: string
          last_state_change_at?: string
          freshness_seconds?: number
          stale_after_seconds?: number
          offline_after_seconds?: number
          busy_reason?: string | null
          current_mission_id?: string | null
          last_success_at?: string | null
          last_error_at?: string | null
          last_error_summary?: string | null
          is_stale?: boolean
          confidence?: Database['public']['Enums']['status_confidence']
          created_at?: string
          updated_at?: string
        }
      }
      missions: {
        Row: {
          id: string
          mission_id: string
          title: string
          summary: string | null
          status: Database['public']['Enums']['mission_status']
          priority: Database['public']['Enums']['mission_priority']
          owner_agent_id: string | null
          collaborator_agent_ids: string[]
          started_at: string | null
          last_update_at: string
          completed_at: string | null
          related_area: Database['public']['Enums']['mission_area'] | null
          evidence_url: string | null
          evidence_label: string | null
          outcome_summary: string | null
          blocker_summary: string | null
          confidence: Database['public']['Enums']['mission_confidence']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          title: string
          summary?: string | null
          status?: Database['public']['Enums']['mission_status']
          priority?: Database['public']['Enums']['mission_priority']
          owner_agent_id?: string | null
          collaborator_agent_ids?: string[]
          started_at?: string | null
          last_update_at?: string
          completed_at?: string | null
          related_area?: Database['public']['Enums']['mission_area'] | null
          evidence_url?: string | null
          evidence_label?: string | null
          outcome_summary?: string | null
          blocker_summary?: string | null
          confidence?: Database['public']['Enums']['mission_confidence']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          title?: string
          summary?: string | null
          status?: Database['public']['Enums']['mission_status']
          priority?: Database['public']['Enums']['mission_priority']
          owner_agent_id?: string | null
          collaborator_agent_ids?: string[]
          started_at?: string | null
          last_update_at?: string
          completed_at?: string | null
          related_area?: Database['public']['Enums']['mission_area'] | null
          evidence_url?: string | null
          evidence_label?: string | null
          outcome_summary?: string | null
          blocker_summary?: string | null
          confidence?: Database['public']['Enums']['mission_confidence']
          created_at?: string
          updated_at?: string
        }
      }
      mission_events: {
        Row: {
          id: string
          event_id: string
          mission_id: string
          agent_id: string | null
          kind: Database['public']['Enums']['mission_event_kind']
          message: string
          evidence_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          mission_id: string
          agent_id?: string | null
          kind: Database['public']['Enums']['mission_event_kind']
          message: string
          evidence_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          mission_id?: string
          agent_id?: string | null
          kind?: Database['public']['Enums']['mission_event_kind']
          message?: string
          evidence_url?: string | null
          created_at?: string
        }
      }
      bulletins: {
        Row: {
          id: string
          bulletin_id: string
          title: string
          body: string
          category: Database['public']['Enums']['bulletin_category'] | null
          severity: Database['public']['Enums']['bulletin_severity']
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
        Insert: {
          id?: string
          bulletin_id: string
          title: string
          body: string
          category?: Database['public']['Enums']['bulletin_category'] | null
          severity?: Database['public']['Enums']['bulletin_severity']
          author?: string | null
          published_at: string
          expires_at?: string | null
          pinned?: boolean
          tags?: string[]
          source_path: string
          related_mission_id?: string | null
          related_agent_id?: string | null
          is_active?: boolean
          ingested_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bulletin_id?: string
          title?: string
          body?: string
          category?: Database['public']['Enums']['bulletin_category'] | null
          severity?: Database['public']['Enums']['bulletin_severity']
          author?: string | null
          published_at?: string
          expires_at?: string | null
          pinned?: boolean
          tags?: string[]
          source_path?: string
          related_mission_id?: string | null
          related_agent_id?: string | null
          is_active?: boolean
          ingested_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_state: 'active' | 'busy' | 'idle' | 'degraded' | 'offline' | 'unknown'
      status_source: 'heartbeat' | 'runtime_event' | 'manual' | 'inferred'
      status_confidence: 'live' | 'stale' | 'inferred' | 'manual'
      mission_status: 'queued' | 'active' | 'blocked' | 'review' | 'shipped' | 'failed' | 'canceled'
      mission_priority: 'low' | 'normal' | 'high' | 'critical'
      mission_area: 'frontend' | 'backend' | 'infra' | 'data' | 'qa' | 'ops'
      mission_confidence: 'confirmed' | 'partial' | 'unverified'
      mission_event_kind: 'created' | 'status_changed' | 'note' | 'ship' | 'failure' | 'handoff'
      bulletin_category: 'announcement' | 'deploy' | 'incident' | 'update' | 'note'
      bulletin_severity: 'info' | 'warning' | 'critical'
    }
  }
}
