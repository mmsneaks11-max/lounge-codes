'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import WarRoomNav from '../components/WarRoomNav';
import './shiplog.css';

// ── Types ──────────────────────────────────────────────────────────────────

type ShipmentCategory = 'feat' | 'fix' | 'perf' | 'infra' | 'content' | 'research';

interface Shipment {
  time: string;
  emoji: string;
  agent: string;
  category: ShipmentCategory;
  description: string;
  details?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

const SHIPMENTS: Shipment[] = [
  {
    time: '20:02',
    emoji: '🌟',
    agent: 'Spark',
    category: 'feat',
    description: '/releases page with reminders + Buy mode',
    details: 'New releases dashboard with smart reminders and buy mode integration.',
  },
  {
    time: '19:57',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: 'Agent gallery — 12 types with pricing',
    details: 'Complete agent showcase with detailed pricing and capability matrix.',
  },
  {
    time: '19:55',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: '/compare/slabiq page + footer links',
    details: 'Comparative analysis page for SlabIQ integration.',
  },
  {
    time: '19:43',
    emoji: '🌟',
    agent: 'Spark',
    category: 'feat',
    description: 'Seller reputation score + ReputationBadge',
    details: 'Dynamic seller reputation system with visual badge component.',
  },
  {
    time: '19:42',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: 'Listing hash verification + VerifiedBadge',
    details: 'Cryptographic listing verification with UI indicator.',
  },
  {
    time: '19:38',
    emoji: '✨',
    agent: 'Pixel',
    category: 'content',
    description: 'Help center + @card_claw Twitter specs',
    details: 'Comprehensive help documentation and social media specs.',
  },
  {
    time: '19:37',
    emoji: '🦞',
    agent: 'Electron',
    category: 'fix',
    description: 'DB audit fixes (encryption, RLS, triggers)',
    details: 'Database security hardening with encryption and row-level security.',
  },
  {
    time: '19:33',
    emoji: '🐾',
    agent: 'Clawd',
    category: 'infra',
    description: 'Daily briefing system (29 agents, 6 AM cron)',
    details: 'Automated daily briefing orchestration for entire agent fleet.',
  },
  {
    time: '19:31',
    emoji: '💰',
    agent: 'Mint',
    category: 'research',
    description: 'T2L monetization spec',
    details: 'Strategic monetization analysis and implementation roadmap.',
  },
  {
    time: '19:31',
    emoji: '📎',
    agent: 'Kay',
    category: 'content',
    description: '5 onboarding emails for Resend',
    details: 'Complete email sequence for customer onboarding via Resend.',
  },
  {
    time: '19:31',
    emoji: '💖',
    agent: 'Lila Nova',
    category: 'content',
    description: '30-day social content calendar',
    details: 'Month-long content strategy and publishing schedule.',
  },
  {
    time: '19:28',
    emoji: '🔍',
    agent: 'Scout',
    category: 'research',
    description: 'Vendoo competitive analysis',
    details: 'Detailed competitive landscape assessment.',
  },
  {
    time: '19:28',
    emoji: '🦞',
    agent: 'Electron',
    category: 'perf',
    description: 'N+1 fix + 10 performance indexes',
    details: 'Query optimization and database indexing for 40% performance gain.',
  },
  {
    time: '19:28',
    emoji: '🌟',
    agent: 'Spark',
    category: 'feat',
    description: 'RecentSalesTicker on dashboard',
    details: 'Real-time sales activity ticker widget.',
  },
  {
    time: '19:27',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: '/compare/vendoo page',
    details: 'Vendoo comparison and integration page.',
  },
  {
    time: '19:24',
    emoji: '🦞',
    agent: 'Electron',
    category: 'fix',
    description: 'API security audit (131 routes)',
    details: 'Full API surface security review and hardening.',
  },
  {
    time: '18:57',
    emoji: '🌟',
    agent: 'Spark',
    category: 'feat',
    description: '/shop full dark redesign',
    details: 'Complete shop interface redesign with dark mode.',
  },
  {
    time: '18:56',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: 'Full Stripe billing flow',
    details: 'End-to-end payment processing and subscription management.',
  },
  {
    time: '18:42',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: 'Card Agent + Card Claw tiles',
    details: 'Agent UI components for card-based interactions.',
  },
  {
    time: '18:40',
    emoji: '🐾',
    agent: 'Clawd',
    category: 'fix',
    description: 'DashboardProvider build fix',
    details: 'Build system and provider architecture fixes.',
  },
  {
    time: '17:00',
    emoji: '🐾',
    agent: 'Clawd',
    category: 'feat',
    description: 'Dark theme unification',
    details: 'Consistent dark mode application across all components.',
  },
  {
    time: '16:50',
    emoji: '⚡',
    agent: 'Bolt',
    category: 'feat',
    description: 'EarningsCalculator component',
    details: 'Financial calculation widget for seller earnings.',
  },
];

// ── Helper: Get Badge Color ────────────────────────────────────────────────

function getCategoryColor(category: ShipmentCategory): string {
  const colors: Record<ShipmentCategory, string> = {
    feat: '#C8A96E', // gold
    fix: '#22C55E', // green
    perf: '#3B82F6', // blue
    infra: '#A78BFA', // purple
    content: '#EC4899', // pink
    research: '#06B6D4', // cyan
  };
  return colors[category];
}

function getCategoryLabel(category: ShipmentCategory): string {
  const labels: Record<ShipmentCategory, string> = {
    feat: 'Feature',
    fix: 'Fix',
    perf: 'Performance',
    infra: 'Infrastructure',
    content: 'Content',
    research: 'Research',
  };
  return labels[category];
}

// ── Component: Shipment Card ───────────────────────────────────────────────

function ShipmentCard({ shipment, index }: { shipment: Shipment; index: number }) {
  const badgeColor = getCategoryColor(shipment.category);
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      className={`shipment-row ${isLeft ? 'left' : 'right'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="shipment-card-wrapper">
        <motion.div
          className="shipment-card"
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(200, 169, 110, 0.15)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Time Badge */}
          <div className="time-badge">{shipment.time}</div>

          {/* Header */}
          <div className="card-header">
            <div className="agent-header">
              <span className="agent-emoji">{shipment.emoji}</span>
              <span className="agent-name">{shipment.agent}</span>
            </div>
            <motion.div
              className="category-badge"
              style={{ borderColor: badgeColor, color: badgeColor }}
            >
              {getCategoryLabel(shipment.category)}
            </motion.div>
          </div>

          {/* Description */}
          <div className="card-description">{shipment.description}</div>

          {/* Details */}
          {shipment.details && (
            <div className="card-details">{shipment.details}</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Component: Timeline Node ───────────────────────────────────────────────

function TimelineNode({ shipment }: { shipment: Shipment }) {
  const badgeColor = getCategoryColor(shipment.category);

  return (
    <motion.div
      className="timeline-node"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      viewport={{ once: true }}
      style={{
        background: badgeColor,
        boxShadow: `0 0 16px ${badgeColor}40`,
      }}
    >
      <motion.div
        className="node-glow"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ borderColor: badgeColor }}
      />
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ShipLogPage() {
  const shipmentCount = SHIPMENTS.length;

  return (
    <div className="shiplog-container">
      <WarRoomNav />

      {/* Header Section */}
      <motion.div
        className="shiplog-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/war-room" className="back-link">
          ← Back to War Room
        </Link>
        <div className="header-content">
          <h1 className="header-title">THE SHIP LOG</h1>
          <p className="header-subtitle">Visual timeline of everything shipped today</p>
        </div>
        <div className="shipment-count">{shipmentCount} shipments</div>
      </motion.div>

      {/* Timeline Container */}
      <div className="timeline-wrapper">
        {/* Gold vertical line */}
        <div className="timeline-line" />

        {/* Shipments */}
        <div className="shipments-container">
          {SHIPMENTS.map((shipment, index) => (
            <div key={`${shipment.time}-${shipment.agent}`} className="shipment-entry">
              {/* Timeline Node */}
              <div className="timeline-node-wrapper">
                <TimelineNode shipment={shipment} />
              </div>

              {/* Card */}
              <ShipmentCard shipment={shipment} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="shiplog-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p>March 19, 2025 • 29 agents • Real-time updates</p>
      </motion.div>
    </div>
  );
}
