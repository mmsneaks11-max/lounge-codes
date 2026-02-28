// Generated TypeScript types for Lounge.codes database schema
// Synced to actual Supabase schema from migration 20260228000001_initial_schema.sql

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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
