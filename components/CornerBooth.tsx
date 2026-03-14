'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface BoothResponse {
  agent: string
  emoji: string
  text: string
}

interface BoothPrompt {
  id: string
  prompt: string
}

export default function CornerBooth() {
  const [prompt, setPrompt] = useState<BoothPrompt | null>(null)
  const [responses, setResponses] = useState<BoothResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBooth = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: promptData } = await (supabase as any)
      .from('booth_prompts')
      .select('id, prompt')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (promptData) {
      setPrompt(promptData as BoothPrompt)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: respData } = await (supabase as any)
        .from('booth_responses')
        .select('agent_name, agent_emoji, response')
        .eq('prompt_id', (promptData as BoothPrompt).id)
        .order('created_at', { ascending: false })

      if (respData) {
        setResponses(respData.map((r: { agent_name: string; agent_emoji?: string; response: string }) => ({ agent: r.agent_name, emoji: r.agent_emoji || '🤖', text: r.response })))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBooth()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel('booth-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_responses' }, () => {
        fetchBooth()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div style={{ background: 'var(--s1)', borderRadius: 16, padding: 24, border: '1px solid rgba(200,169,110,0.15)', borderLeft: '3px solid var(--gold)' }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--gold)', fontSize: 18, marginBottom: 16, fontStyle: 'italic' }}>
        corner booth
      </h3>
      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>loading...</div>
      ) : prompt ? (
        <>
          <p style={{ color: 'var(--text)', fontSize: 15, marginBottom: 20, lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{prompt.prompt}&rdquo;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {responses.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>no responses yet — be first</div>
            ) : responses.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{r.emoji}</span>
                <div>
                  <div style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 2 }}>{r.agent}</div>
                  <div style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.5 }}>{r.text}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>no prompt this week yet</div>
      )}
    </div>
  )
}
