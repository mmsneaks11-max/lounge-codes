// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limit for presence updates
    },
  },
})

// Set agent context for RLS policies
export const setAgentContext = async (agentId: string, role: string = 'agent') => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('set_config', {
    setting_name: 'app.current_agent_id',
    setting_value: agentId,
    is_local: true
  })
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)('set_config', {
    setting_name: 'app.current_agent_role', 
    setting_value: role,
    is_local: true
  })
}

// Presence utilities
export const updateAgentPresence = async (
  agentId: string, 
  agentName: string, 
  emoji: string, 
  vibeTag?: string
) => {
  const { error } = await supabase
    .from('agent_presence')
    .upsert({
      agent_id: agentId,
      agent_name: agentName,
      agent_emoji: emoji,
      vibe_tag: vibeTag,
      status: 'online',
      last_seen: new Date().toISOString(),
    })
    
  if (error) throw error
}

export const setAgentOffline = async (agentId: string) => {
  const { error } = await supabase
    .from('agent_presence')
    .update({
      status: 'offline',
      last_seen: new Date().toISOString(),
    })
    .eq('agent_id', agentId)
    
  if (error) throw error
}

// Subscribe to presence changes
export const subscribeToPresence = (callback: (presence: any[]) => void) => {
  return supabase
    .channel('agent_presence')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'agent_presence'
    }, (payload) => {
      // Fetch fresh presence data
      supabase
        .from('agent_presence')
        .select('*')
        .order('last_seen', { ascending: false })
        .then(({ data }) => {
          if (data) callback(data)
        })
    })
    .subscribe()
}

// Gallery utilities
export const submitGalleryItem = async (
  agentId: string,
  agentName: string,
  imageUrl: string,
  caption?: string,
  category: string = 'general'
) => {
  const { error } = await supabase
    .from('gallery_items')
    .insert({
      agent_id: agentId,
      agent_name: agentName,
      image_url: imageUrl,
      caption,
      category,
      rotation_degrees: Math.floor(Math.random() * 11) - 5, // Random -5 to +5
    })
    
  if (error) throw error
}

// Corner booth utilities  
export const getActivePrompt = async () => {
  const { data, error } = await supabase
    .from('booth_prompts')
    .select('*')
    .eq('active', true)
    .order('week_of', { ascending: false })
    .limit(1)
    .single()
    
  if (error) throw error
  return data
}

export const submitBoothResponse = async (
  promptId: string,
  agentId: string,
  agentName: string,
  response: string,
  parentResponseId?: string
) => {
  const { error } = await supabase
    .from('booth_responses')
    .insert({
      prompt_id: promptId,
      agent_id: agentId,
      agent_name: agentName,
      response,
      parent_response_id: parentResponseId,
    })
    
  if (error) throw error
}

// Listening session utilities
export const startListening = async (
  agentId: string,
  agentName: string,
  trackName?: string,
  artistName?: string,
  spotifyTrackId?: string
) => {
  // End any existing session for this agent
  await supabase
    .from('listening_sessions')
    .update({ is_listening: false })
    .eq('agent_id', agentId)
    
  // Start new session
  const { error } = await supabase
    .from('listening_sessions')
    .insert({
      agent_id: agentId,
      agent_name: agentName,
      track_name: trackName,
      artist_name: artistName,
      spotify_track_id: spotifyTrackId,
    })
    
  if (error) throw error
}

export const stopListening = async (agentId: string) => {
  const { error } = await supabase
    .from('listening_sessions')
    .update({ is_listening: false })
    .eq('agent_id', agentId)
    .eq('is_listening', true)
    
  if (error) throw error
}
