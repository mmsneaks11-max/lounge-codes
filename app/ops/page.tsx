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
  online:  '#00D97E',
  busy:    '#FFD23F',
  idle:    '#00D4FF',
  offline: '#444',
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatusDot({ status, glow }: { status: string; glow?: boolean }) {
  const color = STATUS_COLOR[status] ?? '#444';
  return (
    <span style={{
      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
      background: color,
      display: 'inline-block',
      boxShadow: glow && status === 'online' ? `0 0 6px ${color}` : 'none',
    }} />
  );
}

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const progress = agent.task_progress ?? 0;
  const statusColor = STATUS_COLOR[agent.status] ?? '#444';

  return (
    <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `2px solid ${statusColor}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        minHeight: 90,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            {agent.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
              {agent.name}
              <StatusDot status={agent.status} glow />
            </div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.role}</div>
          </div>
          <div style={{ fontSize: 9, color: '#444', flexShrink: 0 }}>
            {agent.updated_at ? timeAgo(agent.updated_at) : ''}
          </div>
        </div>
        <div style={{
          fontSize: 11, color: '#6B6B80', marginBottom: 8,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {agent.current_task ?? (agent.status === 'offline' ? 'Offline' : 'Standby')}
        </div>
        {progress > 0 && (
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`, background: statusColor,
              borderRadius: 1, transition: 'width 0.5s ease',
            }} />
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

// ── Machine Section ────────────────────────────────────────────────────────

function MachineSection({ label, sublabel, agents, icon }: {
  label: string;
  sublabel: string;
  agents: Agent[];
  icon: string;
}) {
  if (agents.length === 0) return null;

  const onlineCount = agents.filter(a => a.status === 'online').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#C8A96E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </div>
            <div style={{ fontSize: 10, color: '#555' }}>{sublabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: '#555' }}>
          <span><span style={{ color: '#00D97E' }}>●</span> {onlineCount}</span>
          {busyCount > 0 && <span><span style={{ color: '#FFD23F' }}>●</span> {busyCount}</span>}
          <span>{agents.length} total</span>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: agents.length <= 3
          ? `repeat(${agents.length}, 1fr)`
          : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 8,
      }}>
        {agents.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
}

// ── Stats Pill ─────────────────────────────────────────────────────────────

function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
      padding: '8px 14px',
    }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const MACHINES = [
  { key: 'mac1', label: 'Mac1', sublabel: 'Build & Ops', icon: '🖥' },
  { key: 'mac2', label: 'Mac2', sublabel: 'QA & Monitoring', icon: '🔬' },
  { key: 'pc1',  label: 'PC1',  sublabel: 'Security & Data', icon: '🛡' },
];

export default function OpsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSync, setLastSync] = useState('–');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async () => {
    const [{ data: agentData }, { data: noteData }] = await Promise.all([
      supabase
        .from('agents')
        .select('id, name, slug, emoji, role, machine, status, current_task, task_progress, updated_at')
        .order('machine')
        .order('name'),
      supabase
        .from('lounge_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15),
    ]);
    if (agentData) setAgents(agentData as Agent[]);
    if (noteData) setNotes(noteData as Note[]);
    setLastSync(
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    );
  };

  useEffect(() => {
    loadData();
    timerRef.current = setInterval(loadData, 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Stats
  const onlineCount  = agents.filter(a => a.status === 'online').length;
  const busyCount    = agents.filter(a => a.status === 'busy').length;
  const idleCount    = agents.filter(a => a.status === 'idle').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  // Machine groupings
  const mac1Agents = agents.filter(a => a.machine?.toLowerCase().includes('mac1'));
  const mac2Agents = agents.filter(a => a.machine?.toLowerCase().includes('mac2'));
  const pc1Agents  = agents.filter(a => a.machine?.toLowerCase().includes('pc1'));

  return (
    <div style={{
      background: '#0A0A0F', color: '#E8E8F0',
      fontFamily: "'Inter', -apple-system, sans-serif",
      minHeight: '100vh',
    }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid rgba(200,169,110,0.08)',
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 14, color: '#C8A96E', fontFamily: 'var(--font-playfair)' }}>
            Lounge.codes
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ fontSize: 13, color: '#E8E8F0' }}>Operations Grid</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            ['Overview', '/lounge'],
            ['Ops', '/ops'],
            ['Handoffs', '/handoffs'],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                color: label === 'Ops' ? '#C8A96E' : '#6B6B80',
                background: label === 'Ops' ? 'rgba(200,169,110,0.1)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#555' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D97E', display: 'inline-block' }} />
            {onlineCount} online
          </span>
          {busyCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD23F', display: 'inline-block' }} />
              {busyCount} busy
            </span>
          )}
          <span>sync {lastSync}</span>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 'calc(100vh - 52px)' }}>

        {/* Left: Agent Grid */}
        <div style={{ padding: '24px 28px', overflowY: 'auto' }}>

          {/* Stats Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#E8E8F0' }}>Operations Grid</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                {agents.length} agents · 3 machines · refreshes every 30s · last sync {lastSync}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <StatPill value={agents.length.toString()} label="Total" color="#E8E8F0" />
              <StatPill value={onlineCount.toString()} label="Online" color="#00D97E" />
              <StatPill value={busyCount.toString()} label="Busy" color="#FFD23F" />
              <StatPill value={idleCount.toString()} label="Idle" color="#00D4FF" />
              <StatPill value={offlineCount.toString()} label="Offline" color="#555" />
            </div>
          </div>

          {/* Loading state */}
          {agents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#444', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
              Loading agent data from Supabase…
            </div>
          ) : (
            <>
              {/* Mac1 */}
              <MachineSection
                label="Mac1"
                sublabel="Build & Ops"
                agents={mac1Agents}
                icon="🖥"
              />

              {/* Mac2 + PC1 side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <MachineSection
                  label="Mac2"
                  sublabel="QA & Monitoring"
                  agents={mac2Agents}
                  icon="🔬"
                />
                <MachineSection
                  label="PC1"
                  sublabel="Security & Data"
                  agents={pc1Agents}
                  icon="🛡"
                />
              </div>
            </>
          )}
        </div>

        {/* ── Right: Activity Feed ────────────────────────────────────────── */}
        <div style={{
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 18px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 52px)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#C8A96E',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 4,
          }}>
            Activity Feed
          </div>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 16 }}>
            Recent agent-to-agent notes
          </div>

          {notes.length === 0 ? (
            <div style={{
              fontSize: 12, color: '#444', fontStyle: 'italic',
              textAlign: 'center', padding: '32px 0',
            }}>
              No notes yet.
            </div>
          ) : (
            notes.map(note => <NoteBubble key={note.id} note={note} />)
          )}

          {/* Quick legend */}
          <div style={{
            marginTop: 20, padding: '14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Status Legend
            </div>
            {[
              ['online', '#00D97E', 'Active & working'],
              ['busy', '#FFD23F', 'Heads-down on task'],
              ['idle', '#00D4FF', 'Connected, not active'],
              ['offline', '#444', 'Not reachable'],
            ].map(([status, color, desc]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: '#888' }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* Machine IPs */}
          <div style={{
            marginTop: 12, padding: '14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Machines
            </div>
            {[
              ['Mac1', '100.109.230.90', `${mac1Agents.length} agents`],
              ['Mac2', '100.85.255.5', `${mac2Agents.length} agents`],
              ['PC1', '100.79.148.78', `${pc1Agents.length} agents`],
            ].map(([name, ip, count]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 11 }}>
                <span style={{ color: '#888' }}>{name}</span>
                <span style={{ color: '#444', fontSize: 10 }}>{ip} · {count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
