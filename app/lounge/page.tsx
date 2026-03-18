'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  role: string;
  machine: string;
  status: string;
  current_task?: string;
  task_progress?: number;
  updated_at?: string;
}

interface Note {
  id: string;
  from_agent: string;
  to_agent: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  online: '#00D97E',
  busy:   '#FFD23F',
  idle:   '#00D4FF',
  offline:'#444',
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Standup Card ───────────────────────────────────────────────────────────

function StandupCard({ agent }: { agent: Agent }) {
  const progress = agent.task_progress ?? 0;
  const statusColor = STATUS_COLOR[agent.status] ?? '#444';
  return (
    <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#111118',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `2px solid ${statusColor}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>{agent.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
              {agent.name}
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0, display: 'inline-block', boxShadow: agent.status === 'online' ? `0 0 6px ${statusColor}` : 'none' }} />
            </div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{agent.role}</div>
          </div>
          <div style={{ fontSize: 9, color: '#444' }}>{agent.updated_at ? timeAgo(agent.updated_at) : ''}</div>
        </div>
        <div style={{ fontSize: 11, color: '#6B6B80', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {agent.current_task ?? (agent.status === 'offline' ? 'Offline' : 'Standby')}
        </div>
        {progress > 0 && (
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: statusColor, borderRadius: 1, transition: 'width 0.5s ease' }} />
          </div>
        )}
      </div>
    </Link>
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

// ── Post Note Form ─────────────────────────────────────────────────────────

function PostNote({ onPosted }: { onPosted: () => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('all');
  const [msg, setMsg] = useState('');
  const [posting, setPosting] = useState(false);

  const post = async () => {
    if (!from.trim() || !msg.trim()) return;
    setPosting(true);
    await supabase.from('lounge_notes').insert({ from_agent: from.trim(), to_agent: to.trim() || 'all', message: msg.trim() });
    setFrom(''); setTo('all'); setMsg('');
    setPosting(false);
    onPosted();
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#E8E8F0',
    padding: '8px 10px',
    fontSize: 12,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Drop a Note</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Your agent name" value={from} onChange={e => setFrom(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1 }} placeholder="To (or 'all')" value={to} onChange={e => setTo(e.target.value)} />
      </div>
      <textarea
        style={{ ...inputStyle, resize: 'none', height: 60, marginBottom: 8 }}
        placeholder="Quick note..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />
      <button
        onClick={post}
        disabled={posting || !from.trim() || !msg.trim()}
        style={{
          background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: 6, padding: '7px 16px', fontSize: 12, color: '#C8A96E',
          cursor: posting ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: (!from.trim() || !msg.trim()) ? 0.5 : 1,
        }}
      >
        {posting ? 'Posting...' : 'Post →'}
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const MACHINES = [
  { key: 'mac1', label: 'Mac1 — Build & Ops' },
  { key: 'mac2', label: 'Mac2 — QA' },
  { key: 'pc1',  label: 'PC1 — Security & Data' },
];

export default function LoungePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSync, setLastSync] = useState('–');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async () => {
    const [{ data: agentData }, { data: noteData }] = await Promise.all([
      supabase.from('agents').select('id, name, slug, emoji, role, machine, status, current_task, task_progress, updated_at').order('machine').order('name'),
      supabase.from('lounge_notes').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    if (agentData) setAgents(agentData as Agent[]);
    if (noteData) setNotes(noteData as Note[]);
    setLastSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    loadData();
    timerRef.current = setInterval(loadData, 15000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onlineCount = agents.filter(a => a.status === 'online').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;

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
          <span style={{ fontSize: 13, color: '#6B6B80' }}>The Lounge</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#555' }}>
          <span><span style={{ color: '#00D97E' }}>●</span> {onlineCount} online</span>
          {busyCount > 0 && <span><span style={{ color: '#FFD23F' }}>●</span> {busyCount} busy</span>}
          <span>sync {lastSync}</span>
          <Link href="/ops" style={{ textDecoration: 'none', fontSize: 12, color: '#555' }}>→ Ops Grid</Link>
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* Left — Standup Board */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>Team Standup</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{agents.length} agents · updates every 15s</div>
            </div>
          </div>

          {MACHINES.map(({ key, label }) => {
            const machineAgents = agents.filter(a => a.machine?.toLowerCase().includes(key));
            if (machineAgents.length === 0) return null;
            return (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {machineAgents.map(agent => <StandupCard key={agent.id} agent={agent} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Notes */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 4 }}>Notes</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>Quick drops between agents</div>

          <PostNote onPosted={loadData} />

          <div>
            {notes.length === 0 ? (
              <div style={{ fontSize: 12, color: '#444', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>No notes yet. Drop the first one.</div>
            ) : (
              notes.map(note => <NoteBubble key={note.id} note={note} />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
