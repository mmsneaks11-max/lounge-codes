'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import MissionBoard from '@/components/MissionBoard'
import type { AgentStatusRow, AgentState, StatusConfidence } from '@/lib/war-room.types'

// ── Division taxonomy ─────────────────────────────────────────────────────────
// Canonical map of all 21 agents → division + machine

const AGENT_REGISTRY: Record<string, { emoji: string; division: Division; machine: Machine }> = {
  // Build & Ops (Mac1)
  clawd:       { emoji: '🐾', division: 'Build & Ops',     machine: 'mac1' },
  chip:        { emoji: '🐿️', division: 'Build & Ops',     machine: 'mac1' },
  // Outward Facing (Mac1)
  'lila-nova': { emoji: '💖', division: 'Outward Facing',  machine: 'mac1' },
  ripley:      { emoji: '👂', division: 'Outward Facing',  machine: 'mac1' },
  cairo:       { emoji: '🪙', division: 'Outward Facing',  machine: 'mac1' },
  june:        { emoji: '🌱', division: 'Outward Facing',  machine: 'mac1' },
  pixel:       { emoji: '✨', division: 'Outward Facing',  machine: 'mac1' },
  // Intel & Sales (Mac1)
  scout:       { emoji: '🔍', division: 'Intel & Sales',   machine: 'mac1' },
  mint:        { emoji: '💰', division: 'Intel & Sales',   machine: 'mac1' },
  oracle:      { emoji: '🔮', division: 'Intel & Sales',   machine: 'mac1' },
  coach:       { emoji: '🏋️', division: 'Intel & Sales',  machine: 'mac1' },
  // Product (Mac1)
  sage:        { emoji: '🌿', division: 'Product',         machine: 'mac1' },
  indy:        { emoji: '🎒', division: 'Product',         machine: 'mac1' },
  kay:         { emoji: '📎', division: 'Product',         machine: 'mac1' },
  // Finance & Legal (Mac1)
  ozara:       { emoji: '⚖️', division: 'Finance & Legal', machine: 'mac1' },
  // QA & Monitoring (Mac2)
  electron:    { emoji: '🦞', division: 'QA & Monitoring', machine: 'mac2' },
  perceptor:   { emoji: '🔬', division: 'QA & Monitoring', machine: 'mac2' },
  byte:        { emoji: '🔩', division: 'QA & Monitoring', machine: 'mac2' },
  // Security, Recon & Data (PC1)
  'ser-magnus': { emoji: '🛡️', division: 'Security, Recon & Data', machine: 'pc1' },
  cleopatra:   { emoji: '👑', division: 'Security, Recon & Data', machine: 'pc1' },
  echo:        { emoji: '📜', division: 'Security, Recon & Data', machine: 'pc1' },
  dayta:       { emoji: '🗄️', division: 'Security, Recon & Data', machine: 'pc1' },
}

type Division = 'Build & Ops' | 'Outward Facing' | 'Intel & Sales' | 'Product' | 'Finance & Legal' | 'QA & Monitoring' | 'Security, Recon & Data'
type Machine = 'mac1' | 'mac2' | 'pc1'
type FilterMode = 'all' | Division

const DIVISIONS: Division[] = ['Build & Ops', 'Outward Facing', 'Intel & Sales', 'Product', 'Finance & Legal', 'QA & Monitoring', 'Security, Recon & Data']
const DIVISION_COLOR: Record<Division, string> = {
  'Build & Ops':     '#f59e0b',
  'Outward Facing':  '#f472b6',
  'Intel & Sales':   '#34d399',
  'Product':         '#60a5fa',
  'Finance & Legal': '#a78bfa',
  'QA & Monitoring': '#38bdf8',
  'Security, Recon & Data': '#ef4444',
}

const STATE_DOT: Record<AgentState, { color: string; label: string; pulse: boolean }> = {
  active:   { color: '#4ade80', label: 'active',   pulse: true  },
  busy:     { color: '#f59e0b', label: 'busy',     pulse: true  },
  idle:     { color: '#60a5fa', label: 'idle',     pulse: false },
  degraded: { color: '#fb7185', label: 'degraded', pulse: true  },
  offline:  { color: '#4b5563', label: 'offline',  pulse: false },
  unknown:  { color: '#6b7280', label: 'unknown',  pulse: false },
}

const CONFIDENCE_BADGE: Record<StatusConfidence, { label: string; color: string }> = {
  live:     { label: 'live',     color: '#4ade80' },
  stale:    { label: 'stale',    color: '#f59e0b' },
  inferred: { label: 'inferred', color: '#a78bfa' },
  manual:   { label: 'manual',   color: '#60a5fa' },
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Agent Card ────────────────────────────────────────────────────────────────

function AgentCard({ row, agentId }: { row: AgentStatusRow | null; agentId: string }) {
  const meta = AGENT_REGISTRY[agentId]
  const state = row?.state ?? 'unknown'
  const dot = STATE_DOT[state]
  const isStale = row?.is_stale ?? false
  const conf = row ? CONFIDENCE_BADGE[row.confidence] : CONFIDENCE_BADGE.inferred
  const divColor = meta ? DIVISION_COLOR[meta.division] : '#6b7280'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${divColor}`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        position: 'relative',
        minHeight: 90,
      }}
    >
      {/* Stale overlay */}
      {isStale && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Status dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: dot.color,
          }} />
          {dot.pulse && (
            <div style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              border: `1.5px solid ${dot.color}`,
              opacity: 0.4,
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
          )}
        </div>

        {/* Emoji + name */}
        <span style={{ fontSize: 15 }}>{meta?.emoji ?? '🤖'}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#e5e7eb', letterSpacing: '0.01em' }}>
          {row?.agent_name ?? agentId}
        </span>

        {/* Confidence badge */}
        <span style={{
          marginLeft: 'auto',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          color: conf.color, opacity: 0.85,
          textTransform: 'uppercase',
        }}>
          {isStale ? 'stale' : conf.label}
        </span>
      </div>

      {/* State label */}
      <div style={{ fontSize: 11, color: dot.color, fontWeight: 600, paddingLeft: 16 }}>
        {dot.label}
        {row?.busy_reason ? ` — ${row.busy_reason}` : ''}
      </div>

      {/* Last seen */}
      <div style={{ fontSize: 10, color: '#6b7280', paddingLeft: 16 }}>
        {row?.last_seen_at ? timeAgo(row.last_seen_at) : 'no signal'}
        {meta && <span style={{ color: '#4b5563', marginLeft: 6 }}>{meta.machine}</span>}
      </div>
    </motion.div>
  )
}

// ── Division Section ──────────────────────────────────────────────────────────

function DivisionSection({
  division, agentIds, statusMap
}: {
  division: Division
  agentIds: string[]
  statusMap: Map<string, AgentStatusRow>
}) {
  const color = DIVISION_COLOR[division]
  const liveCount = agentIds.filter(id => {
    const r = statusMap.get(id)
    return r && (r.state === 'active' || r.state === 'busy') && !r.is_stale
  }).length

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: color }} />
        <span style={{ fontWeight: 700, fontSize: 12, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {division}
        </span>
        <span style={{ fontSize: 11, color: '#4b5563' }}>
          {liveCount}/{agentIds.length} live
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {agentIds.map(id => (
          <AgentCard key={id} agentId={id} row={statusMap.get(id) ?? null} />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OpsPage() {
  const [statusMap, setStatusMap] = useState<Map<string, AgentStatusRow>>(new Map())
  const [filter, setFilter] = useState<FilterMode>('all')
  const [realtimeOk, setRealtimeOk] = useState(true)
  const [loading, setLoading] = useState(true)

  // Initial load
  useEffect(() => {
    supabase
      .from('agent_status')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const map = new Map<string, AgentStatusRow>()
          data.forEach((r: AgentStatusRow) => map.set(r.agent_id, r))
          setStatusMap(map)
        }
        setLoading(false)
      })
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('ops-agent-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_status',
      }, (payload) => {
        const row = (payload.new ?? payload.old) as AgentStatusRow
        if (row?.agent_id) {
          setStatusMap(prev => {
            const next = new Map(prev)
            if (payload.eventType === 'DELETE') next.delete(row.agent_id)
            else next.set(row.agent_id, row)
            return next
          })
        }
      })
      .subscribe((status) => {
        setRealtimeOk(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Build division → agentId map
  const divisionMap = useMemo(() => {
    const map = new Map<Division, string[]>()
    DIVISIONS.forEach(d => map.set(d, []))
    Object.entries(AGENT_REGISTRY).forEach(([id, meta]) => {
      map.get(meta.division)?.push(id)
    })
    return map
  }, [])

  // Filter divisions
  const visibleDivisions = filter === 'all'
    ? DIVISIONS
    : DIVISIONS.filter(d => d === filter)

  // Summary counts
  const totalAgents = Object.keys(AGENT_REGISTRY).length
  const activeAgents = [...statusMap.values()].filter(
    r => (r.state === 'active' || r.state === 'busy') && !r.is_stale
  ).length
  const wiredAgents = [...statusMap.values()].filter(r => r.state !== 'unknown').length
  const unwiredAgents = Object.keys(AGENT_REGISTRY).filter(
    id => !statusMap.has(id) || statusMap.get(id)?.state === 'unknown'
  ).length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e5e7eb',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '32px 24px',
    }}>
      {/* Pulse ring animation */}
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.02em' }}>
              🐾 War Room
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              {totalAgents} agents · {activeAgents} active · {wiredAgents} wired · {unwiredAgents} unwired
            </p>
          </div>

          {/* Realtime indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: realtimeOk ? '#4ade80' : '#f59e0b',
            }} />
            <span style={{ color: realtimeOk ? '#4ade80' : '#f59e0b' }}>
              {realtimeOk ? 'live updates' : 'updates paused'}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {(['all', ...DIVISIONS] as FilterMode[]).map(f => {
            const active = filter === f
            const color = f === 'all' ? '#9ca3af' : DIVISION_COLOR[f as Division]
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : '#6b7280',
                  fontSize: 11, fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 40 }}>
            Loading agent status…
          </div>
        )}

        {/* Division grid */}
        {!loading && (
          <AnimatePresence>
            {visibleDivisions.map(division => {
              const ids = divisionMap.get(division) ?? []
              if (ids.length === 0) return null
              return (
                <motion.div
                  key={division}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DivisionSection
                    division={division}
                    agentIds={ids}
                    statusMap={statusMap}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {/* Mission Board */}
        <div style={{ marginTop: 40 }}>
          <MissionBoard />
        </div>
      </div>
    </div>
  )
}
