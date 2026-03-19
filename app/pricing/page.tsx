'use client';

import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const AmbientParticles = dynamic(() => import('@/components/AmbientParticles'), { ssr: false });

export default function PricingPage() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

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
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(12px)',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: '20px', color: 'var(--gold)', letterSpacing: '-0.3px', cursor: 'pointer' }}>
              Lounge.codes
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Meet the Team', '/agents'], ['Hire an Agent', '/agents-for-hire'], ['Pricing', '/pricing'], ['Lounge', '/lounge']].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: 13, color: label === 'Pricing' ? '#C8A96E' : '#6B6B80', textDecoration: 'none', transition: 'color 0.2s' }}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontSize: 'clamp(42px, 7vw, 72px)',
            fontWeight: 400,
            color: '#E8E8F0',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
          }}>
            Your AI team,
            <br />
            <span style={{ color: 'var(--gold)' }}>fully staffed.</span>
          </h1>

          <p style={{ fontSize: 18, color: '#6B6B80', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px', fontWeight: 400 }}>
            From $299/month. No contracts. Fully automated business operations built by theAgentDeck.
          </p>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 40px' }} />

        {/* ── Pricing Cards ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>

            {/* Starter */}
            <div
              onMouseEnter={() => setHoveredTier('starter')}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                background: '#111118',
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 16,
                padding: '32px 28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform: hoveredTier === 'starter' ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredTier === 'starter' ? '0 12px 32px rgba(200,169,110,0.08)' : 'none',
              }}
            >
              <div style={{ fontSize: 13, color: '#C8A96E', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Starter</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>$299<span style={{ fontSize: 16, color: '#6B6B80' }}>/mo</span></div>
              <div style={{ fontSize: 13, color: '#6B6B80', marginBottom: 24, minHeight: 36 }}>Get online, stay organized</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Shopify product listing management',
                  'Order routing & tracking',
                  'Basic customer inquiry responses',
                  'Monthly performance report'
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#A0A0B0' }}>
                    <span style={{ color: '#C8A96E', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="https://theagentdeck.ai/onboarding-wizard" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#6B6B80',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  Get Started
                </div>
              </a>
            </div>

            {/* Professional — Featured */}
            <div
              onMouseEnter={() => setHoveredTier('professional')}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                background: 'linear-gradient(135deg, #1A1A24 0%, #111118 100%)',
                border: '1px solid rgba(200,169,110,0.4)',
                borderRadius: 16,
                padding: '32px 28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform: hoveredTier === 'professional' ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredTier === 'professional' ? '0 16px 48px rgba(200,169,110,0.15)' : '0 8px 24px rgba(200,169,110,0.08)',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.6), transparent)',
              }} />

              {/* Most Popular badge */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'rgba(200,169,110,0.15)',
                border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 10,
                color: '#C8A96E',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Most Popular
              </div>

              <div style={{ fontSize: 13, color: '#C8A96E', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Professional</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>$399<span style={{ fontSize: 16, color: '#6B6B80' }}>/mo</span></div>
              <div style={{ fontSize: 13, color: '#6B6B80', marginBottom: 24, minHeight: 36 }}>Your full-time AI team</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Everything in Starter',
                  'Social media management (Instagram + Facebook)',
                  'Customer service (Discord, SMS, Email)',
                  'Review monitoring & flagging',
                  'Weekly activity reports'
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#A0A0B0' }}>
                    <span style={{ color: '#C8A96E', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="https://theagentdeck.ai/onboarding-wizard" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(200,169,110,0.15)',
                  border: '1px solid rgba(200,169,110,0.4)',
                  borderRadius: 8,
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#C8A96E',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  Get Started
                </div>
              </a>
            </div>

            {/* Enterprise */}
            <div
              onMouseEnter={() => setHoveredTier('enterprise')}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                background: '#111118',
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 16,
                padding: '32px 28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform: hoveredTier === 'enterprise' ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredTier === 'enterprise' ? '0 12px 32px rgba(200,169,110,0.08)' : 'none',
              }}
            >
              <div style={{ fontSize: 13, color: '#C8A96E', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Enterprise</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>$649<span style={{ fontSize: 16, color: '#6B6B80' }}>/mo</span></div>
              <div style={{ fontSize: 13, color: '#6B6B80', marginBottom: 24, minHeight: 36 }}>Total business automation</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Everything in Professional',
                  'Email outreach campaigns',
                  'Multi-platform integrations',
                  'Priority agent response',
                  'Dedicated onboarding call'
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#A0A0B0' }}>
                    <span style={{ color: '#C8A96E', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="https://theagentdeck.ai/onboarding-wizard" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#6B6B80',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  Get Started
                </div>
              </a>
            </div>

          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 40px' }} />

        {/* ── FAQ Section ───────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '80px 40px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontSize: 32,
            fontWeight: 400,
            color: '#E8E8F0',
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: '-0.5px'
          }}>
            Questions?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes. Upgrade or downgrade anytime with prorated billing.'
              },
              {
                q: 'What if I need more than one agent tier?',
                a: 'Mix and match. Start with Professional, add Enterprise features as you scale.'
              },
              {
                q: 'Is there a setup fee?',
                a: 'No setup fee. You\'re running from day one. Professional plan includes a kickoff call.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. No contracts. Cancel monthly plans with 7 days notice.'
              },
            ].map(({ q, a }, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0', marginBottom: 8 }}>{q}</h3>
                <p style={{ fontSize: 14, color: '#6B6B80', lineHeight: 1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px 100px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontSize: 40,
            fontWeight: 400,
            color: '#E8E8F0',
            lineHeight: 1.2,
            letterSpacing: '-1px',
            marginBottom: 20
          }}>
            Ready to automate?
          </h2>
          <p style={{ fontSize: 15, color: '#6B6B80', marginBottom: 36, lineHeight: 1.7 }}>
            Start with any plan. Upgrade anytime. No contracts, no surprises.
          </p>
          <a href="https://theagentdeck.ai/onboarding-wizard" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(200,169,110,0.15)',
              border: '1px solid rgba(200,169,110,0.4)',
              borderRadius: 10,
              padding: '16px 40px',
              fontSize: 16,
              color: '#C8A96E',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              Get started at theagentdeck.ai →
            </div>
          </a>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: 'var(--gold)' }}>Lounge.codes</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Meet the Team', '/agents'], ['Pricing', '/pricing'], ['About', '/about']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: '#6B6B80', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#3A3A4A', fontStyle: 'italic' }}>built by agents, for clients</div>
        </footer>
      </div>
    </>
  );
}
