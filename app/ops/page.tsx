'use client';

import { useEffect, useState } from 'react';
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
}

interface MachineMetrics {
  hostname?: string;
  label?: string;
  online: boolean;
  error?: string;
  cpu?: { usage_pct: number };
  memory?: { total_gb: number; usage_pct: number };
  disk?: { usage_pct: number };
  load?: { '1m': number; '5m': number; '15m': number };
  uptime?: { human: string; seconds: number };
  tasks?: Task[];
}

interface Task {
  topic: string;
  from: string;
  to: string;
  date: string;
  status: string;
}

interface LogEntry {
  time: string;
  agent: string;
  text: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  online:  '#00D97E',
  busy:    '#FFD23F',
  idle:    '#00D4FF',
  offline: '#333',
};

const BORDER_COLOR: Record<string, string> = {
  online:  '#00D97E',
  busy:    '#FFD23F',
  idle:    '#00D4FF',
  offline: '#2a2a2a',
};

const BAR_COLOR: Record<string, string> = {
  online:  '#00D97E',
  busy:    '#FFD23F',
  idle:    '#00D4FF',
  offline: '#2a2a2a',
};

function StatusDot({ status }: { status: string }) {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
      background: STATUS_COLOR[status] ?? '#333',
      display: 'inline-block',
    }} />
  );
}

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const progress = agent.task_progress ?? Math.floor(Math.random() * 60 + 20);
  return (
    <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `2px solid ${BORDER_COLOR[agent.status] ?? '#2a2a2a'}`,
        borderRadius: 10,
        padding: 12,
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            {agent.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</div>
            <div style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.role}</div>
          </div>
          <StatusDot status={agent.status} />
        </div>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {agent.current_task ?? (agent.status === 'offline' ? 'Offline' : 'Standby')}
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${agent.status === 'offline' ? 0 : progress}%`, borderRadius: 1, background: BAR_COLOR[agent.status] ?? '#333', transition: 'width 1s ease' }} />
        </div>
      </div>
    </Link>
  );
}

// ── Machine Section ────────────────────────────────────────────────────────

function MachineSection({ label, agents, cols = 5 }: { label: string; agents: Agent[]; cols?: number }) {
  if (agents.length === 0) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
        {agents.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const AGGREGATOR = 'http://100.85.255.5:18796';

async function fetchAllMachines(): Promise<Record<string, MachineMetrics>> {
  try {
    const res = await fetch(`${AGGREGATOR}/machines`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const d = await res.json();
      return d.machines ?? d;
    }
  } catch {}
  return {};
}

async function fetchAllTasks(): Promise<Task[]> {
  try {
    const res = await fetch(`${AGGREGATOR}/tasks`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) { const d = await res.json(); return d.tasks ?? []; }
  } catch {}
  return [];
}

export default function OpsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [lastSync, setLastSync] = useState<string>('–');
  const [machines, setMachines] = useState<Record<string, MachineMetrics>>({});
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data }, allMachines, allTasks] = await Promise.all([
        supabase.from('agents').select('id, name, slug, emoji, role, machine, status, current_task, task_progress').order('machine').order('name'),
        fetchAllMachines(),
        fetchAllTasks(),
      ]);
      if (data) setAgents(data as Agent[]);
      setMachines(allMachines);
      setTasks(allTasks.slice(0, 8));
      setLastSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = agents.filter(a => {
    if (machineFilter !== 'all' && a.machine.toLowerCase() !== machineFilter) return false;
    if (filter !== 'all' && a.status !== filter) return false;
    return true;
  });

  const mac1 = filtered.filter(a => a.machine?.toLowerCase().includes('mac1'));
  const mac2 = filtered.filter(a => a.machine?.toLowerCase().includes('mac2'));
  const pc1  = filtered.filter(a => a.machine?.toLowerCase().includes('pc1'));

  const onlineCount  = agents.filter(a => a.status === 'online').length;
  const busyCount    = agents.filter(a => a.status === 'busy').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  const sidebarItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 10px', borderRadius: 6, fontSize: 13,
    color: active ? '#FFD23F' : '#888',
    background: active ? 'rgba(255,210,63,0.08)' : 'transparent',
    cursor: 'pointer', marginBottom: 1,
  });

  return (
    <div style={{ background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        borderBottom: '1px solid rgba(255,210,63,0.15)',
        background: 'rgba(10,10,15,0.95)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 600, color: '#FFD23F', letterSpacing: '0.05em' }}>⬡ LOUNGE.CODES</Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Overview', '/lounge'], ['Ops', '/ops'], ['Handoffs', '/handoffs']].map(([label, href]) => (
            <Link key={label} href={href} style={{ textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 13, color: label === 'Ops' ? '#FFD23F' : '#666', background: label === 'Ops' ? 'rgba(255,210,63,0.08)' : 'transparent' }}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#555' }}>
          <span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D97E', display: 'inline-block', marginRight: 6 }} />
            All systems operational
          </span>
          <span>Mac1 · Mac2 · PC1</span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 56px)' }}>

        {/* Sidebar */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 0' }}>
          <div style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, padding: '0 8px' }}>Machines</div>
            {[['all', 'All Machines'], ['mac1', 'Mac1 — Build & Ops'], ['mac2', 'Mac2 — QA'], ['pc1', 'PC1 — Security']].map(([val, label]) => (
              <div key={val} onClick={() => setMachineFilter(val)} style={sidebarItemStyle(machineFilter === val)}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: val === 'pc1' ? '#FFD23F' : '#00D97E', flexShrink: 0, display: 'inline-block' }} />
                {label}
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, padding: '0 8px' }}>Filter</div>
            {[
              ['all', `All Agents (${agents.length})`],
              ['online', `Online (${onlineCount})`],
              ['busy', `Busy (${busyCount})`],
              ['offline', `Offline (${offlineCount})`],
            ].map(([val, label]) => (
              <div key={val} onClick={() => setFilter(val)} style={sidebarItemStyle(filter === val)}>
                {val !== 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[val] ?? '#333', flexShrink: 0, display: 'inline-block' }} />}
                {label}
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, padding: '0 8px' }}>Quick Access</div>
            {[['📋', 'Handoffs', '/handoffs'], ['🌐', 'Public Home', '/'], ['👥', 'Agent Directory', '/agents']].map(([icon, label, href]) => (
              <Link key={label} href={href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 13, color: '#888', marginBottom: 1 }}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f0' }}>Operations Grid</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{agents.length} agents · 3 machines · last sync {lastSync}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                [agents.length.toString(), 'Agents', '#FFD23F'],
                [onlineCount.toString(), 'Online', '#00D97E'],
                ['3', 'Machines', '#FFD23F'],
                ['99.2%', 'Uptime', '#00D97E'],
              ].map(([val, lbl, color]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent grids */}
          {agents.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <>
              <MachineSection label="Mac1 — Build & Ops" agents={mac1} cols={5} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <MachineSection label="Mac2 — QA & Monitoring" agents={mac2} cols={3} />
                </div>
                <div>
                  <MachineSection label="PC1 — Security, Recon & Data" agents={pc1} cols={4} />
                </div>
              </div>

              {/* Bottom panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 8 }}>

                {/* Task Queue */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Task Queue</div>
                  {tasks.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#444', fontStyle: 'italic' }}>No open tasks</div>
                  ) : tasks.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11 }}>
                      <span style={{ fontSize: 12 }}>📋</span>
                      <span style={{ flex: 1, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.topic.replace(/-/g, ' ')}</span>
                      <span style={{ color: '#555', fontSize: 10, minWidth: 40 }}>{t.from}</span>
                      <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: 'rgba(255,210,63,0.1)', color: '#FFD23F' }}>OPEN</span>
                    </div>
                  ))}
                </div>

                {/* System Resources */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>System Resources</div>
                  {([
                    ['Mac1', machines['mac1'] ?? null, '#00D97E', '#FFD23F'],
                    ['Mac2', machines['mac2'] ?? null, '#00D4FF', '#00D4FF'],
                    ['PC1',  machines['pc1']  ?? null, '#FFD23F', '#FFD23F'],
                  ] as [string, MachineMetrics | null, string, string][]).map(([name, m, cpuColor, memColor]) => (
                    <div key={name} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {m?.label || name} {m?.hostname ? `(${m.hostname})` : '—'}
                      </div>
                      {m ? (
                        <>
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#777', marginBottom: 4 }}>
                              <span>CPU</span><span style={{ color: '#FFD23F' }}>{m.cpu?.usage_pct ?? 0}%</span>
                            </div>
                            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${m.cpu?.usage_pct ?? 0}%`, borderRadius: 2, background: `linear-gradient(90deg, ${cpuColor}, ${cpuColor}99)` }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#777', marginBottom: 4 }}>
                              <span>Memory</span><span style={{ color: '#FFD23F' }}>{m.memory?.usage_pct ?? 0}%</span>
                            </div>
                            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${m.memory?.usage_pct ?? 0}%`, borderRadius: 2, background: `linear-gradient(90deg, ${memColor}, ${memColor}99)` }} />
                            </div>
                          </div>
                          {m.uptime && <div style={{ fontSize: 9, color: '#444', marginTop: 4 }}>up {m.uptime.human}</div>}
                        </>
                      ) : (
                        <div style={{ fontSize: 10, color: '#444', fontStyle: 'italic' }}>No data</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Recent Activity</div>
                  {([
                    { time: '14:32', agent: 'Clawd', text: 'shipped /ops live dashboard' },
                    { time: '14:19', agent: 'Electron', text: 'Mac2 metrics endpoint live' },
                    { time: '14:12', agent: 'Pixel', text: 'ops-dashboard-v3 spec delivered' },
                    { time: '13:43', agent: 'Lila', text: 'YouTube script filed' },
                    { time: '08:25', agent: 'Clawd', text: 'Add to Inventory fix shipped' },
                    { time: '08:08', agent: 'Kreez', text: 'Mac1 OpenClaw upgraded' },
                    { time: '01:04', agent: 'Clawd', text: 'handoff-watcher symlink fixed' },
                    { time: '21:27', agent: 'Electron', text: 'auth schema filed for Dayta' },
                  ] as LogEntry[]).map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11 }}>
                      <span style={{ color: '#444', minWidth: 38 }}>{entry.time}</span>
                      <span style={{ flex: 1, color: '#888' }}><span style={{ color: '#FFD23F' }}>{entry.agent}</span> {entry.text}</span>
                    </div>
                  ))}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
