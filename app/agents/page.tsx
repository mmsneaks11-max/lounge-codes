'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  division: string;
  machine: string;
  role: string;
  skills: string[];
  status: string;
  bio: string;
  timezone: string;
  availability: string;
  profile_image: string | null;
  manager: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// ── Status dot ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'online'  ? '#4ade80' :
    status === 'idle'    ? '#facc15' :
    '#6B6B80';

  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: status === 'online' ? `0 0 6px ${color}` : 'none',
        flexShrink: 0,
      }}
    />
  );
}

// ── Machine badge ──────────────────────────────────────────────────────────

function MachineBadge({ machine }: { machine: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 7px',
        borderRadius: 4,
        background: 'rgba(123,140,222,0.12)',
        color: '#7B8CDE',
        border: '1px solid rgba(123,140,222,0.2)',
        fontFamily: 'var(--font-geist-mono)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {machine}
    </span>
  );
}

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered
              ? 'linear-gradient(135deg, #1A1A24 0%, #1e1e2e 100%)'
              : '#111118',
            border: `1px solid ${hovered ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 16,
            padding: '24px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,169,110,0.1)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle top glow on hover */}
          {hovered && (
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)',
              }}
            />
          )}

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                fontSize: 36,
                lineHeight: 1,
                width: 52,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              {agent.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <StatusDot status={agent.status} />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#E8E8F0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {agent.name}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#6B6B80',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {agent.role}
              </div>
            </div>
          </div>

          {/* Division + Machine */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                color: '#C8A96E',
                background: 'rgba(200,169,110,0.08)',
                border: '1px solid rgba(200,169,110,0.15)',
                borderRadius: 4,
                padding: '2px 8px',
                fontWeight: 500,
              }}
            >
              {agent.division}
            </span>
            <MachineBadge machine={agent.machine} />
          </div>

          {/* Skills */}
          {agent.skills && agent.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {agent.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#6B6B80',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {skill}
                </span>
              ))}
              {agent.skills.length > 4 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.03)',
                    color: '#6B6B80',
                  }}
                >
                  +{agent.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── Featured Carousel ──────────────────────────────────────────────────────

function FeaturedCarousel({ agents }: { agents: Agent[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (agents.length <= 1) return;
    const t = setInterval(() => setActive((p) => (p + 1) % agents.length), 4000);
    return () => clearInterval(t);
  }, [agents.length]);

  if (agents.length === 0) return null;

  const agent = agents[active];

  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
          ✦ Featured & Online
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,169,110,0.3), transparent)' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)',
                border: '1px solid rgba(200,169,110,0.2)',
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gold glow */}
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -60, right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Emoji */}
              <div
                style={{
                  fontSize: 56,
                  lineHeight: 1,
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(200,169,110,0.08)',
                  border: '1px solid rgba(200,169,110,0.15)',
                  borderRadius: 20,
                  flexShrink: 0,
                }}
              >
                {agent.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <StatusDot status={agent.status} />
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#E8E8F0' }}>{agent.name}</span>
                  {agent.featured && (
                    <span style={{ fontSize: 11, color: '#C8A96E', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 4, padding: '2px 8px' }}>
                      Featured
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: '#C8A96E', marginBottom: 6 }}>{agent.role}</div>
                <div style={{ fontSize: 13, color: '#6B6B80', marginBottom: 12, maxWidth: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {agent.bio}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#C8A96E', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 4, padding: '2px 10px' }}>
                    {agent.division}
                  </span>
                  <MachineBadge machine={agent.machine} />
                </div>
              </div>

              {/* Arrow */}
              <div style={{ color: '#C8A96E', fontSize: 20, flexShrink: 0 }}>→</div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {agents.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {agents.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === active ? '#C8A96E' : 'rgba(255,255,255,0.15)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [divisionFilter, setDivisionFilter] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('featured', { ascending: false })
        .order('name', { ascending: true });
      if (!error && data) setAgents(data as Agent[]);
      setLoading(false);
    }
    load();
  }, []);

  const divisions = useMemo(() => [...new Set(agents.map((a) => a.division).filter(Boolean))], [agents]);
  const machines  = useMemo(() => [...new Set(agents.map((a) => a.machine).filter(Boolean))], [agents]);

  const featured = useMemo(
    () => agents.filter((a) => a.featured && a.status === 'online'),
    [agents]
  );

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (divisionFilter && a.division !== divisionFilter) return false;
      if (machineFilter  && a.machine  !== machineFilter)  return false;
      if (statusFilter   && a.status   !== statusFilter)   return false;
      if (skillSearch) {
        const q = skillSearch.toLowerCase();
        const inSkills = a.skills?.some((s) => s.toLowerCase().includes(q));
        const inName   = a.name.toLowerCase().includes(q);
        const inRole   = a.role?.toLowerCase().includes(q);
        if (!inSkills && !inName && !inRole) return false;
      }
      return true;
    });
  }, [agents, divisionFilter, machineFilter, statusFilter, skillSearch]);

  const selectStyle: React.CSSProperties = {
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#E8E8F0',
    padding: '8px 12px',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        padding: '0 0 80px',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(17,17,24,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div>
          <Link href="/" style={{ textDecoration: 'none', color: '#6B6B80', fontSize: 13 }}>
            ← The Lounge
          </Link>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#E8E8F0',
              margin: '4px 0 0',
              fontFamily: 'var(--font-playfair)',
            }}
          >
            Agent Directory
          </h1>
          <p style={{ fontSize: 13, color: '#6B6B80', margin: '2px 0 0' }}>
            {agents.length} agents across the team
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Featured carousel */}
        {!loading && featured.length > 0 && <FeaturedCarousel agents={featured} />}

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 32,
            alignItems: 'center',
          }}
        >
          {/* Skill search */}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B6B80',
                fontSize: 14,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, role, or skill…"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              style={{
                ...selectStyle,
                width: '100%',
                paddingLeft: 36,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Division */}
          <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} style={selectStyle}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Machine */}
          <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)} style={selectStyle}>
            <option value="">All Machines</option>
            {machines.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Status */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>

          {/* Clear filters */}
          {(divisionFilter || machineFilter || statusFilter || skillSearch) && (
            <button
              onClick={() => { setDivisionFilter(''); setMachineFilter(''); setStatusFilter(''); setSkillSearch(''); }}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#6B6B80',
                fontSize: 12,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {(divisionFilter || machineFilter || statusFilter || skillSearch) && (
          <p style={{ fontSize: 12, color: '#6B6B80', marginBottom: 20 }}>
            Showing {filtered.length} of {agents.length} agents
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  height: 160,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            <AnimatePresence>
              {filtered.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B6B80' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No agents found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
