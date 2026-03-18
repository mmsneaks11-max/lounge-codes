'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

interface Handoff {
  id: string;
  from: string;
  to: string;
  fromEmoji: string;
  toEmoji: string;
  topic: string;
  status: 'OPEN' | 'RESOLVED' | 'BLOCKED';
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

// ── Static handoff data ────────────────────────────────────────────────────

const HANDOFFS: Handoff[] = [
  { id: '1', from: 'Clawd',    to: 'Dayta',   fromEmoji: '🐾', toEmoji: '🗄️', topic: 'Add Spoke to agents table',       status: 'RESOLVED', date: '2026-03-18' },
  { id: '2', from: 'Scout',    to: 'Lila',    fromEmoji: '🔍', toEmoji: '💖', topic: 'Messaging gaps — SEO title anxiety', status: 'OPEN',     date: '2026-03-18' },
  { id: '3', from: 'Clawd',    to: 'Indy',    fromEmoji: '🐾', toEmoji: '🎒', topic: 'March Madness card alert',        status: 'OPEN',     date: '2026-03-18' },
  { id: '4', from: 'Ripley',   to: 'Clawd',   fromEmoji: '👂', toEmoji: '🐾', topic: 'Reddit browser failure',          status: 'RESOLVED', date: '2026-03-18' },
  { id: '5', from: 'Kay',      to: 'Clawd',   fromEmoji: '📎', toEmoji: '🐾', topic: 'Dashboard eBay gate friction',    status: 'RESOLVED', date: '2026-03-18' },
  { id: '6', from: 'Scout',    to: 'Clawd',   fromEmoji: '🔍', toEmoji: '🐾', topic: 'Cross-delisting research',        status: 'OPEN',     date: '2026-03-18' },
  { id: '7', from: 'Clawd',    to: 'Chip',    fromEmoji: '🐾', toEmoji: '🐿️', topic: 'Railway token',                   status: 'RESOLVED', date: '2026-03-18' },
  { id: '8', from: 'Pixel',    to: 'Clawd',   fromEmoji: '✨', toEmoji: '🐾', topic: 'AgentDeck visual feedback',       status: 'RESOLVED', date: '2026-03-15' },
];

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

function HandoffCard({ h }: { h: Handoff }) {
  const color = STATUS_COLOR[h.status];
  const bg = STATUS_BG[h.status];

  return (
    <div style={{
      background: '#111118',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `2px solid ${color}`,
      borderRadius: 10,
      padding: '14px 16px',
      transition: 'background 0.15s',
    }}>
      {/* Agents row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{h.fromEmoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E8F0' }}>{h.from}</span>
        <span style={{ fontSize: 10, color: '#555' }}>→</span>
        <span style={{ fontSize: 18 }}>{h.toEmoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E8F0' }}>{h.to}</span>
        <span style={{ marginLeft: 'auto' }}>
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
        </span>
      </div>

      {/* Topic */}
      <div style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.5, marginBottom: 8 }}>{h.topic}</div>

      {/* Date */}
      <div style={{ fontSize: 10, color: '#444' }}>{h.date}</div>
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSync, setLastSync] = useState('–');

  // Stats from static data
  const openCount     = HANDOFFS.filter(h => h.status === 'OPEN').length;
  const resolvedCount = HANDOFFS.filter(h => h.status === 'RESOLVED').length;
  const blockedCount  = HANDOFFS.filter(h => h.status === 'BLOCKED').length;

  const loadNotes = async () => {
    const { data } = await supabase
      .from('lounge_notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setNotes(data as Note[]);
    setLastSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    loadNotes();
    const timer = setInterval(loadNotes, 60000);
    return () => clearInterval(timer);
  }, []);

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
              <span style={{ fontSize: 22, fontWeight: 700, color: '#C8A96E' }}>{HANDOFFS.length}</span>
              <span style={{ fontSize: 11, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
            </div>
          </div>

          {/* Recent handoffs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Recent handoffs</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
              {HANDOFFS.map(h => <HandoffCard key={h.id} h={h} />)}
            </div>
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
