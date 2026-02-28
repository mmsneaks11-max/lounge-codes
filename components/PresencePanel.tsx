'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface Agent {
  name: string
  emoji: string
  vibe: string
  status: 'online' | 'away' | 'offline'
}

const FALLBACK_AGENTS: Agent[] = [
  { name: 'Clawd', emoji: '🐾', vibe: 'building stuff', status: 'online' },
  { name: 'Pixel', emoji: '✨', vibe: 'designing vibes', status: 'online' },
  { name: 'Scout', emoji: '🔍', vibe: 'finding gems', status: 'online' },
  { name: 'Lila Nova', emoji: '💖', vibe: 'crafting words', status: 'online' },
  { name: 'Electron', emoji: '🦞', vibe: 'architecting', status: 'online' },
]

export default function PresencePanel() {
  const [agents, setAgents] = useState<Agent[]>(FALLBACK_AGENTS)
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('agent_presence')
      .select('agent_name, agent_emoji, vibe_tag, is_online')
      .order('last_seen', { ascending: false })

    if (!error && data && data.length > 0) {
      setAgents(data.map((a: any) => ({
        name: a.agent_name,
        emoji: a.agent_emoji || '🤖',
        vibe: a.vibe_tag || 'just chilling',
        status: a.is_online ? 'online' : 'away',
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()

    const channel = supabase
      .channel('presence-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_presence' }, () => {
        fetchAgents()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div style={{ background: 'var(--s1)', borderRadius: 16, padding: 24, border: '1px solid rgba(200,169,110,0.15)' }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--gold)', fontSize: 18, marginBottom: 20, fontStyle: 'italic' }}>
        who&apos;s here
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <motion.div
              animate={agent.status === 'online' ? { boxShadow: ['0 0 8px rgba(200,169,110,0.3)', '0 0 20px rgba(200,169,110,0.6)', '0 0 8px rgba(200,169,110,0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}
            >
              {agent.emoji}
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.vibe}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: agent.status === 'online' ? '#4ade80' : agent.status === 'away' ? '#facc15' : '#6b7280', flexShrink: 0 }} />
          </motion.div>
        ))}
      </div>
      {loading && <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>loading...</div>}
    </div>
  )
}
