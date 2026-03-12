'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { HandoffRow, HandoffStatus, HandoffPriority } from '@/lib/handoff.types'

// ── Visual mappings ───────────────────────────────────────────────────────────

const STATUS_META: Record<HandoffStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  icon: '📬' },
  picked_up: { label: 'Picked Up', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  icon: '👋' },
  completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  icon: '✅' },
  stale:     { label: 'Stale',     color: '#6b7280', bg: 'rgba(107,114,128,0.10)', icon: '⏰' },
  rejected:  { label: 'Rejected',  color: '#fb7185', bg: 'rgba(251,113,133,0.10)', icon: '❌' },
}

const PRIORITY_META: Record<HandoffPriority, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#6b7280' },
  normal:   { label: 'Normal',   color: '#9ca3af' },
  high:     { label: 'High',     color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
}

// Agent emoji registry (reuse from /ops)
const AGENT_EMOJI: Record<string, string> = {
  clawd: '🐾', chip: '🐿️', 'lila-nova': '💖', ripley: '👂', cairo: '🪙',
  june: '🌱', pixel: '✨', scout: '🔍', mint: '💰', oracle: '🔮',
  coach: '🏋️', sage: '🌿', indy: '🎒', kay: '📎', ozara: '⚖️',
  electron: '🦞', perceptor: '🔬', byte: '🔩',
  'ser-magnus': '🛡️', cleopatra: '👑', echo: '📜',
}

type BoardFilter = 'pending' | 'all' | 'completed' | 'picked_up'

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function agentLabel(id: string): string {
  const emoji = AGENT_EMOJI[id] ?? '🤖'
  return `${emoji} ${id}`
}

// ── Handoff Card ──────────────────────────────────────────────────────────────

function HandoffCard({ handoff, expanded, onToggle }: {
  handoff: HandoffRow
  expanded: boolean
  onToggle: () => void
}) {
  const sm = STATUS_META[handoff.status] ?? STATUS_META.pending
  const pm = PRIORITY_META[handoff.priority] ?? PRIORITY_META.normal

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${sm.color}`,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
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
          {/* Title / file path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 650, fontSize: 14, color: '#e5e7eb' }}>
              {handoff.title || handoff.file_path.split('/').pop() || 'Untitled handoff'}
            </span>
            {handoff.priority !== 'normal' && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                color: pm.color, textTransform: 'uppercase',
              }}>
                {pm.label}
              </span>
            )}
          </div>

          {/* From → To */}
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
            {agentLabel(handoff.from_agent)} → {agentLabel(handoff.to_agent)}
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Pill label={sm.label} color={sm.color} bg={sm.bg} />
            {handoff.parsed_by_echo && <Pill label="echo parsed" color="#a78bfa" />}
            {handoff.tags && handoff.tags.length > 0 && handoff.tags.map(tag => (
              <Pill key={tag} label={tag} color="#6b7280" />
            ))}
            <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>
              {timeAgo(handoff.created_at)}
            </span>
          </div>

          {/* Summary */}
          {handoff.summary && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, lineHeight: 1.45 }}>
              {handoff.summary}
            </div>
          )}
        </div>

        <span style={{ fontSize: 12, color: '#4b5563', flexShrink: 0, marginTop: 2 }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
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
              <DetailRow label="file" value={handoff.file_path} />
              <DetailRow label="from" value={agentLabel(handoff.from_agent)} />
              <DetailRow label="to" value={agentLabel(handoff.to_agent)} />
              <DetailRow label="status" value={sm.label} />
              <DetailRow label="priority" value={pm.label} />
              <DetailRow label="indexed by" value={handoff.indexed_by} />
              {handoff.picked_up_by && <DetailRow label="picked up by" value={handoff.picked_up_by} />}
              {handoff.picked_up_at && <DetailRow label="picked up" value={timeAgo(handoff.picked_up_at)} />}
              {handoff.parsed_at && <DetailRow label="parsed" value={timeAgo(handoff.parsed_at)} />}
              {handoff.file_mtime && <DetailRow label="file modified" value={timeAgo(handoff.file_mtime)} />}
              {handoff.raw_preview && (
                <div style={{
                  marginTop: 6, padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 11, color: '#9ca3af', lineHeight: 1.5,
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto',
                }}>
                  {handoff.raw_preview}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'start' }}>
      <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ color: '#d1d5db', fontSize: 12, lineHeight: 1.4 }}>{value}</div>
    </div>
  )
}

// ── Handoff Board ─────────────────────────────────────────────────────────────

export default function HandoffBoard() {
  const [handoffs, setHandoffs] = useState<HandoffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BoardFilter>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [realtimeOk, setRealtimeOk] = useState(true)

  const fetchHandoffs = async () => {
    const { data } = await supabase
      .from('handoffs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (data) setHandoffs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchHandoffs()

    const channel = supabase
      .channel('handoff-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'handoffs' }, () => {
        fetchHandoffs()
      })
      .subscribe((status) => {
        setRealtimeOk(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'pending':
        return handoffs.filter(h => h.status === 'pending')
      case 'picked_up':
        return handoffs.filter(h => h.status === 'picked_up')
      case 'completed':
        return handoffs.filter(h => h.status === 'completed')
      case 'all':
      default:
        return handoffs
    }
  }, [handoffs, filter])

  const pendingCount = handoffs.filter(h => h.status === 'pending').length
  const pickedUpCount = handoffs.filter(h => h.status === 'picked_up').length
  const completedCount = handoffs.filter(h => h.status === 'completed').length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e5e7eb',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.02em' }}>
              🤝 Handoff Board
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              {handoffs.length} total · {pendingCount} pending · {pickedUpCount} in progress · {completedCount} completed
            </p>
          </div>

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
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {(['pending', 'all', 'picked_up', 'completed'] as BoardFilter[]).map(f => {
            const isActive = filter === f
            const count = f === 'pending' ? pendingCount
              : f === 'picked_up' ? pickedUpCount
              : f === 'completed' ? completedCount
              : handoffs.length
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#e5e7eb' : '#6b7280',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f.replace('_', ' ')} ({count})
              </button>
            )
          })}
        </div>

        {/* Handoff list */}
        {loading ? (
          <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 40 }}>
            Loading handoffs…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '24px 16px',
            textAlign: 'center', color: '#6b7280', fontSize: 13,
          }}>
            {filter === 'pending' ? 'No pending handoffs — all clear.'
              : filter === 'picked_up' ? 'No handoffs in progress.'
              : filter === 'completed' ? 'No completed handoffs yet.'
              : 'No handoffs recorded yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {filtered.map(handoff => (
                <HandoffCard
                  key={handoff.id}
                  handoff={handoff}
                  expanded={expandedId === handoff.id}
                  onToggle={() => setExpandedId(prev => prev === handoff.id ? null : handoff.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
