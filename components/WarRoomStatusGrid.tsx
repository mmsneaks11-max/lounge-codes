'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { AgentStatusRow, AgentState, StatusConfidence, StatusSource } from '@/lib/war-room.types'

const STATE_META: Record<AgentState, { label: string; color: string; glow: string }> = {
  active: { label: 'live', color: '#4ade80', glow: 'rgba(74, 222, 128, 0.35)' },
  busy: { label: 'busy', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  idle: { label: 'idle', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.28)' },
  degraded: { label: 'degraded', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.28)' },
  offline: { label: 'offline', color: '#6b7280', glow: 'rgba(107, 114, 128, 0.22)' },
  unknown: { label: 'unknown', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.22)' },
}

const CONFIDENCE_LABEL: Record<StatusConfidence, string> = {
  live: 'live',
  stale: 'stale',
  inferred: 'inferred',
  manual: 'manual',
}

const SOURCE_LABEL: Record<StatusSource, string> = {
  heartbeat: 'heartbeat',
  runtime_event: 'runtime event',
  manual: 'manual override',
  inferred: 'inferred',
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function resolveRenderState(row: AgentStatusRow): {
  state: AgentState
  confidence: StatusConfidence
  stale: boolean
} {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(row.last_seen_at).getTime()) / 1000))
  const shouldBeOffline = elapsedSeconds >= row.offline_after_seconds
  const shouldBeStale = elapsedSeconds >= row.stale_after_seconds || row.is_stale

  if (shouldBeOffline) {
    return { state: 'offline', confidence: 'stale', stale: true }
  }

  if (shouldBeStale && row.state !== 'offline') {
    return {
      state: row.state === 'degraded' ? 'degraded' : row.state,
      confidence: 'stale',
      stale: true,
    }
  }

  return {
    state: row.state,
    confidence: row.confidence,
    stale: row.is_stale,
  }
}

function getAgentInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function WarRoomStatusGrid() {
  const [rows, setRows] = useState<AgentStatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const [liveDisconnected, setLiveDisconnected] = useState(false)
  const [, setTick] = useState(0)

  const fetchStatuses = async () => {
    const { data, error } = await supabase
      .from('agent_status')
      .select('*')
      .order('state', { ascending: true })
      .order('agent_name', { ascending: true })

    if (!error && data) {
      setRows(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStatuses()

    const timer = window.setInterval(() => {
      setTick((value) => value + 1)
    }, 15000)

    const channel = supabase
      .channel('war-room-agent-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_status' }, () => {
        setLiveDisconnected(false)
        fetchStatuses()
      })
      .subscribe((status) => {
        setLiveDisconnected(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED')
      })

    return () => {
      window.clearInterval(timer)
      supabase.removeChannel(channel)
    }
  }, [])

  const cards = useMemo(() => {
    return rows.map((row) => {
      const resolved = resolveRenderState(row)
      return {
        ...row,
        renderedState: resolved.state,
        renderedConfidence: resolved.confidence,
        renderedStale: resolved.stale,
      }
    })
  }, [rows])

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, rgba(17,17,24,0.92), rgba(12,12,18,0.92))',
        borderRadius: 20,
        padding: 24,
        border: '1px solid rgba(200,169,110,0.16)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", serif',
              color: 'var(--gold)',
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            war room status
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
            live operator truth — no fake green dots, no silent stale state
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <StatusPill label={liveDisconnected ? 'live updates interrupted' : 'realtime connected'} tone={liveDisconnected ? 'danger' : 'ok'} />
          <StatusPill label={loading ? 'loading' : `${cards.length} agents`} tone={loading ? 'muted' : 'neutral'} />
        </div>
      </div>

      {liveDisconnected ? (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(251,113,133,0.22)',
            background: 'rgba(251,113,133,0.08)',
            color: '#fecdd3',
            fontSize: 12,
          }}
        >
          Live updates interrupted. Showing last known data until the realtime channel recovers.
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading agent truth...</div>
      ) : cards.length === 0 ? (
        <div
          style={{
            borderRadius: 16,
            border: '1px dashed rgba(255,255,255,0.12)',
            padding: 18,
            color: 'var(--muted)',
            fontSize: 13,
          }}
        >
          No agent status records yet. Unknown is more honest than pretending everyone is alive.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {cards.map((card, index) => {
            const meta = STATE_META[card.renderedState]
            const confidenceLabel = CONFIDENCE_LABEL[card.renderedConfidence]
            const sourceLabel = SOURCE_LABEL[card.source]
            const seenLabel = formatRelativeTime(card.last_seen_at)
            const changedLabel = formatRelativeTime(card.last_state_change_at)
            const tooltip = [sourceLabel, card.source_detail].filter(Boolean).join(' · ')

            return (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${meta.glow}`,
                  background: 'rgba(255,255,255,0.02)',
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.015), 0 12px 40px ${meta.glow}`,
                }}
                title={tooltip || undefined}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text)',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {getAgentInitials(card.agent_name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ color: 'var(--text)', fontWeight: 650, fontSize: 15 }}>{card.agent_name}</div>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: '999px',
                          background: meta.color,
                          boxShadow: `0 0 14px ${meta.glow}`,
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{card.agent_id}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <StatusPill label={meta.label} tone={toneForState(card.renderedState)} />
                  <StatusPill label={confidenceLabel} tone={card.renderedConfidence === 'stale' ? 'warn' : 'muted'} />
                  <StatusPill label={sourceLabel} tone="muted" />
                </div>

                <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                  <DetailRow label="seen" value={seenLabel} />
                  <DetailRow label="state changed" value={changedLabel} />
                  <DetailRow
                    label="freshness"
                    value={`${card.freshness_seconds}s · stale ${card.stale_after_seconds}s · offline ${card.offline_after_seconds}s`}
                  />
                  {card.busy_reason ? <DetailRow label="busy reason" value={card.busy_reason} /> : null}
                  {card.current_mission_id ? <DetailRow label="mission" value={card.current_mission_id} /> : null}
                  {card.last_error_summary ? <DetailRow label="error" value={card.last_error_summary} /> : null}
                </div>

                <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.5 }}>
                  {tooltip || 'No source detail provided.'}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function toneForState(state: AgentState): 'ok' | 'warn' | 'danger' | 'neutral' {
  switch (state) {
    case 'active':
      return 'ok'
    case 'busy':
    case 'idle':
      return 'warn'
    case 'degraded':
    case 'offline':
      return 'danger'
    default:
      return 'neutral'
  }
}

function StatusPill({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'danger' | 'neutral' | 'muted' }) {
  const tones: Record<typeof tone, { border: string; background: string; color: string }> = {
    ok: { border: 'rgba(74,222,128,0.22)', background: 'rgba(74,222,128,0.10)', color: '#bbf7d0' },
    warn: { border: 'rgba(245,158,11,0.22)', background: 'rgba(245,158,11,0.10)', color: '#fde68a' },
    danger: { border: 'rgba(251,113,133,0.24)', background: 'rgba(251,113,133,0.10)', color: '#fecdd3' },
    neutral: { border: 'rgba(96,165,250,0.20)', background: 'rgba(96,165,250,0.09)', color: '#bfdbfe' },
    muted: { border: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)' },
  }

  return (
    <span
      style={{
        border: `1px solid ${tones[tone].border}`,
        background: tones[tone].background,
        color: tones[tone].color,
        borderRadius: 999,
        padding: '5px 9px',
        fontSize: 11,
        lineHeight: 1,
        textTransform: 'lowercase',
      }}
    >
      {label}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 10, alignItems: 'start' }}>
      <div style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: 'var(--text)', fontSize: 12, lineHeight: 1.45 }}>{value}</div>
    </div>
  )
}
