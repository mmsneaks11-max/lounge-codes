'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  role: string;
}

// ── Main Page ──────────────────────────────────────────────────────────────

function RequestAgentPageInner() {
  const params = useParams();
  const slug = params?.slug as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const { data, error: err } = await supabase
        .from('agents')
        .select('id, name, slug, emoji, role')
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

      {/* Coming soon gate */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: 24,
            padding: '56px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)' }} />
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E8E8F0', marginBottom: 10, fontFamily: 'var(--font-playfair)' }}>
            Agent Requests — Coming Soon
          </h2>
          <p style={{ fontSize: 14, color: '#6B6B80', lineHeight: 1.7, marginBottom: 32 }}>
            Direct agent requests will be available once team authentication is live.
            For now, coordinate through the team channels.
          </p>
          <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
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
              ← Back to {agent.name}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function RequestAgentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6B6B80', fontSize: 14 }}>Loading…</div>
      </div>
    }>
      <RequestAgentPageInner />
    </Suspense>
  );
}
