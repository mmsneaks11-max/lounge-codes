'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

interface AgentActivity {
  id: string;
  agent_id: string;
  type: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'online' ? '#4ade80' :
    status === 'idle'   ? '#facc15' :
    '#6B6B80';

  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        boxShadow: status === 'online' ? `0 0 8px ${color}` : 'none',
        flexShrink: 0,
      }}
    />
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return 'just now';
}

function activityIcon(type: string): string {
  const map: Record<string, string> = {
    task:      '⚡',
    message:   '💬',
    deploy:    '🚀',
    research:  '🔍',
    design:    '✨',
    review:    '👁',
    build:     '🔧',
    commit:    '📦',
    report:    '📋',
    meeting:   '🎙',
  };
  return map[type?.toLowerCase()] ?? '◆';
}

// ── Main Page ──────────────────────────────────────────────────────────────

function AgentProfilePageInner() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [agent, setAgent]       = useState<Agent | null>(null);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      // First: fetch agent by slug
      let foundAgent: Agent | null = null;
      const { data: agentData, error: agentErr } = await supabase
        .from('agents').select('*').eq('slug', slug).single();

      if (agentErr || !agentData) {
        // Fallback: try by id
        const { data: byId } = await supabase
          .from('agents').select('*').eq('id', slug).single() as { data: any };
        if (byId) {
          foundAgent = byId as Agent;
        } else {
          setNotFound(true);
          setLoading(false);
          return;
        }
      } else {
        foundAgent = agentData as Agent;
      }

      setAgent(foundAgent);

      // Then: fetch activity using the real UUID
      if (foundAgent?.id) {
        const { data: actData } = await supabase
          .from('agent_activity')
          .select('*')
          .eq('agent_id', foundAgent.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setActivity((actData as AgentActivity[]) ?? []);
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: '#6B6B80', fontSize: 14 }}
        >
          Loading agent…
        </motion.div>
      </div>
    );
  }

  if (notFound || !agent) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🤷</div>
        <div style={{ color: '#E8E8F0', fontSize: 18, fontWeight: 600 }}>Agent not found</div>
        <Link href="/agents" style={{ color: '#C8A96E', fontSize: 13 }}>← Back to Directory</Link>
      </div>
    );
  }

  const statusLabel = agent.status === 'online' ? 'Online' : agent.status === 'idle' ? 'Idle' : 'Offline';

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', paddingBottom: 80 }}>

      {/* Top nav */}
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(17,17,24,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/agents"
          style={{
            color: '#6B6B80',
            fontSize: 13,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Agent Directory
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>/</span>
        <span style={{ color: '#C8A96E', fontSize: 13, fontWeight: 500 }}>{agent.name}</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)',
              border: '1px solid rgba(200,169,110,0.2)',
              borderRadius: 24,
              padding: '40px',
              marginBottom: 24,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top shimmer line */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)',
              }}
            />
            {/* Ambient orb */}
            <div
              style={{
                position: 'absolute',
                top: -80, right: -80,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,169,110,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
              {/* Emoji */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  fontSize: 72,
                  lineHeight: 1,
                  width: 108,
                  height: 108,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(200,169,110,0.08)',
                  border: '1px solid rgba(200,169,110,0.2)',
                  borderRadius: 24,
                  flexShrink: 0,
                }}
              >
                {agent.emoji}
              </motion.div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#E8E8F0',
                      margin: 0,
                      fontFamily: 'var(--font-playfair)',
                    }}
                  >
                    {agent.name}
                  </h1>
                  {agent.featured && (
                    <span
                      style={{
                        fontSize: 11,
                        color: '#C8A96E',
                        background: 'rgba(200,169,110,0.1)',
                        border: '1px solid rgba(200,169,110,0.2)',
                        borderRadius: 4,
                        padding: '3px 10px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      ✦ Featured
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 15, color: '#C8A96E', marginBottom: 12, fontWeight: 500 }}>
                  {agent.role}
                </div>

                {/* Badges row */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      padding: '4px 10px',
                    }}
                  >
                    <StatusDot status={agent.status} />
                    <span style={{ fontSize: 12, color: '#E8E8F0' }}>{statusLabel}</span>
                  </div>

                  {/* Division */}
                  <span
                    style={{
                      fontSize: 12,
                      color: '#C8A96E',
                      background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.15)',
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontWeight: 500,
                    }}
                  >
                    {agent.division}
                  </span>

                  {/* Machine */}
                  <span
                    style={{
                      fontSize: 12,
                      padding: '4px 12px',
                      borderRadius: 8,
                      background: 'rgba(123,140,222,0.1)',
                      color: '#7B8CDE',
                      border: '1px solid rgba(123,140,222,0.2)',
                      fontFamily: 'var(--font-geist-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {agent.machine}
                  </span>

                  {agent.timezone && (
                    <span
                      style={{
                        fontSize: 12,
                        color: '#6B6B80',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        padding: '4px 12px',
                      }}
                    >
                      🕐 {agent.timezone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Bio */}
            {agent.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: '28px 28px',
                }}
              >
                <h2
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B6B80',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  About
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: '#E8E8F0',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {agent.bio}
                </p>
              </motion.div>
            )}

            {/* Skills */}
            {agent.skills && agent.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: '28px',
                }}
              >
                <h2
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B6B80',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                  }}
                >
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {agent.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        fontSize: 12,
                        padding: '5px 14px',
                        borderRadius: 20,
                        background: 'rgba(123,140,222,0.08)',
                        color: '#7B8CDE',
                        border: '1px solid rgba(123,140,222,0.2)',
                        cursor: 'default',
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '28px',
              }}
            >
              <h2
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6B6B80',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                Recent Activity
              </h2>

              {activity.length === 0 ? (
                <p style={{ color: '#6B6B80', fontSize: 13, fontStyle: 'italic' }}>No recent activity.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {activity.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                      style={{
                        display: 'flex',
                        gap: 14,
                        paddingBottom: i < activity.length - 1 ? 18 : 0,
                        marginBottom: i < activity.length - 1 ? 18 : 0,
                        borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Icon + line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {activityIcon(item.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: '#C8A96E',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              background: 'rgba(200,169,110,0.08)',
                              padding: '1px 6px',
                              borderRadius: 3,
                            }}
                          >
                            {item.type}
                          </span>
                          <span style={{ fontSize: 11, color: '#6B6B80' }}>{timeAgo(item.created_at)}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#E8E8F0', margin: 0, lineHeight: 1.5 }}>
                          {item.summary}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Request CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link href={`/agents/request/${agent.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,169,110,0.15) 0%, rgba(200,169,110,0.08) 100%)',
                    border: '1px solid rgba(200,169,110,0.3)',
                    borderRadius: 16,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.6), transparent)',
                    }}
                  />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#C8A96E',
                      marginBottom: 6,
                    }}
                  >
                    Request — Coming Soon
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6B80', lineHeight: 1.5 }}>
                    Direct agent requests launching soon
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Details card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6B6B80',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <DetailRow label="Division" value={agent.division} />
                <DetailRow label="Machine" value={agent.machine} mono />
                <DetailRow label="Status" value={statusLabel} />
                {agent.availability && typeof agent.availability === 'string' && <DetailRow label="Availability" value={agent.availability} />}
                {agent.availability && typeof agent.availability === 'object' && Object.keys(agent.availability).length > 0 && <DetailRow label="Availability" value={JSON.stringify(agent.availability)} />}
                {agent.timezone && <DetailRow label="Timezone" value={agent.timezone} />}
                {agent.manager && <DetailRow label="Manager" value={agent.manager} />}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#6B6B80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: '#E8E8F0',
          fontFamily: mono ? 'var(--font-geist-mono)' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AgentProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6B6B80', fontSize: 14 }}>Loading agent…</div>
      </div>
    }>
      <AgentProfilePageInner />
    </Suspense>
  );
}
