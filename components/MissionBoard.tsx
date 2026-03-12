'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type {
  MissionRow, MissionEventRow, MissionStatus, MissionPriority,
  MissionConfidence, MissionArea
} from '@/lib/war-room.types'

// ── Status visual mapping ─────────────────────────────────────────────────────

const STATUS_META: Record<MissionStatus, { label: string; color: string; bg: string; icon: string }> = {
  queued:   { label: 'Queued',   color: '#9ca3af', bg: 'rgba(156,163,175,0.10)', icon: '⏳' },
  active:   { label: 'Active',   color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  icon: '🔨' },
  blocked:  { label: 'Blocked',  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  icon: '🚧' },
  review:   { label: 'Review',   color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', icon: '👀' },
  shipped:  { label: 'Shipped',  color: '#34d399', bg: 'rgba(52,211,153,0.10)',  icon: '🚀' },
  failed:   { label: 'Failed',   color: '#fb7185', bg: 'rgba(251,113,133,0.10)', icon: '❌' },
  canceled: { label: 'Canceled', color: '#6b7280', bg: 'rgba(107,114,128,0.10)', icon: '🗑️' },
}

const PRIORITY_META: Record<MissionPriority, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#6b7280' },
  normal:   { label: 'Normal',   color: '#9ca3af' },
  high:     { label: 'High',     color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
}

const CONFIDENCE_META: Record<MissionConfidence, { label: string; color: string }> = {
  confirmed:  { label: 'confirmed',  color: '#4ade80' },
  partial:    { label: 'partial',    color: '#f59e0b' },
  unverified: { label: 'unverified', color: '#6b7280' },
}

const AREA_META: Record<MissionArea, { label: string; color: string }> = {
  frontend: { label: 'frontend', color: '#60a5fa' },
  backend:  { label: 'backend',  color: '#34d399' },
  infra:    { label: 'infra',    color: '#f59e0b' },
  data:     { label: 'data',     color: '#a78bfa' },
  qa:       { label: 'qa',       color: '#38bdf8' },
  ops:      { label: 'ops',      color: '#fb923c' },
}

const EVENT_KIND_ICON: Record<string, string> = {
  created:        '🆕',
  status_changed: '🔄',
  note:           '📝',
  ship:           '🚀',
  failure:        '❌',
  handoff:        '🤝',
}

type BoardFilter = 'active' | 'all' | 'shipped' | 'blocked'

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Mission Card ──────────────────────────────────────────────────────────────

function MissionCard({
  mission, events, expanded, onToggle
}: {
  mission: MissionRow
  events: MissionEventRow[]
  expanded: boolean
  onToggle: () => void
}) {
  const sm = STATUS_META[mission.status]
  const pm = PRIORITY_META[mission.priority]
  const cm = CONFIDENCE_META[mission.confidence]
  const area = mission.related_area ? AREA_META[mission.related_area] : null

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 12,
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${sm.color}`,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Card header — clickable */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', color: 'inherit',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{sm.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 650, fontSize: 14, color: '#e5e7eb' }}>{mission.title}</span>
            {mission.priority !== 'normal' && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                color: pm.color, textTransform: 'uppercase',
              }}>
                {pm.label}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Pill label={sm.label} color={sm.color} bg={sm.bg} />
            <Pill label={cm.label} color={cm.color} />
            {area && <Pill label={area.label} color={area.color} />}
            {mission.owner_agent_id && (
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                owner: {mission.owner_agent_id}
              </span>
            )}
            <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>
              updated {timeAgo(mission.last_update_at)}
            </span>
          </div>

          {/* Summary */}
          {mission.summary && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, lineHeight: 1.45 }}>
              {mission.summary}
            </div>
          )}

          {/* Blocker callout */}
          {mission.status === 'blocked' && mission.blocker_summary && (
            <div style={{
              marginTop: 8, padding: '8px 10px', borderRadius: 8,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)',
              fontSize: 12, color: '#fde68a', lineHeight: 1.4,
            }}>
              🚧 {mission.blocker_summary}
            </div>
          )}

          {/* Shipped outcome */}
          {mission.status === 'shipped' && mission.outcome_summary && (
            <div style={{
              marginTop: 8, padding: '8px 10px', borderRadius: 8,
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)',
              fontSize: 12, color: '#a7f3d0', lineHeight: 1.4,
            }}>
              🚀 {mission.outcome_summary}
            </div>
          )}

          {/* Failed summary */}
          {mission.status === 'failed' && mission.outcome_summary && (
            <div style={{
              marginTop: 8, padding: '8px 10px', borderRadius: 8,
              background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.18)',
              fontSize: 12, color: '#fecdd3', lineHeight: 1.4,
            }}>
              ❌ {mission.outcome_summary}
            </div>
          )}
        </div>

        {/* Expand indicator */}
        <span style={{ fontSize: 12, color: '#4b5563', flexShrink: 0, marginTop: 2 }}>
          {expanded ? '▾' : '▸'} {events.length > 0 ? `${events.length}` : ''}
        </span>
      </button>

      {/* Event timeline — expanded */}
      <AnimatePresence>
        {expanded && events.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px 14px 42px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>
                    {EVENT_KIND_ICON[ev.kind] ?? '📌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.4 }}>
                      {ev.message}
                    </span>
                    <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                      {ev.agent_id && <span>{ev.agent_id} · </span>}
                      {timeAgo(ev.created_at)}
                      {ev.evidence_url && (
                        <a
                          href={ev.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#60a5fa', marginLeft: 6, textDecoration: 'none' }}
                        >
                          evidence ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

// ── Pill ──────────────────────────────────────────────────────────────────────

function Pill({ label, color, bg }: { label: string; color: string; bg?: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
      color, textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 999,
      border: `1px solid ${color}30`,
      background: bg ?? `${color}14`,
    }}>
      {label}
    </span>
  )
}

// ── Mission Board ─────────────────────────────────────────────────────────────

export default function MissionBoard() {
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [events, setEvents] = useState<MissionEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BoardFilter>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [realtimeOk, setRealtimeOk] = useState(true)

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .order('last_update_at', { ascending: false })

    if (data) setMissions(data)
    setLoading(false)
  }

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('mission_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchMissions()
    fetchEvents()

    const missionChannel = supabase
      .channel('mission-board-missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchMissions()
      })
      .subscribe((status) => {
        setRealtimeOk(s => s && status === 'SUBSCRIBED')
      })

    const eventChannel = supabase
      .channel('mission-board-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_events' }, () => {
        fetchEvents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(missionChannel)
      supabase.removeChannel(eventChannel)
    }
  }, [])

  // Build events-by-mission map
  const eventsByMission = useMemo(() => {
    const map = new Map<string, MissionEventRow[]>()
    events.forEach(ev => {
      const list = map.get(ev.mission_id) ?? []
      list.push(ev)
      map.set(ev.mission_id, list)
    })
    return map
  }, [events])

  // Filter missions
  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return missions.filter(m => ['queued', 'active', 'blocked', 'review'].includes(m.status))
      case 'shipped':
        return missions.filter(m => m.status === 'shipped')
      case 'blocked':
        return missions.filter(m => m.status === 'blocked')
      case 'all':
      default:
        return missions
    }
  }, [missions, filter])

  // Counts
  const activeMissions = missions.filter(m => ['queued', 'active', 'blocked', 'review'].includes(m.status)).length
  const shippedMissions = missions.filter(m => m.status === 'shipped').length
  const blockedMissions = missions.filter(m => m.status === 'blocked').length

  return (
    <section style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '24px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.01em' }}>
            🎯 Mission Board
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
            {activeMissions} active · {shippedMissions} shipped · {blockedMissions} blocked
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: realtimeOk ? '#4ade80' : '#f59e0b',
          }} />
          <span style={{ color: realtimeOk ? '#4ade80' : '#f59e0b' }}>
            {realtimeOk ? 'live' : 'paused'}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['active', 'all', 'shipped', 'blocked'] as BoardFilter[]).map(f => {
          const isActive = filter === f
          const count = f === 'active' ? activeMissions
            : f === 'shipped' ? shippedMissions
            : f === 'blocked' ? blockedMissions
            : missions.length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 16,
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive ? '#e5e7eb' : '#6b7280',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f} ({count})
            </button>
          )
        })}
      </div>

      {/* Mission list */}
      {loading ? (
        <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 32 }}>
          Loading missions…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '24px 16px',
          textAlign: 'center', color: '#6b7280', fontSize: 13,
        }}>
          {filter === 'active' ? 'No active missions.'
            : filter === 'shipped' ? 'No shipped missions yet.'
            : filter === 'blocked' ? 'No blocked missions — all clear.'
            : 'No missions recorded yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {filtered.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                events={eventsByMission.get(mission.id) ?? []}
                expanded={expandedId === mission.id}
                onToggle={() => setExpandedId(prev => prev === mission.id ? null : mission.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
