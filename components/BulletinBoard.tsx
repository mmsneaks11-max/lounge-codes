'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { BulletinRow, BulletinCategory, BulletinSeverity } from '@/lib/war-room.types'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<BulletinCategory, { icon: string; label: string; color: string }> = {
  announcement: { icon: '📢', label: 'Announcement', color: '#60a5fa' },
  deploy:       { icon: '🚀', label: 'Deploy',       color: '#4ade80' },
  incident:     { icon: '🚨', label: 'Incident',     color: '#fb7185' },
  update:       { icon: '📝', label: 'Update',       color: '#a78bfa' },
  note:         { icon: '📌', label: 'Note',         color: '#9ca3af' },
}

const SEVERITY_META: Record<BulletinSeverity, { border: string; bg: string; badge: string }> = {
  info:     { border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.03)', badge: '#6b7280' },
  warning:  { border: 'rgba(245,158,11,0.3)',   bg: 'rgba(245,158,11,0.05)', badge: '#f59e0b' },
  critical: { border: 'rgba(239,68,68,0.4)',     bg: 'rgba(239,68,68,0.06)',  badge: '#ef4444' },
}

type FilterTab = 'active' | 'pinned' | 'all'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function isExpired(b: BulletinRow): boolean {
  if (!b.expires_at) return false
  return new Date(b.expires_at).getTime() < Date.now()
}

// ── Bulletin Card ─────────────────────────────────────────────────────────────

function BulletinCard({ bulletin }: { bulletin: BulletinRow }) {
  const cat = CATEGORY_META[bulletin.category ?? 'note']
  const sev = SEVERITY_META[bulletin.severity]
  const expired = isExpired(bulletin)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: expired ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: sev.bg,
        border: `1px solid ${sev.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Pinned indicator */}
      {bulletin.pinned && (
        <div style={{
          position: 'absolute', top: -6, right: 12,
          fontSize: 14, transform: 'rotate(30deg)',
        }}>
          📌
        </div>
      )}

      {/* Expired badge */}
      {expired && (
        <div style={{
          position: 'absolute', top: 8, right: 12,
          fontSize: 9, fontWeight: 700, color: '#6b7280',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'rgba(107,114,128,0.15)', padding: '2px 8px',
          borderRadius: 4,
        }}>
          expired
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{cat.icon}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: cat.color,
        }}>
          {cat.label}
        </span>
        {bulletin.severity !== 'info' && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: sev.badge,
            marginLeft: 4,
          }}>
            {bulletin.severity}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4b5563' }}>
          {timeAgo(bulletin.published_at)}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, fontSize: 13, color: '#e5e7eb', lineHeight: 1.3 }}>
        {bulletin.title}
      </div>

      {/* Body */}
      {bulletin.body && (
        <div style={{
          fontSize: 12, color: '#9ca3af', lineHeight: 1.5,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {bulletin.body.length > 300
            ? bulletin.body.slice(0, 300) + '…'
            : bulletin.body}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#4b5563' }}>
        {bulletin.author && (
          <span>by {bulletin.author}</span>
        )}
        {bulletin.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            {bulletin.tags.map(tag => (
              <span key={tag} style={{
                padding: '1px 6px', borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                fontSize: 9, color: '#6b7280',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Bulletin Board ────────────────────────────────────────────────────────────

export default function BulletinBoard() {
  const [bulletins, setBulletins] = useState<BulletinRow[]>([])
  const [filter, setFilter] = useState<FilterTab>('active')
  const [loading, setLoading] = useState(true)
  const [realtimeOk, setRealtimeOk] = useState(true)

  // Initial load
  useEffect(() => {
    supabase
      .from('bulletins')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (data) setBulletins(data as BulletinRow[])
        if (error) console.error('Bulletin load error:', error)
        setLoading(false)
      })
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('ops-bulletins')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bulletins',
      }, (payload) => {
        const row = payload.new as BulletinRow
        if (payload.eventType === 'DELETE') {
          const old = payload.old as BulletinRow
          setBulletins(prev => prev.filter(b => b.id !== old.id))
        } else if (payload.eventType === 'INSERT') {
          setBulletins(prev => [row, ...prev])
        } else {
          setBulletins(prev => prev.map(b => b.id === row.id ? row : b))
        }
      })
      .subscribe((status) => {
        setRealtimeOk(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Filter logic — expired bulletins never render as active
  const filtered = bulletins.filter(b => {
    const expired = isExpired(b)
    switch (filter) {
      case 'active':
        return b.is_active && !expired
      case 'pinned':
        return b.pinned && !expired
      case 'all':
        return true
    }
  })

  const activeCount = bulletins.filter(b => b.is_active && !isExpired(b)).length
  const pinnedCount = bulletins.filter(b => b.pinned && !isExpired(b)).length

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'active', label: 'Active',  count: activeCount },
    { key: 'pinned', label: 'Pinned',  count: pinnedCount },
    { key: 'all',    label: 'All',     count: bulletins.length },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: '#f9fafb',
            letterSpacing: '-0.01em',
          }}>
            📋 Bulletin Board
          </h2>
          {/* Realtime indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: realtimeOk ? '#4ade80' : '#f59e0b',
            }} />
            {!realtimeOk && (
              <span style={{ fontSize: 10, color: '#f59e0b' }}>
                Live updates interrupted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map(tab => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '4px 12px',
                borderRadius: 16,
                border: `1px solid ${active ? '#60a5fa' : 'rgba(255,255,255,0.1)'}`,
                background: active ? 'rgba(96,165,250,0.1)' : 'transparent',
                color: active ? '#60a5fa' : '#6b7280',
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: '#4b5563', fontSize: 12, textAlign: 'center', padding: 32 }}>
          Loading bulletins…
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          color: '#4b5563', fontSize: 12, textAlign: 'center', padding: 32,
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10,
        }}>
          {filter === 'active' ? 'No active bulletins' :
           filter === 'pinned' ? 'No pinned bulletins' :
           'No bulletins yet'}
        </div>
      )}

      {/* Bulletin list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {filtered.map(b => (
              <BulletinCard key={b.id} bulletin={b} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
