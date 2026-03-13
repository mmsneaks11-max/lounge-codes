'use client';

import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  availability: string;
}

type Urgency = 'low' | 'normal' | 'high' | 'critical';

// ── Urgency config ─────────────────────────────────────────────────────────

const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string; border: string; dot: string }> = {
  low:      { label: 'Low',      color: '#6B6B80', bg: 'rgba(107,107,128,0.08)', border: 'rgba(107,107,128,0.2)', dot: '#6B6B80' },
  normal:   { label: 'Normal',   color: '#7B8CDE', bg: 'rgba(123,140,222,0.08)', border: 'rgba(123,140,222,0.2)', dot: '#7B8CDE' },
  high:     { label: 'High',     color: '#C8A96E', bg: 'rgba(200,169,110,0.08)', border: 'rgba(200,169,110,0.2)', dot: '#C8A96E' },
  critical: { label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', dot: '#f87171' },
};

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RequestAgentPage() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [agent, setAgent]     = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [requester, setRequester]           = useState('');
  const [requestText, setRequestText]       = useState('');
  const [urgency, setUrgency]               = useState<Urgency>('normal');
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const { data, error: err } = await supabase
        .from('agents')
        .select('id, name, slug, emoji, division, machine, role, skills, status, availability')
        .eq('slug', slug)
        .single();

      if (err || !data) {
        setNotFound(true);
      } else {
        setAgent(data as Agent);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agent) return;
    if (!requester.trim()) { setError('Please enter your name.'); return; }
    if (!requestText.trim()) { setError('Please describe the task.'); return; }
    setError(null);
    setSubmitting(true);

    const { error: insertErr } = await supabase
      .from('agent_requests')
      .insert({
        agent_id:     agent.id,
        requester:    requester.trim(),
        request_text: requestText.trim(),
        urgency,
        status:       'pending',
      } as any);

    setSubmitting(false);
    if (insertErr) {
      setError(insertErr.message || 'Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: '#6B6B80', fontSize: 14 }}
        >
          Loading…
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

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', paddingBottom: 80 }}>

      {/* Nav */}
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(17,17,24,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href={`/agents/${agent.slug}`} style={{ color: '#6B6B80', fontSize: 13, textDecoration: 'none' }}>
          ← {agent.name}
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>/</span>
        <span style={{ color: '#C8A96E', fontSize: 13, fontWeight: 500 }}>Request</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>

        {/* Agent mini-header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
              fontSize: 44,
              width: 68,
              height: 68,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(200,169,110,0.08)',
              border: '1px solid rgba(200,169,110,0.15)',
              borderRadius: 16,
              flexShrink: 0,
            }}
          >
            {agent.emoji}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 3, fontFamily: 'var(--font-playfair)' }}>
              Request {agent.name}
            </div>
            <div style={{ fontSize: 13, color: '#C8A96E' }}>{agent.role}</div>
            <div style={{ fontSize: 12, color: '#6B6B80', marginTop: 4 }}>
              {agent.division} · {agent.machine}
              {agent.availability && ` · ${agent.availability}`}
            </div>
          </div>
        </motion.div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, #111118 100%)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 20,
                padding: '56px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.4), transparent)',
                }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ fontSize: 56, marginBottom: 20 }}
              >
                ✅
              </motion.div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#E8E8F0',
                  marginBottom: 10,
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                Request sent!
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B80', lineHeight: 1.6, marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
                Your request has been delivered to <strong style={{ color: '#E8E8F0' }}>{agent.name}</strong>.
                They&apos;ll review it and get back to you shortly.
              </p>

              {/* Urgency pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: urgencyConfig[urgency].bg,
                  border: `1px solid ${urgencyConfig[urgency].border}`,
                  borderRadius: 20,
                  padding: '6px 16px',
                  marginBottom: 36,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: urgencyConfig[urgency].dot,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 12, color: urgencyConfig[urgency].color, fontWeight: 500 }}>
                  {urgencyConfig[urgency].label} urgency
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#E8E8F0',
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '10px 22px',
                      cursor: 'pointer',
                    }}
                  >
                    ← Back to {agent.name}
                  </motion.button>
                </Link>
                <Link href="/agents" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'rgba(200,169,110,0.12)',
                      border: '1px solid rgba(200,169,110,0.25)',
                      borderRadius: 10,
                      color: '#C8A96E',
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '10px 22px',
                      cursor: 'pointer',
                    }}
                  >
                    Agent Directory
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSubmit} noValidate>
                <div
                  style={{
                    background: '#111118',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                  }}
                >
                  {/* Name field */}
                  <FormField label="Your Name" required>
                    <input
                      type="text"
                      value={requester}
                      onChange={(e) => setRequester(e.target.value)}
                      placeholder="e.g. Kreez"
                      style={inputStyle}
                      required
                    />
                  </FormField>

                  {/* Task description */}
                  <FormField label="Task Description" required>
                    <textarea
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      placeholder={`Describe what you need from ${agent.name}…`}
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
                      required
                    />
                  </FormField>

                  {/* Urgency */}
                  <FormField label="Urgency">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {(Object.keys(urgencyConfig) as Urgency[]).map((u) => {
                        const cfg = urgencyConfig[u];
                        const isActive = urgency === u;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setUrgency(u)}
                            style={{
                              background: isActive ? cfg.bg : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isActive ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                              borderRadius: 10,
                              padding: '10px 8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: isActive ? cfg.dot : '#6B6B80',
                                margin: '0 auto 6px',
                                boxShadow: isActive ? `0 0 6px ${cfg.dot}` : 'none',
                                transition: 'all 0.2s ease',
                              }}
                            />
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: isActive ? cfg.color : '#6B6B80',
                                transition: 'color 0.2s ease',
                              }}
                            >
                              {cfg.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormField>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontSize: 13,
                        color: '#f87171',
                      }}
                    >
                      ⚠ {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : undefined}
                    whileTap={!submitting ? { scale: 0.98 } : undefined}
                    style={{
                      background: submitting
                        ? 'rgba(200,169,110,0.08)'
                        : 'linear-gradient(135deg, rgba(200,169,110,0.2) 0%, rgba(200,169,110,0.1) 100%)',
                      border: '1px solid rgba(200,169,110,0.3)',
                      borderRadius: 12,
                      color: '#C8A96E',
                      fontSize: 15,
                      fontWeight: 600,
                      padding: '14px 24px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {!submitting && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0,
                          height: 1,
                          background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)',
                        }}
                      />
                    )}
                    {submitting ? 'Sending…' : `📨 Send Request to ${agent.name}`}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Form Field wrapper ─────────────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: '#6B6B80',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {label}
        {required && <span style={{ color: '#C8A96E', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Shared input style ─────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A0A0F',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#E8E8F0',
  fontSize: 14,
  padding: '12px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-geist-sans)',
  transition: 'border-color 0.2s ease',
};
