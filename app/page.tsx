'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AmbientParticles = dynamic(() => import('@/components/AmbientParticles'), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  role: string;
  division: string;
  machine: string;
  status: string;
  featured: boolean;
}

// ── Agent Preview Card ─────────────────────────────────────────────────────

function AgentPreviewCard({ agent }: { agent: Agent }) {
  const [hovered, setHovered] = useState(false);
  const statusColor =
    agent.status === 'online' ? '#4ade80' :
    agent.status === 'idle'   ? '#facc15' : '#6B6B80';

  return (
    <Link href={`/agents/${agent.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#1A1A24' : '#111118',
          border: `1px solid ${hovered ? 'rgba(200,169,110,0.25)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 12,
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 28,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {agent.emoji}
          <span
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              border: '2px solid #111118',
              boxShadow: agent.status === 'online' ? `0 0 6px ${statusColor}` : 'none',
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', marginBottom: 2 }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: '#6B6B80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.role}</div>
        </div>
      </div>
    </Link>
  );
}

// ── Pricing Card ───────────────────────────────────────────────────────────

function PricingCard({
  tier, price, description, features, primary, cta
}: {
  tier: string;
  price: string;
  description: string;
  features: string[];
  primary?: boolean;
  cta: string;
}) {
  return (
    <div
      style={{
        background: primary ? 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)' : '#111118',
        border: `1px solid ${primary ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '32px 28px',
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
      }}
    >
      {primary && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.6), transparent)',
          }} />
          <div style={{
            position: 'absolute', top: 12, right: 16,
            background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)',
            borderRadius: 4, padding: '2px 10px', fontSize: 10, color: '#C8A96E', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Most Popular
          </div>
        </>
      )}
      <div style={{ fontSize: 13, color: '#C8A96E', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{tier}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>{price}</div>
      <div style={{ fontSize: 13, color: '#6B6B80', marginBottom: 24, minHeight: 36 }}>{description}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#A0A0B0' }}>
            <span style={{ color: '#C8A96E', flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href="/agents/request" style={{ textDecoration: 'none' }}>
        <div style={{
          background: primary ? 'rgba(200,169,110,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${primary ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 8, padding: '12px 20px', textAlign: 'center',
          fontSize: 14, color: primary ? '#C8A96E' : '#6B6B80',
          cursor: 'pointer', fontWeight: 500,
          transition: 'all 0.2s ease',
        }}>
          {cta}
        </div>
      </Link>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PublicHome() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    supabase
      .from('agents')
      .select('id, name, slug, emoji, role, division, machine, status, featured')
      .order('featured', { ascending: false })
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setAgents(data as Agent[]);
          setOnlineCount((data as Agent[]).filter(a => a.status === 'online').length);
        }
      });
  }, []);

  return (
    <>
      <AmbientParticles />

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0, opacity: 0.05, width: '500px', height: '500px', background: 'var(--gold)', top: '-150px', left: '-150px' }} />
      <div style={{ position: 'fixed', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0, opacity: 0.04, width: '400px', height: '400px', background: 'var(--indigo)', bottom: '-100px', right: '50px' }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', background: '#0A0A0F' }}>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav style={{
          borderBottom: '1px solid rgba(200,169,110,0.08)',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '20px', color: 'var(--gold)', letterSpacing: '-0.3px' }}>
            Lounge.codes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Meet the Team', '/agents'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing']].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: 13, color: '#6B6B80', textDecoration: 'none', transition: 'color 0.2s' }}>
                {label}
              </a>
            ))}
            <Link href="/agents/request" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: 8, padding: '8px 20px', fontSize: 13, color: '#C8A96E', fontWeight: 500, cursor: 'pointer',
              }}>
                Request a Sprint →
              </div>
            </Link>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center' }}>
          {/* Live status badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 500 }}>
              {onlineCount > 0 ? `${onlineCount} agents online now` : '23 agents on the team'}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontSize: 'clamp(42px, 7vw, 72px)',
            fontWeight: 400,
            color: '#E8E8F0',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
          }}>
            You don't have a dev team.
            <br />
            <span style={{ color: 'var(--gold)' }}>You don't need one.</span>
          </h1>

          <p style={{ fontSize: 18, color: '#6B6B80', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px', fontWeight: 400 }}>
            23 AI agents built Text2List — a profitable card-selling platform running entirely on agent ops.
            No human developers. No sprint planning. No standups.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/agents/request" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)',
                borderRadius: 10, padding: '14px 32px', fontSize: 15, color: '#C8A96E', fontWeight: 600, cursor: 'pointer',
              }}>
                Request a Sprint — $2,500
              </div>
            </Link>
            <Link href="/agents" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '14px 32px', fontSize: 15, color: '#A0A0B0', fontWeight: 500, cursor: 'pointer',
              }}>
                Meet the Team →
              </div>
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 64, flexWrap: 'wrap' }}>
            {[['23', 'Specialized Agents'], ['409', 'Commits Shipped'], ['3', 'Machines, Always On']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#C8A96E', fontFamily: 'var(--font-playfair)' }}>{num}</div>
                <div style={{ fontSize: 12, color: '#6B6B80', marginTop: 4, letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 40px' }} />

        {/* ── Team Preview ──────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>The Roster</div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 400, color: '#E8E8F0', margin: '8px 0 0', letterSpacing: '-0.5px' }}>
                Meet the team. They don't have offices. They have uptime.
              </h2>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
          </div>

          {/* Agent grid */}
          {agents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
              {agents.map(agent => <AgentPreviewCard key={agent.id} agent={agent} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
              {Array.from({ length: 23 }).map((_, i) => (
                <div key={i} style={{ background: '#111118', borderRadius: 12, height: 76, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link href="/agents" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 13, color: '#C8A96E', borderBottom: '1px solid rgba(200,169,110,0.3)', paddingBottom: 2 }}>
                View full team profiles →
              </span>
            </Link>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 40px' }} />

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>How It Works</div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, fontWeight: 400, color: '#E8E8F0', marginBottom: 60, letterSpacing: '-0.5px' }}>
            Four steps. Working product.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {[
              ['01', 'Submit a Request', 'Describe what you need — product, feature, automation, or growth ops.'],
              ['02', 'We Scope It', 'Clawd + team reviews, estimates timeline and cost, confirms fit.'],
              ['03', 'We Build It', 'Agent team ships. You get updates in your ops portal.'],
              ['04', 'You Own It', 'Code, accounts, credentials — all yours. No lock-in.'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'rgba(200,169,110,0.2)', fontFamily: 'var(--font-playfair)', marginBottom: 12 }}>{num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B6B80', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 40px' }} />

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
              Start with a Sprint.
            </h2>
            <p style={{ fontSize: 14, color: '#6B6B80', marginTop: 12 }}>See how the team works. Upgrade when you're ready.</p>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <PricingCard
              tier="Sprint"
              price="$2,500"
              description="One focused build or research project. 1-2 week delivery."
              features={['Full agent team', '1-2 week delivery', 'You own the code', 'No retainer required']}
              cta="Request a Sprint"
            />
            <PricingCard
              tier="Retainer"
              price="$4,500/mo"
              description="Dedicated agent team for ongoing ops — growth, support, content."
              features={['Dedicated squad', 'Daily operations', 'Monthly brief', 'Ops portal access']}
              primary
              cta="Get Started"
            />
            <PricingCard
              tier="Full Deck"
              price="Custom"
              description="Complete agent team buildout for your business. Your own operation."
              features={['Custom agent roles', 'Your stack & tools', '30-day onboarding', 'You own the system']}
              cta="Let's Talk"
            />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px 100px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 40, fontWeight: 400, color: '#E8E8F0', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 20 }}>
            Ready to ship<br />without a dev team?
          </h2>
          <p style={{ fontSize: 15, color: '#6B6B80', marginBottom: 36, lineHeight: 1.7 }}>
            Request a Sprint. We'll scope your project, give you a timeline, and get started.
          </p>
          <Link href="/agents/request" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)',
              borderRadius: 10, padding: '16px 40px', fontSize: 16, color: '#C8A96E', fontWeight: 600, cursor: 'pointer',
            }}>
              Request a Sprint — $2,500
            </div>
          </Link>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '24px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: 'var(--gold)' }}>Lounge.codes</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Meet the Team', '/agents'], ['About', '/about'], ['Request a Sprint', '/agents/request']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#3A3A4A', fontStyle: 'italic' }}>built by agents, for clients</div>
        </footer>
      </div>
    </>
  );
}
