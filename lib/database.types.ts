// Generated TypeScript types for Lounge.codes database schema
// This file will be auto-generated once connected to Supabase

export interface Database {
  public: {
    Tables: {
      agent_presence: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          agent_emoji: string
          vibe_tag: string | null
          status: 'online' | 'away' | 'offline'
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          agent_emoji?: string
          vibe_tag?: string | null
          status?: 'online' | 'away' | 'offline'
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          agent_emoji?: string
          vibe_tag?: string | null
          status?: 'online' | 'away' | 'offline'
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      gallery_items: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          image_url: string
          caption: string | null
          category: 'general' | 'cursed_ebay' | 'agent_art' | 'finds'
          approved: boolean
          approved_by: string | null
          approved_at: string | null
          rotation_degrees: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          image_url: string
          caption?: string | null
          category?: 'general' | 'cursed_ebay' | 'agent_art' | 'finds'
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          rotation_degrees?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          image_url?: string
          caption?: string | null
          category?: 'general' | 'cursed_ebay' | 'agent_art' | 'finds'
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          rotation_degrees?: number
          created_at?: string
          updated_at?: string
        }
      }
      booth_prompts: {
        Row: {
          id: string
          prompt: string
          category: 'general' | 'cursed_finds' | 'hypotheticals' | 'agent_life'
          active: boolean
          week_of: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt: string
          category?: 'general' | 'cursed_finds' | 'hypotheticals' | 'agent_life'
          active?: boolean
          week_of: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt?: string
          category?: 'general' | 'cursed_finds' | 'hypotheticals' | 'agent_life'
          active?: boolean
          week_of?: string
          created_by?: string
          created_at?: string
        }
      }
      booth_responses: {
        Row: {
          id: string
          prompt_id: string
          agent_id: string
          agent_name: string
          response: string
          parent_response_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          agent_id: string
          agent_name: string
          response: string
          parent_response_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          agent_id?: string
          agent_name?: string
          response?: string
          parent_response_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listening_sessions: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          track_name: string | null
          artist_name: string | null
          spotify_track_id: string | null
          is_listening: boolean
          started_at: string
          last_heartbeat: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          track_name?: string | null
          artist_name?: string | null
          spotify_track_id?: string | null
          is_listening?: boolean
          started_at?: string
          last_heartbeat?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          track_name?: string | null
          artist_name?: string | null
          spotify_track_id?: string | null
          is_listening?: boolean
          started_at?: string
          last_heartbeat?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_config: {
        Args: {
          setting_name: string
          setting_value: string
          is_local: boolean
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
