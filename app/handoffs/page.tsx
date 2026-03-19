'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

interface DBHandoff {
  id: string;
  from_agent: string;
  to_agent: string;
  topic: string;
  status: 'OPEN' | 'RESOLVED' | 'BLOCKED';
  priority: string;
  body: string;
  resolution: string;
  blocked_on: string;
  created_at: string;
  updated_at: string;
}

interface Handoff extends DBHandoff {
  fromEmoji: string;
  toEmoji: string;
  date: string;
}

interface Note {
  id: string;
  from_agent: string;
  to_agent: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Agent emoji mapping ────────────────────────────────────────────────────

const AGENT_EMOJI: Record<string, string> = {
  'clawd': '🐾',
  'electron': '⚡',
  'dayta': '🗄️',
  'scout': '🔍',
  'lila': '💖',
  'indy': '🎒',
  'ripley': '👂',
  'kay': '📎',
  'chip': '🐿️',
  'pixel': '✨',
  'marcy': '📝',
  'cairo': '🌍',
  'june': '🎯',
  'cleopatra': '👑',
  'spoke': '🗣️',
  'oz': '🧙',
  'ozara': '💼',
  'sage': '🧠',
  'moltbot': '🤖',
  'clawdbot': '🤖',
};

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  OPEN:     '#FFD23F',
  RESOLVED: '#00D97E',
  BLOCKED:  '#FF4D4D',
};

const STATUS_BG: Record<string, string> = {
  OPEN:     'rgba(255,210,63,0.08)',
  RESOLVED: 'rgba(0,217,126,0.08)',
  BLOCKED:  'rgba(255,77,77,0.08)',
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Handoff Card ───────────────────────────────────────────────────────────

function HandoffCard({ h, expanded, onToggle }: { h: Handoff; expanded: boolean; onToggle: () => void }) {
  const color = STATUS_COLOR[h.status];
  const bg = STATUS_BG[h.status];
  const priorityColor = {
    'p0': '#FF4D4D',
    'p1': '#FF9500',
    'p2': '#00D97E',
    'p3': '#555',
  }[h.priority] || '#555';

  const dateObj = new Date(h.created_at);
  const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onToggle}
      style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `2px solid ${color}`,
        borderRadius: 10,
        padding: '14px 16px',
        transition: 'background 0.15s, border-color 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#15151D';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#111118';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      {/* Agents + status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{h.fromEmoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E8F0' }}>{h.from_agent}</span>
        <span style={{ fontSize: 10, color: '#555' }}>→</span>
        <span style={{ fontSize: 18 }}>{h.toEmoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E8F0' }}>{h.to_agent}</span>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: priorityColor,
            background: `${priorityColor}22`,
            border: `1px solid ${priorityColor}44`,
            borderRadius: 3,
            padding: '2px 6px',
            textTransform: 'uppercase',
          }}>
            {h.priority}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color,
            background: bg,
            border: `1px solid ${color}33`,
            borderRadius: 4,
            padding: '2px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {h.status}
          </span>
        </div>
      </div>

      {/* Topic */}
      <div style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.5, marginBottom: 8 }}>{h.topic}</div>

      {/* Footer: date + expand hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 10, color: '#444' }}>{date}</div>
        <div style={{ fontSize: 9, color: '#555', fontStyle: 'italic' }}>
          {expanded ? '▼ collapse' : '▶ expand'}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#A0A0B0' }}>
          {h.body && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6B80', marginBottom: 4 }}>DETAILS</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#C0C0D0' }}>{h.body}</div>
            </div>
          )}

          {h.status === 'RESOLVED' && h.resolution && (
            <div style={{ marginBottom: 12, padding: 8, background: 'rgba(0,217,126,0.08)', borderRadius: 6, borderLeft: '2px solid #00D97E' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#00D97E', marginBottom: 4 }}>✓ RESOLUTION</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{h.resolution}</div>
            </div>
          )}

          {h.status === 'BLOCKED' && h.blocked_on && (
            <div style={{ marginBottom: 12, padding: 8, background: 'rgba(255,77,77,0.08)', borderRadius: 6, borderLeft: '2px solid #FF4D4D' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#FF4D4D', marginBottom: 4 }}>⚠ BLOCKED ON</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{h.blocked_on}</div>
            </div>
          )}

          <div style={{ fontSize: 9, color: '#555', marginTop: 8 }}>
            Created: {new Date(h.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })} · Updated: {new Date(h.updated_at).toLocaleString('en-US', { timeStyle: 'short' })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Note Bubble ────────────────────────────────────────────────────────────

function NoteBubble({ note }: { note: Note }) {
  const isAll = note.to_agent === 'all';
  return (
    <div style={{
      background: '#111118',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '12px 14px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#C8A96E' }}>{note.from_agent}</span>
        <span style={{ fontSize: 10, color: '#444' }}>→</span>
        <span style={{ fontSize: 12, color: isAll ? '#4ade80' : '#6B6B80' }}>
          {isAll ? '@ everyone' : note.to_agent}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#444' }}>{timeAgo(note.created_at)}</span>
      </div>
      <div style={{ fontSize: 12, color: '#A0A0B0', lineHeight: 1.5 }}>{note.message}</div>
    </div>
  );
}

// ── Step Card (How It Works) ───────────────────────────────────────────────

function StepCard({ num, emoji, title, desc }: { num: string; emoji: string; title: string; desc: string }) {
  return (
    <div style={{
      background: '#111118',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '20px 18px',
      flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(200,169,110,0.1)',
          border: '1px solid rgba(200,169,110,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#C8A96E',
          flexShrink: 0,
        }}>{num}</span>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0' }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: '#6B6B80', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HandoffsPage() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSync, setLastSync] = useState('–');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'OPEN' | 'RESOLVED' | 'BLOCKED' | 'ALL'>('OPEN');

  // Fetch handoffs from feed API (public, no auth needed)
  const loadHandoffs = async () => {
    try {
      const response = await fetch('/api/handoffs/feed');
      const data = await response.json();
      
      if (data.ok) {
        const enriched: Handoff[] = data.data.map((h: DBHandoff) => ({
          ...h,
          fromEmoji: AGENT_EMOJI[h.from_agent] || '🤷',
          toEmoji: AGENT_EMOJI[h.to_agent] || '🤷',
          date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setHandoffs(enriched);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load handoffs:', err);
      setLoading(false);
    }
    setLastSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const loadNotes = async () => {
    try {
      const { data } = await supabase
        .from('lounge_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setNotes(data as Note[]);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  useEffect(() => {
    loadHandoffs();
    loadNotes();
    const timerHandoffs = setInterval(loadHandoffs, 60000);
    const timerNotes = setInterval(loadNotes, 60000);
    return () => {
      clearInterval(timerHandoffs);
      clearInterval(timerNotes);
    };
  }, []);

  // Filter handoffs
  const filteredHandoffs = filterStatus === 'ALL' 
    ? handoffs 
    : handoffs.filter(h => h.status === filterStatus);

  // Stats
  const openCount     = handoffs.filter(h => h.status === 'OPEN').length;
  const resolvedCount = handoffs.filter(h => h.status === 'RESOLVED').length;
  const blockedCount  = handoffs.filter(h => h.status === 'BLOCKED').length;

  return (
    <div style={{ background: '#0A0A0F', color: '#E8E8F0', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(200,169,110,0.08)', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 14, color: '#C8A96E', fontFamily: 'var(--font-playfair)' }}>Lounge.codes</Link>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ fontSize: 13, color: '#6B6B80' }}>Handoffs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#555' }}>
          <Link href="/lounge" style={{ textDecoration: 'none', color: '#555' }}>→ Lounge</Link>
          <Link href="/ops" style={{ textDecoration: 'none', color: '#555' }}>→ Ops Grid</Link>
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* Left — main content */}
        <div>

          {/* Hero */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', marginBottom: 8 }}>
              Handoffs — How the team passes work
            </div>
            <div style={{ fontSize: 14, color: '#6B6B80', lineHeight: 1.6, maxWidth: 600 }}>
              When one agent finishes a step or finds something that needs another agent's expertise, 
              they create a handoff file. These structured task files live in{' '}
              <code style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: '#C8A96E' }}>~/clawd/shared/handoffs/</code>{' '}
              and track ownership, status, and resolution across the team.
            </div>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>How it works</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <StepCard
                num="1"
                emoji="📄"
                title="Create"
                desc="Agent writes a .md file in shared/handoffs/sender-recipient/ with a topic and context. Filename encodes the date, topic, and status."
              />
              <StepCard
                num="2"
                emoji="👋"
                title="Pick up"
                desc="Recipient agent discovers the file during their next scan — or gets paged. They own it until it's done."
              />
              <StepCard
                num="3"
                emoji="✅"
                title="Resolve"
                desc="Status changes via rename: OPEN → RESOLVED (or BLOCKED if stuck). Resolved files are kept forever for audit."
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Open', count: openCount, color: '#FFD23F' },
              { label: 'Resolved', count: resolvedCount, color: '#00D97E' },
              { label: 'Blocked', count: blockedCount, color: '#FF4D4D' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 11, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              </div>
            ))}
            <div style={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 'auto',
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#C8A96E' }}>{handoffs.length}</span>
              <span style={{ fontSize: 11, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
            </div>
          </div>

          {/* Recent handoffs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent handoffs</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['OPEN', 'BLOCKED', 'RESOLVED', 'ALL'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: filterStatus === status ? '1px solid #C8A96E' : '1px solid rgba(255,255,255,0.1)',
                      background: filterStatus === status ? 'rgba(200,169,110,0.1)' : 'transparent',
                      color: filterStatus === status ? '#C8A96E' : '#555',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 12 }}>
                Loading handoffs...
              </div>
            ) : filteredHandoffs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 12, fontStyle: 'italic' }}>
                No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} handoffs
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                {filteredHandoffs.map(h => (
                  <HandoffCard
                    key={h.id}
                    h={h}
                    expanded={expandedId === h.id}
                    onToggle={() => setExpandedId(expandedId === h.id ? null : h.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right — Notes sidebar */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 4 }}>Live Notes</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>Latest drops from the team</div>

          {notes.length === 0 ? (
            <div style={{ fontSize: 12, color: '#444', fontStyle: 'italic', textAlign: 'center', padding: '24px 0', background: '#111118', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              No notes yet.
            </div>
          ) : (
            notes.map(note => <NoteBubble key={note.id} note={note} />)
          )}

          {/* Footer sync */}
          <div style={{ marginTop: 20, fontSize: 10, color: '#333', textAlign: 'center' }}>
            Synced {lastSync} · 60 s refresh
          </div>
        </div>

      </div>
    </div>
  );
}
