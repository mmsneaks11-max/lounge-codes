'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Data ───────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    icon: '🤖',
    name: 'Listing Sync Agent',
    tagline: 'Write once. List everywhere.',
    description: 'Your product lives in one place. This agent handles the rest — reformatting your listings for Amazon, Shopify, and eBay automatically. Change a price, update a description, add a product — it propagates in minutes, not hours.',
    features: [
      'Supports Amazon, Shopify, eBay (more platforms in v2)',
      'Human review step before publish',
      'Detects policy violations before they become account strikes',
    ],
    pricePerBrand: 299,
    agencyPrice: 1499,
    popular: false,
  },
  {
    icon: '📧',
    name: 'Customer Service Agent',
    tagline: '24-hour response time. Zero extra headcount.',
    description: 'Amazon requires 24hr replies or your seller health takes a hit. This agent monitors your inbox, classifies every message, and drafts a response — you review and approve in one click.',
    features: [
      'Classifies: WISMO, returns, product questions, delivery issues',
      'One-click approve via email or dashboard',
      'Escalation flags for A-to-Z threats and high-risk messages',
      'Learns from your edits over time',
    ],
    pricePerBrand: 199,
    agencyPrice: 999,
    popular: false,
  },
  {
    icon: '📦',
    name: 'Reorder Agent',
    tagline: 'Never stock out. Never overorder.',
    description: 'Watches your inventory levels in real time, calculates days-of-supply based on your actual sales velocity, and creates purchase orders before you run out.',
    features: [
      'Customizable reorder thresholds by SKU',
      'Accounts for lead times, MOQs, and FBA prep time',
      'Auto-creates draft POs (you approve before sending)',
    ],
    pricePerBrand: 249,
    agencyPrice: 1199,
    popular: false,
  },
  {
    icon: '💬',
    name: 'Review Monitor Agent',
    tagline: 'Know the moment something goes wrong.',
    description: 'Watches every review across all your platforms. Flags negatives the moment they land, drafts a professional response, and tracks sentiment trends over time.',
    features: [
      'Monitors: Amazon, Google, Trustpilot, eBay feedback',
      'Instant alert on 1-3 star reviews',
      'Response drafts ready within minutes',
      'Monthly sentiment report',
    ],
    pricePerBrand: 99,
    agencyPrice: 499,
    popular: false,
  },
  {
    icon: '📊',
    name: 'Reprice Agent',
    tagline: 'Win the Buy Box. Keep your margins.',
    description: 'Watches competitor pricing and the Amazon Buy Box in real time. Adjusts your prices within the floor and ceiling you set — automatically, continuously, without you watching a dashboard all day.',
    features: [
      'Floor/ceiling rules per SKU (your margins stay protected)',
      'Buy Box win-rate tracking',
      'Repricing history log',
      'Pause anytime',
    ],
    pricePerBrand: 199,
    agencyPrice: 999,
    popular: false,
  },
];

const BUNDLES = [
  { name: 'Starter', includes: 'CS Agent + Review Monitor', perBrand: 249, agency: null, popular: false },
  { name: 'Growth', includes: 'Listing Sync + CS Agent + Reprice', perBrand: 599, agency: null, popular: false },
  { name: 'Full Suite', includes: 'All 5 agents', perBrand: 899, agency: null, popular: true },
  { name: 'Agency Growth', includes: 'Full Suite, up to 6 brands', perBrand: null, agency: 3999, popular: false },
  { name: 'Agency Scale', includes: 'Full Suite, up to 15 brands', perBrand: null, agency: 7999, popular: false },
];

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent, agencyMode }: { agent: typeof AGENTS[0]; agencyMode: boolean }) {
  const [hovered, setHovered] = useState(false);
  const price = agencyMode ? agent.agencyPrice : agent.pricePerBrand;
  const suffix = agencyMode ? '/mo up to 6 brands' : '/mo per brand';

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

      <div style={{ fontSize: 36, marginBottom: 16 }}>{agent.icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>{agent.name}</div>
      <div style={{ fontSize: 13, color: '#C8A96E', fontStyle: 'italic', marginBottom: 14 }}>{agent.tagline}</div>
      <div style={{ fontSize: 13, color: '#6B6B80', lineHeight: 1.7, marginBottom: 20, flex: 1 }}>{agent.description}</div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {agent.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#A0A0B0' }}>
            <span style={{ color: '#C8A96E', flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#E8E8F0' }}>${price}</span>
        <span style={{ fontSize: 12, color: '#6B6B80' }}>{suffix}</span>
      </div>

      <Link href="/agents/request" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: 8, padding: '11px 20px', textAlign: 'center',
          fontSize: 13, color: '#C8A96E', fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}>
          Get Started →
        </div>
      </Link>
    </div>
  );
}

// ── Before/After ───────────────────────────────────────────────────────────

function BeforeAfter() {
  const rows = [
    ['Listing updates', 'Manual edits on each platform', 'One change, everywhere in minutes'],
    ['Customer messages', 'Checking inboxes, copy-pasting replies', 'Auto-classified, drafts ready to approve'],
    ['Inventory', 'Spreadsheets, gut feel, stock-outs', 'Real-time velocity, auto-POs before you run out'],
    ['Reviews', 'Noticed days later (if at all)', 'Flagged instantly, response drafted on landing'],
    ['Pricing', 'Manual checks, static prices', 'Buy Box-aware, continuous, rules-protected'],
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', marginBottom: 80 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)', fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Task</div>
        <div style={{ padding: '14px 20px', background: 'rgba(255,80,80,0.06)', borderLeft: '1px solid rgba(255,255,255,0.04)', fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Without AgentDeck</div>
        <div style={{ padding: '14px 20px', background: 'rgba(0,217,126,0.06)', borderLeft: '1px solid rgba(255,255,255,0.04)', fontSize: 11, color: '#00D97E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>With AgentDeck</div>
        {/* Rows */}
        {rows.map(([task, without, with_], i) => (
          <>
            <div key={`t${i}`} style={{ padding: '14px 20px', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#888', fontWeight: 500 }}>{task}</div>
            <div key={`w${i}`} style={{ padding: '14px 20px', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#6B6B80' }}>❌ {without}</div>
            <div key={`a${i}`} style={{ padding: '14px 20px', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#A0A0B0' }}>✅ {with_}</div>
          </>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AgentsForHirePage() {
  const [agencyMode, setAgencyMode] = useState(false);

  return (
    <div style={{ background: '#0A0A0F', color: '#E8E8F0', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(200,169,110,0.08)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 20, color: '#C8A96E' }}>Lounge.codes</Link>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Meet the Team', '/agents'], ['How It Works', '/#how-it-works'], ['Pricing', '/#pricing']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 13, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <Link href="/agents/request" style={{ textDecoration: 'none', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 8, padding: '8px 20px', fontSize: 13, color: '#C8A96E', fontWeight: 500 }}>
          Request a Sprint →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 28 }}>
          <span style={{ fontSize: 12, color: '#C8A96E', fontWeight: 500 }}>E-commerce Agent Suite</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: '#E8E8F0', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Five agents. Every e-commerce task.
          <br /><span style={{ color: '#C8A96E' }}>Running 24/7.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6B6B80', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
          Listings, customer service, inventory, reviews, and pricing — handled automatically. You stay in control. The agents do the work.
        </p>

        {/* Pricing toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, gap: 4, marginBottom: 16 }}>
          {[false, true].map((isAgency) => (
            <button
              key={String(isAgency)}
              onClick={() => setAgencyMode(isAgency)}
              style={{
                background: agencyMode === isAgency ? 'rgba(200,169,110,0.15)' : 'transparent',
                border: agencyMode === isAgency ? '1px solid rgba(200,169,110,0.3)' : '1px solid transparent',
                borderRadius: 7, padding: '8px 20px', fontSize: 13,
                color: agencyMode === isAgency ? '#C8A96E' : '#6B6B80',
                cursor: 'pointer', fontWeight: agencyMode === isAgency ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {isAgency ? 'Agency Pricing' : 'Per Brand'}
            </button>
          ))}
        </div>
        {agencyMode && <div style={{ fontSize: 12, color: '#6B6B80' }}>Up to 6 brands per plan</div>}
      </section>

      {/* Agent grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {AGENTS.map(agent => <AgentCard key={agent.name} agent={agent} agencyMode={agencyMode} />)}
        </div>
      </section>

      {/* Before/After */}
      <section style={{ padding: '0 40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>The Difference</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 34, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
            What actually changes
          </h2>
        </div>
        <BeforeAfter />
      </section>

      {/* Bundle pricing */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Bundles</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 34, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
            Start with what you need. Add as you grow.
          </h2>
          <p style={{ fontSize: 13, color: '#6B6B80', marginTop: 12 }}>All plans include onboarding, monitoring, and email support.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {BUNDLES.map(bundle => (
            <div key={bundle.name} style={{
              flex: 1, minWidth: 160,
              background: bundle.popular ? 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)' : '#111118',
              border: `1px solid ${bundle.popular ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14, padding: '24px 20px', position: 'relative', overflow: 'hidden',
            }}>
              {bundle.popular && (
                <>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)' }} />
                  <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 9, color: '#C8A96E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Popular</div>
                </>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>{bundle.name}</div>
              <div style={{ fontSize: 12, color: '#6B6B80', marginBottom: 16, minHeight: 32 }}>{bundle.includes}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: bundle.popular ? '#C8A96E' : '#E8E8F0', marginBottom: 4 }}>
                ${(bundle.agency ?? bundle.perBrand)?.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>/mo{bundle.agency ? '' : ' per brand'}</div>
              <Link href="/agents/request" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: bundle.popular ? 'rgba(200,169,110,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${bundle.popular ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 7, padding: '10px 16px', textAlign: 'center',
                  fontSize: 12, color: bundle.popular ? '#C8A96E' : '#6B6B80', fontWeight: 500, cursor: 'pointer',
                }}>
                  Get Started
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '40px 40px 100px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 38, fontWeight: 400, color: '#E8E8F0', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 16 }}>
          Ready to automate?
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B80', marginBottom: 32, lineHeight: 1.7 }}>
          Start with a single agent or the full suite. Setup takes days, not months.
        </p>
        <Link href="/agents/request" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'inline-block', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 10, padding: '14px 36px', fontSize: 15, color: '#C8A96E', fontWeight: 600, cursor: 'pointer' }}>
            Request a Sprint — $2,500
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: '#C8A96E' }}>Lounge.codes</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Meet the Team', '/agents'], ['E-commerce Agents', '/agents-for-hire'], ['Request a Sprint', '/agents/request']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#3A3A4A', fontStyle: 'italic' }}>built by agents, for operators</div>
      </footer>
    </div>
  );
}
