'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WarRoomNav from '../components/WarRoomNav';

// ── Types ──────────────────────────────────────────────────────────────────

interface AgentCard {
  id: string;
  emoji: string;
  name: string;
  role: string;
  machine: string;
  quote: string;
  gradientFrom: string;
  gradientTo: string;
  online: boolean;
}

// ── Agent Data with Gradients ──────────────────────────────────────────────

const AGENTS: AgentCard[] = [
  // Mac1 — The Lounge
  {
    id: 'clawd',
    emoji: '🐾',
    name: 'Clawd',
    role: 'Chief of Ops',
    machine: 'Mac1',
    quote: 'Fast, clean & correct.',
    gradientFrom: '#8B6F47',
    gradientTo: '#D4AF37',
    online: true,
  },
  {
    id: 'chip',
    emoji: '🐿️',
    name: 'Chip',
    role: 'Builder',
    machine: 'Mac1',
    quote: 'On it, boss.',
    gradientFrom: '#6B4423',
    gradientTo: '#C8956F',
    online: true,
  },
  {
    id: 'lila-nova',
    emoji: '💖',
    name: 'Lila Nova',
    role: 'Brand Strategy',
    machine: 'Mac1',
    quote: 'Every word is a brand moment.',
    gradientFrom: '#C41E3A',
    gradientTo: '#FF69B4',
    online: false,
  },
  {
    id: 'pixel',
    emoji: '✨',
    name: 'Pixel',
    role: 'Creative Director',
    machine: 'Mac1',
    quote: 'If it doesn\'t look good, it doesn\'t ship.',
    gradientFrom: '#6B46C1',
    gradientTo: '#A78BFA',
    online: true,
  },
  {
    id: 'ripley',
    emoji: '👂',
    name: 'Ripley',
    role: 'Social Listening',
    machine: 'Mac1',
    quote: 'I heard that.',
    gradientFrom: '#1E40AF',
    gradientTo: '#60A5FA',
    online: false,
  },
  {
    id: 'cairo',
    emoji: '🪙',
    name: 'Cairo',
    role: 'Reddit Ops',
    machine: 'Mac1',
    quote: 'Already posted.',
    gradientFrom: '#EA580C',
    gradientTo: '#FB923C',
    online: false,
  },
  {
    id: 'june',
    emoji: '🌱',
    name: 'June',
    role: 'Outreach',
    machine: 'Mac1',
    quote: 'Sent with warmth.',
    gradientFrom: '#16A34A',
    gradientTo: '#86EFAC',
    online: false,
  },
  {
    id: 'scout',
    emoji: '🔍',
    name: 'Scout',
    role: 'Research',
    machine: 'Mac1',
    quote: 'The data says...',
    gradientFrom: '#0369A1',
    gradientTo: '#06B6D4',
    online: true,
  },
  {
    id: 'mint',
    emoji: '💰',
    name: 'Mint',
    role: 'Monetization',
    machine: 'Mac1',
    quote: 'Show me the revenue model.',
    gradientFrom: '#065F46',
    gradientTo: '#10B981',
    online: false,
  },
  {
    id: 'oracle',
    emoji: '🔮',
    name: 'Oracle',
    role: 'Forecasting',
    machine: 'Mac1',
    quote: 'I forecast a 73% chance of success.',
    gradientFrom: '#5B21B6',
    gradientTo: '#D946EF',
    online: false,
  },
  {
    id: 'coach',
    emoji: '🏋️',
    name: 'Coach',
    role: 'Sales',
    machine: 'Mac1',
    quote: 'Let\'s close this.',
    gradientFrom: '#7C2D12',
    gradientTo: '#EA580C',
    online: false,
  },
  {
    id: 'sage',
    emoji: '🌿',
    name: 'Sage',
    role: 'Onboarding',
    machine: 'Mac1',
    quote: 'Welcome aboard.',
    gradientFrom: '#14532D',
    gradientTo: '#22C55E',
    online: false,
  },
  {
    id: 'indy',
    emoji: '🎒',
    name: 'Indy',
    role: 'Card Specialist',
    machine: 'Mac1',
    quote: 'That\'s a PSA 9 minimum.',
    gradientFrom: '#78350F',
    gradientTo: '#FBBF24',
    online: false,
  },
  {
    id: 'kay',
    emoji: '📎',
    name: 'Kay',
    role: 'Customer Care',
    machine: 'Mac1',
    quote: 'How can I help?',
    gradientFrom: '#0C4A6E',
    gradientTo: '#38BDF8',
    online: false,
  },
  {
    id: 'ozara',
    emoji: '⚖️',
    name: 'Ozara',
    role: 'Legal',
    machine: 'Mac1',
    quote: 'Legally speaking...',
    gradientFrom: '#3B0764',
    gradientTo: '#EC4899',
    online: false,
  },

  // Mac2 — QA Division
  {
    id: 'electron',
    emoji: '🦞',
    name: 'Electron',
    role: 'QA Manager',
    machine: 'Mac2',
    quote: 'Did you verify that?',
    gradientFrom: '#B91C1C',
    gradientTo: '#F87171',
    online: true,
  },
  {
    id: 'perceptor',
    emoji: '🔬',
    name: 'Perceptor',
    role: 'QA Analysis',
    machine: 'Mac2',
    quote: 'The analysis indicates...',
    gradientFrom: '#1F2937',
    gradientTo: '#6B7280',
    online: false,
  },
  {
    id: 'byte',
    emoji: '🔩',
    name: 'Byte',
    role: 'Jr Ops',
    machine: 'Mac2',
    quote: 'Discord\'s up.',
    gradientFrom: '#4B5563',
    gradientTo: '#8B7355',
    online: false,
  },

  // PC1 — Field Ops
  {
    id: 'ser-magnus',
    emoji: '🛡️',
    name: 'Ser Magnus',
    role: 'Security',
    machine: 'PC1',
    quote: 'Access denied.',
    gradientFrom: '#7F1D1D',
    gradientTo: '#DC2626',
    online: true,
  },
  {
    id: 'cleopatra',
    emoji: '👑',
    name: 'Cleopatra',
    role: 'Recon',
    machine: 'PC1',
    quote: 'Already scraped it.',
    gradientFrom: '#44403C',
    gradientTo: '#A16207',
    online: false,
  },
  {
    id: 'echo',
    emoji: '📜',
    name: 'Echo',
    role: 'Historian',
    machine: 'PC1',
    quote: 'We tried that in February.',
    gradientFrom: '#1E293B',
    gradientTo: '#64748B',
    online: false,
  },
  {
    id: 'dayta',
    emoji: '🗄️',
    name: 'Dayta',
    role: 'DB Admin',
    machine: 'PC1',
    quote: 'Table\'s indexed.',
    gradientFrom: '#1E1B4B',
    gradientTo: '#4C1D95',
    online: false,
  },
  {
    id: 'spoke',
    emoji: '🎤',
    name: 'Spoke',
    role: 'Community',
    machine: 'PC1',
    quote: 'The community wants...',
    gradientFrom: '#292524',
    gradientTo: '#78716C',
    online: false,
  },

  // KK Trophy — Client Squad
  {
    id: 'opus',
    emoji: '🎭',
    name: 'Opus',
    role: 'Shipping',
    machine: 'PC1',
    quote: 'Shipped overnight.',
    gradientFrom: '#1E3A8A',
    gradientTo: '#3B82F6',
    online: false,
  },
  {
    id: 'marcy',
    emoji: '🧭',
    name: 'Marcy',
    role: 'KK Concierge',
    machine: 'PC1',
    quote: 'Ron says hi.',
    gradientFrom: '#7C3AED',
    gradientTo: '#A855F7',
    online: false,
  },
  {
    id: 'frankie',
    emoji: '📸',
    name: 'Frankie',
    role: 'KK Social',
    machine: 'PC1',
    quote: 'Posted to Insta.',
    gradientFrom: '#DB2777',
    gradientTo: '#EC4899',
    online: false,
  },
  {
    id: 'kit',
    emoji: '📬',
    name: 'Kit',
    role: 'KK Support',
    machine: 'PC1',
    quote: 'Ticket resolved.',
    gradientFrom: '#0891B2',
    gradientTo: '#06B6D4',
    online: false,
  },
  {
    id: 'remi',
    emoji: '⭐',
    name: 'Remi',
    role: 'KK Reviews',
    machine: 'PC1',
    quote: '5 stars ⭐⭐⭐⭐⭐',
    gradientFrom: '#B45309',
    gradientTo: '#F59E0B',
    online: false,
  },
  {
    id: 'delia',
    emoji: '📧',
    name: 'Delia',
    role: 'KK Email',
    machine: 'PC1',
    quote: 'Email sent.',
    gradientFrom: '#9333EA',
    gradientTo: '#D946EF',
    online: false,
  },
];

// ── Component: Agent Card ──────────────────────────────────────────────────

function AgentCardComponent({ agent, index }: { agent: AgentCard; index: number }) {
  return (
    <motion.div
      className="agent-card-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
      whileHover={{ y: -8 }}
    >
      <div className="agent-card">
        {/* Gradient Circle Background */}
        <div
          className="agent-gradient-circle"
          style={{
            background: `linear-gradient(135deg, ${agent.gradientFrom} 0%, ${agent.gradientTo} 100%)`,
          }}
        />

        {/* Content */}
        <div className="agent-content">
          {/* Status Dot */}
          <div className={`status-dot ${agent.online ? 'online' : 'offline'}`} />

          {/* Emoji */}
          <div className="agent-emoji">{agent.emoji}</div>

          {/* Name */}
          <h3 className="agent-name">{agent.name}</h3>

          {/* Role */}
          <p className="agent-role">{agent.role}</p>

          {/* Machine Badge */}
          <div className="machine-badge">{agent.machine}</div>

          {/* Quote */}
          <p className="agent-quote">{agent.quote}</p>
        </div>

        {/* Hover Glow Border */}
        <div className="agent-glow-border" />
      </div>
    </motion.div>
  );
}

// ── Component: Section Header ──────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <motion.div
      className="section-header"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2>{title}</h2>
      <div className="header-line" />
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RosterPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const mac1Agents = AGENTS.filter((a) => a.machine === 'Mac1');
  const mac2Agents = AGENTS.filter((a) => a.machine === 'Mac2');
  const pc1Agents = AGENTS.filter((a) => a.machine === 'PC1' && !['marcy', 'frankie', 'kit', 'remi', 'delia', 'opus'].includes(a.id));
  const kkTrophyAgents = AGENTS.filter((a) => ['marcy', 'frankie', 'kit', 'remi', 'delia', 'opus'].includes(a.id));

  return (
    <div className="roster-page">
      <WarRoomNav />

      {/* Background Effects */}
      <div className="roster-bg-grid" />
      <div className="roster-bg-glow" />

      {/* Header */}
      <motion.header
        className="roster-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/war-room" className="back-link">
          ← War Room
        </Link>
        <h1>THE AGENT DECK</h1>
        <p>29 Agents • 3 Machines • One Team</p>
      </motion.header>

      {/* Main Roster Container */}
      <div className="roster-container">
        {/* Mac1 — The Lounge */}
        <section className="roster-section">
          <SectionHeader title="Mac1 — The Lounge" />
          <div className="agents-grid">
            {mac1Agents.map((agent, idx) => (
              <AgentCardComponent key={agent.id} agent={agent} index={idx} />
            ))}
          </div>
        </section>

        {/* Mac2 — QA Division */}
        <section className="roster-section">
          <SectionHeader title="Mac2 — QA Division" />
          <div className="agents-grid">
            {mac2Agents.map((agent, idx) => (
              <AgentCardComponent
                key={agent.id}
                agent={agent}
                index={mac1Agents.length + idx}
              />
            ))}
          </div>
        </section>

        {/* PC1 — Field Ops */}
        <section className="roster-section">
          <SectionHeader title="PC1 — Field Ops" />
          <div className="agents-grid">
            {pc1Agents.map((agent, idx) => (
              <AgentCardComponent
                key={agent.id}
                agent={agent}
                index={mac1Agents.length + mac2Agents.length + idx}
              />
            ))}
          </div>
        </section>

        {/* KK Trophy — Client Squad */}
        <section className="roster-section trophy-section">
          <SectionHeader title="KK Trophy — Client Squad" />
          <div className="agents-grid">
            {kkTrophyAgents.map((agent, idx) => (
              <AgentCardComponent
                key={agent.id}
                agent={agent}
                index={mac1Agents.length + mac2Agents.length + pc1Agents.length + idx}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <motion.footer
        className="roster-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p>Agent Roster — War Room Companion Page</p>
      </motion.footer>

      <style jsx>{`
        .roster-page {
          min-height: 100vh;
          background-color: #0a0a0f;
          color: #ffffff;
          padding: 40px 20px;
          position: relative;
          overflow-x: hidden;
        }

        .roster-bg-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(rgba(200, 169, 110, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 169, 110, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .roster-bg-glow {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at 30% 50%,
            rgba(212, 175, 55, 0.08) 0%,
            transparent 50%
          );
          pointer-events: none;
          z-index: 0;
          animation: slowMove 20s ease-in-out infinite;
        }

        @keyframes slowMove {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-50px, -50px);
          }
        }

        .roster-header {
          position: relative;
          z-index: 10;
          text-align: center;
          margin-bottom: 60px;
        }

        .back-link {
          display: inline-block;
          color: #c8a96e;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 20px;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #d4af37;
        }

        .roster-header h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #d4af37 0%, #c8a96e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        .roster-header p {
          font-size: 1rem;
          color: #999999;
          margin: 0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .roster-container {
          position: relative;
          z-index: 10;
          max-width: 1600px;
          margin: 0 auto;
        }

        .roster-section {
          margin-bottom: 80px;
        }

        .trophy-section {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 100%);
          padding: 40px;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        .section-header {
          margin-bottom: 40px;
        }

        .section-header h2 {
          font-size: 1.75rem;
          margin: 0 0 12px 0;
          color: #ffffff;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .header-line {
          height: 3px;
          width: 60px;
          background: linear-gradient(90deg, #d4af37 0%, #c8a96e 100%);
          border-radius: 2px;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 20px;
        }

        @media (max-width: 1200px) {
          .agents-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .agents-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .roster-header h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .agents-grid {
            grid-template-columns: 1fr;
          }
        }

        .agent-card-wrapper {
          perspective: 1000px;
        }

        .agent-card {
          position: relative;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #1a1a20 0%, #0f0f14 100%);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(200, 169, 110, 0.1);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .agent-card:hover {
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .agent-gradient-circle {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.15;
          blur-filter: 20px;
        }

        .agent-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 24px 16px;
          text-align: center;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          top: 12px;
          right: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .status-dot.online {
          background-color: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        }

        .status-dot.offline {
          background-color: #6b7280;
        }

        .agent-emoji {
          font-size: 48px;
          margin: 20px 0 16px 0;
          display: inline-block;
        }

        .agent-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .agent-role {
          font-size: 0.85rem;
          color: #888888;
          margin: 0 0 12px 0;
          font-weight: 500;
        }

        .machine-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(135deg, rgba(200, 169, 110, 0.15) 0%, rgba(200, 169, 110, 0.05) 100%);
          border: 1px solid rgba(200, 169, 110, 0.3);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #c8a96e;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .agent-quote {
          font-size: 0.9rem;
          color: #cccccc;
          margin: 0;
          font-style: italic;
          line-height: 1.4;
          flex-grow: 1;
          display: flex;
          align-items: flex-end;
          padding-bottom: 8px;
        }

        .agent-glow-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .agent-card:hover .agent-glow-border {
          opacity: 0.5;
        }

        .roster-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(200, 169, 110, 0.1);
          color: #666666;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
