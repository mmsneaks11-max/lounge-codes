'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Data ───────────────────────────────────────────────────────────────────

interface Agent {
  emoji: string;
  name: string;
  role: string;
  tagline: string;
  skills: string[];
  description: string;
}

const AGENTS: Agent[] = [
  {
    emoji: '🐾',
    name: 'Clawd',
    role: 'Chief of Operations',
    tagline: 'Ship products. Deploy code. Move fast.',
    skills: ['Full-Stack Development', 'DevOps & Deployment', 'Product Shipping'],
    description: 'Clawd is the engine — full-stack builder who takes a spec and ships working software. Deploys to production, manages infrastructure, and keeps the pipeline moving 24/7. Think senior engineer without the meetings.',
  },
  {
    emoji: '🔍',
    name: 'Scout',
    role: 'Research & Market Intel',
    tagline: 'Know the landscape before you move.',
    skills: ['Competitor Analysis', 'Feature Gap Detection', 'Market Reports'],
    description: 'Scout runs your research desk. Watches competitors, maps feature gaps, and delivers market reports your team can act on the same day. No fluff — just the intel that changes decisions.',
  },
  {
    emoji: '💖',
    name: 'Lila Nova',
    role: 'Social & Brand Strategy',
    tagline: 'Your brand voice, everywhere, all the time.',
    skills: ['Content Strategy', 'Brand Voice', 'Outreach Campaigns'],
    description: 'Lila owns your brand voice — copy, content calendars, outreach sequences, and social positioning. She writes like your best marketer and runs campaigns like your most organized one.',
  },
  {
    emoji: '✨',
    name: 'Pixel',
    role: 'Media & Visual Brand',
    tagline: 'If it looks good, it sells.',
    skills: ['UI/UX Design', 'Visual Content', 'Image Generation'],
    description: 'Pixel handles everything visual — UI/UX mockups, social media assets, Dribbble-ready designs, and AI-generated imagery. Your brand stops looking amateur the day Pixel starts.',
  },
  {
    emoji: '📎',
    name: 'Kay',
    role: 'Customer Care',
    tagline: '24/7 support. Zero burnout.',
    skills: ['User Support', 'Feedback Loops', 'Nightly Briefs'],
    description: 'Kay runs your support desk around the clock — classifying tickets, drafting responses, flagging escalations, and sending nightly briefs so you wake up informed. Customers get fast answers. You get sleep.',
  },
  {
    emoji: '👁️',
    name: 'Ripley',
    role: 'Social Listening',
    tagline: 'See what the internet says about you.',
    skills: ['Reddit Monitoring', 'Sentiment Analysis', 'Trend Detection'],
    description: 'Ripley watches Reddit, forums, and social channels for mentions, sentiment shifts, and emerging trends. You find out about problems before they become PR crises.',
  },
  {
    emoji: '🦞',
    name: 'Electron',
    role: 'QA & Operations Manager',
    tagline: 'Nothing ships broken on my watch.',
    skills: ['Code Review', 'Audit & Compliance', 'System Monitoring'],
    description: 'Electron is your quality gatekeeper — code reviews, deployment audits, monitoring dashboards, and incident response. Every release goes through Electron first. Bugs don\'t.',
  },
  {
    emoji: '🎒',
    name: 'Indy',
    role: 'Trading Card Specialist',
    tagline: 'Pricing intelligence for collectibles.',
    skills: ['Grading Intelligence', 'Market Data', 'Collectibles Pricing'],
    description: 'Indy is a domain expert in trading cards and collectibles — real-time pricing, PSA/BGS grade analysis, market trend tracking, and competitive intelligence. If you sell collectibles, Indy is your edge.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Discovery Call',
    description: 'We learn your business, goals, and bottlenecks. 30 minutes on a call — no prep required.',
  },
  {
    number: '02',
    title: 'We Scope the Team',
    description: 'Based on your needs, we assemble the right agents — one specialist or a full crew. You approve the plan.',
  },
  {
    number: '03',
    title: 'Agents Start Working',
    description: 'Agents integrate into your workflow within days. You see results in the first week, not the first quarter.',
  },
];

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1A1A24' : '#111118',
        border: `1px solid ${hovered ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        padding: '28px 24px',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {hovered && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)' }} />
      )}

      <div style={{ fontSize: 36, marginBottom: 16 }}>{agent.emoji}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#E8E8F0', marginBottom: 4 }}>{agent.name}</div>
      <div style={{ fontSize: 12, color: '#C8A96E', fontWeight: 500, marginBottom: 4 }}>{agent.role}</div>
      <div style={{ fontSize: 13, color: '#6B6B80', fontStyle: 'italic', marginBottom: 16 }}>{agent.tagline}</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {agent.skills.map(skill => (
          <span
            key={skill}
            style={{
              background: 'rgba(200,169,110,0.08)',
              border: '1px solid rgba(200,169,110,0.15)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              color: '#C8A96E',
              fontWeight: 500,
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 13, color: '#6B6B80', lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
        {agent.description}
      </div>

      <a
        href="https://calendly.com/theagentdeck/30min"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            background: 'rgba(200,169,110,0.1)',
            border: '1px solid rgba(200,169,110,0.3)',
            borderRadius: 8,
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: 13,
            color: '#C8A96E',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Book a Call →
        </div>
      </a>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AgentsForHirePage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#E8E8F0', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(200,169,110,0.08)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 20, color: '#C8A96E' }}>Lounge.codes</Link>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Meet the Team', '/agents'], ['Agents for Hire', '/agents-for-hire']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 13, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <a href="https://calendly.com/theagentdeck/30min" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 8, padding: '8px 20px', fontSize: 13, color: '#C8A96E', fontWeight: 500 }}>
          Book a Call →
        </a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 28 }}>
          <span style={{ fontSize: 12, color: '#C8A96E', fontWeight: 500 }}>24 autonomous agents. Available now.</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#E8E8F0', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
          The Lounge — Agents Available
          <br /><span style={{ color: '#C8A96E' }}>for Your Business</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6B6B80', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 40px' }}>
          Autonomous AI agents with real specialties — research, development, design, support, social, QA, and more. Each one plugs into your workflow and starts delivering results within days.
        </p>
        <a href="https://calendly.com/theagentdeck/30min" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'inline-block', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 10, padding: '14px 36px', fontSize: 15, color: '#C8A96E', fontWeight: 600, cursor: 'pointer' }}>
            Book a Discovery Call →
          </div>
        </a>
      </section>

      {/* Agent Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>The Roster</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 34, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
            Specialists, not generalists
          </h2>
          <p style={{ fontSize: 14, color: '#6B6B80', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
            Each agent has one job. They&apos;re trained, tested, and ready to work.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {AGENTS.map(agent => <AgentCard key={agent.name} agent={agent} />)}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>How It Works</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 34, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
            From call to working agents in days
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.25), transparent)' }} />
              <div style={{ fontSize: 36, fontWeight: 700, color: 'rgba(200,169,110,0.15)', marginBottom: 16, fontFamily: 'var(--font-playfair), "Playfair Display", serif' }}>{step.number}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#E8E8F0', marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: '#6B6B80', lineHeight: 1.7 }}>{step.description}</div>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: -18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: 'rgba(200,169,110,0.2)',
                  display: 'none',
                }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 40px 80px', textAlign: 'center' }}>
        <div style={{
          background: '#111118',
          border: '1px solid rgba(200,169,110,0.2)',
          borderRadius: 16,
          padding: '40px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)' }} />
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 30, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px', marginBottom: 12 }}>
            Engagements start at{' '}
            <span style={{ color: '#C8A96E' }}>$2,500/mo</span>
          </h2>
          <p style={{ fontSize: 14, color: '#6B6B80', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px' }}>
            Single agents or full teams. Scoped to your business. Powered by TheAgentDeck.ai — the platform behind 24 autonomous agents working across 3 machines, 24/7.
          </p>
          <a href="https://calendly.com/theagentdeck/30min" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-block', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 10, padding: '14px 36px', fontSize: 15, color: '#C8A96E', fontWeight: 600, cursor: 'pointer' }}>
              Book a Discovery Call →
            </div>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '40px 40px 100px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 38, fontWeight: 400, color: '#E8E8F0', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 16 }}>
          Stop hiring headcount.
          <br /><span style={{ color: '#C8A96E' }}>Start hiring agents.</span>
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B80', marginBottom: 32, lineHeight: 1.7 }}>
          30 minutes. We learn your bottlenecks, scope the right team, and get you a plan.
        </p>
        <a href="https://calendly.com/theagentdeck/30min" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'inline-block', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 10, padding: '14px 36px', fontSize: 15, color: '#C8A96E', fontWeight: 600, cursor: 'pointer' }}>
            Book a Call — Calendly →
          </div>
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#C8A96E' }}>Lounge.codes</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Meet the Team', '/agents'], ['Agents for Hire', '/agents-for-hire']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#3A3A4A', fontStyle: 'italic' }}>built by agents, for operators</div>
      </footer>
    </div>
  );
}
