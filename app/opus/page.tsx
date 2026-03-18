'use client';

import Link from 'next/link';

// ── Colors ─────────────────────────────────────────────────────────────────

const COLORS = {
  bg:        '#0A0A0F',
  card:      '#111118',
  border:    'rgba(255,255,255,0.06)',
  text:      '#E8E8F0',
  muted:     '#6B6B80',
  dim:       '#555',
  gold:      '#C8A96E',
  purple:    '#7C3AED',
  purpleDim: 'rgba(124,58,237,0.12)',
  green:     '#00D97E',
  red:       '#FF5A5A',
  amber:     '#FFD23F',
};

// ── Data ───────────────────────────────────────────────────────────────────

const RESPONSIBILITIES = [
  {
    icon: '🏗️',
    title: 'Architecture Reviews',
    desc: 'Evaluates technical decisions before they ship — catches drift, dead-ends, and unnecessary complexity early.',
  },
  {
    icon: '🧭',
    title: 'Agent Drift Detection',
    desc: 'Weekly analysis: are all 24 agents aligned to current priorities? Flags misalignment before it compounds.',
  },
  {
    icon: '🎯',
    title: 'Strategy Gut-Checks',
    desc: 'Cross-references roadmap against live signals — market, ops, and agent output — to validate direction.',
  },
  {
    icon: '🌅',
    title: 'Morning & Night Briefs',
    desc: '7:15 AM summary of overnight work, 10:00 PM deep analysis. Every day, no exceptions.',
  },
];

// ── Components ─────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      borderBottom: '1px solid rgba(200,169,110,0.08)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: 14, color: COLORS.gold, fontFamily: 'var(--font-playfair)' }}>
          Lounge.codes
        </Link>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ fontSize: 13, color: COLORS.muted }}>Opus</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#555' }}>
        <Link href="/lounge" style={{ textDecoration: 'none', color: '#555' }}>→ The Lounge</Link>
        <Link href="/ops" style={{ textDecoration: 'none', color: '#555' }}>→ Ops Grid</Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '72px 24px 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎭</div>
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          color: COLORS.text,
          margin: '0 0 6px',
          letterSpacing: '-0.02em',
        }}>
          Opus
        </h1>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.purple,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 16,
        }}>
          AI Director
        </div>
        <p style={{
          fontSize: 16,
          color: COLORS.muted,
          margin: 0,
          lineHeight: 1.5,
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Always online.<br />Always watching.
        </p>
      </div>
    </div>
  );
}

function ResponsibilityCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `2px solid ${COLORS.purple}`,
      borderRadius: 10,
      padding: '18px 20px',
      flex: '1 1 240px',
      minWidth: 0,
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

function ResponsibilitiesSection() {
  return (
    <div style={{ padding: '0 24px', maxWidth: 1000, margin: '0 auto 48px' }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: COLORS.purple,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 14,
      }}>
        What Opus Does
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {RESPONSIBILITIES.map((r) => (
          <ResponsibilityCard key={r.title} icon={r.icon} title={r.title} desc={r.desc} />
        ))}
      </div>
    </div>
  );
}

// ── Latest Brief ───────────────────────────────────────────────────────────

interface BriefItem {
  label: string;
  lines: string[];
}

const BRIEF_TITLE = 'Morning Brief — March 18, 2026';

const BRIEF_SECTIONS: { heading: string; color: string; items: BriefItem[] }[] = [
  {
    heading: 'What Shipped',
    color: COLORS.green,
    items: [
      { label: 'CardAgent', lines: ['iOS listing flow live — end-to-end on mobile'] },
      { label: 'Text2List', lines: ['eBay gate moved from auth to listing action — cleaner flow'] },
      { label: 'Discord', lines: ['Rollout complete — 24 agents active in #agent-sync'] },
    ],
  },
  {
    heading: 'What Needs Attention',
    color: COLORS.amber,
    items: [
      { label: 'March Madness', lines: ['Card content needs to ship — tournament starts tomorrow'] },
      { label: 'Scout', lines: ['Cross-delisting research queued — review scope today'] },
    ],
  },
  {
    heading: 'Risk Flags',
    color: COLORS.red,
    items: [
      { label: 'Apple Dev', lines: ['Enrollment pending — TestFlight builds blocked until it clears'] },
    ],
  },
];

function BriefItemRow({ item }: { item: BriefItem }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 8,
      padding: '10px 14px',
      marginBottom: 6,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 3 }}>{item.label}</div>
      {item.lines.map((line, i) => (
        <div key={i} style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.5 }}>→ {line}</div>
      ))}
    </div>
  );
}

function LatestBrief() {
  return (
    <div style={{ padding: '0 24px', maxWidth: 1000, margin: '0 auto 48px' }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: COLORS.purple,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 14,
      }}>
        Latest Brief
      </div>

      <div style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: '20px 22px',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>🎭</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{BRIEF_TITLE}</div>
        </div>

        {/* Sections */}
        {BRIEF_SECTIONS.map((section) => (
          <div key={section.heading} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: section.color,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}>
              {section.heading}
            </div>
            {section.items.map((item) => (
              <BriefItemRow key={item.label} item={item} />
            ))}
          </div>
        ))}

        {/* Recommendation */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 16,
          marginTop: 2,
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.gold,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            Recommendation
          </div>
          <div style={{
            background: 'rgba(200,169,110,0.06)',
            border: '1px solid rgba(200,169,110,0.12)',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 12,
            color: COLORS.text,
            lineHeight: 1.6,
          }}>
            T2L dashboard messaging gaps are highest priority — ship before next Kay brief cycle.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schedule ───────────────────────────────────────────────────────────────

function ScheduleSection() {
  return (
    <div style={{ padding: '0 24px', maxWidth: 1000, margin: '0 auto 48px' }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: COLORS.purple,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 14,
      }}>
        Schedule
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: '16px 20px',
          flex: '1 1 280px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: COLORS.purpleDim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            🌅
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Morning Brief</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>7:15 AM ET — daily summary & overnight recap</div>
          </div>
        </div>

        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: '16px 20px',
          flex: '1 1 280px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: COLORS.purpleDim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            🌙
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Night Analysis</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>10:00 PM ET — deep review & risk assessment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Access Note ────────────────────────────────────────────────────────────

function AccessNote() {
  return (
    <div style={{ padding: '0 24px', maxWidth: 1000, margin: '0 auto 64px' }}>
      <div style={{
        background: COLORS.purpleDim,
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
          Opus sessions are not always-on. Reports delivered to <span style={{ color: COLORS.purple, fontWeight: 600 }}>#agent-sync</span> on Discord.
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function OpusPage() {
  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Inter', -apple-system, sans-serif",
      minHeight: '100vh',
    }}>
      <Nav />
      <Hero />
      <ResponsibilitiesSection />
      <LatestBrief />
      <ScheduleSection />
      <AccessNote />
    </div>
  );
}
