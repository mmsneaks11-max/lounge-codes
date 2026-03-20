'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './war-room.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  emoji: string;
  name: string;
  role: string;
  active: boolean;
}

interface Machine {
  name: string;
  ip: string;
  status: 'online' | 'offline';
  agents: Agent[];
}

interface ActivityEvent {
  id: string;
  emoji: string;
  agent: string;
  message: string;
  timestamp: string;
  color: string;
  type: 'commit' | 'security' | 'task' | 'shipped' | 'completed';
}

// ── Data ───────────────────────────────────────────────────────────────────

const MACHINES: Machine[] = [
  {
    name: 'Mac1',
    ip: '100.109.230.90',
    status: 'online',
    agents: [
      { id: 'clawd', emoji: '🐾', name: 'Clawd', role: 'Chief of Ops', active: true },
      { id: 'chip', emoji: '🐿️', name: 'Chip', role: 'Builder', active: false },
      { id: 'lila-nova', emoji: '💖', name: 'Lila Nova', role: 'Brand Strategy', active: false },
      { id: 'pixel', emoji: '✨', name: 'Pixel', role: 'Media', active: false },
      { id: 'ripley', emoji: '👂', name: 'Ripley', role: 'Social Listening', active: false },
      { id: 'cairo', emoji: '🪙', name: 'Cairo', role: 'Reddit', active: false },
      { id: 'june', emoji: '🌱', name: 'June', role: 'Outreach', active: false },
      { id: 'scout', emoji: '🔍', name: 'Scout', role: 'Research', active: true },
      { id: 'mint', emoji: '💰', name: 'Mint', role: 'Monetization', active: false },
      { id: 'oracle', emoji: '🔮', name: 'Oracle', role: 'Forecasting', active: false },
      { id: 'coach', emoji: '🏋️', name: 'Coach', role: 'Sales', active: false },
      { id: 'sage', emoji: '🌿', name: 'Sage', role: 'Onboarding', active: false },
      { id: 'indy', emoji: '🎒', name: 'Indy', role: 'Card Specialist', active: false },
      { id: 'kay', emoji: '📎', name: 'Kay', role: 'Customer Care', active: false },
      { id: 'ozara', emoji: '⚖️', name: 'Ozara', role: 'Legal', active: false },
    ],
  },
  {
    name: 'Mac2',
    ip: '100.85.255.5',
    status: 'online',
    agents: [
      { id: 'electron', emoji: '🦞', name: 'Electron', role: 'QA Manager', active: true },
      { id: 'perceptor', emoji: '🔬', name: 'Perceptor', role: 'QA Analysis', active: false },
      { id: 'byte', emoji: '🔩', name: 'Byte', role: 'Jr Ops', active: false },
    ],
  },
  {
    name: 'PC1',
    ip: '100.79.148.78',
    status: 'online',
    agents: [
      { id: 'ser-magnus', emoji: '🛡️', name: 'Ser Magnus', role: 'Security', active: true },
      { id: 'cleopatra', emoji: '👑', name: 'Cleopatra', role: 'Recon', active: false },
      { id: 'echo', emoji: '📜', name: 'Echo', role: 'Historian', active: false },
      { id: 'dayta', emoji: '🗄️', name: 'Dayta', role: 'DB Admin', active: false },
      { id: 'spoke', emoji: '🎤', name: 'Spoke', role: 'Community', active: false },
      { id: 'marcy', emoji: '🧭', name: 'Marcy', role: 'KK Concierge', active: false },
      { id: 'frankie', emoji: '📸', name: 'Frankie', role: 'KK Social', active: false },
      { id: 'kit', emoji: '📬', name: 'Kit', role: 'KK Support', active: false },
      { id: 'remi', emoji: '⭐', name: 'Remi', role: 'KK Reviews', active: false },
      { id: 'delia', emoji: '📧', name: 'Delia', role: 'KK Email', active: false },
    ],
  },
];

const SAMPLE_EVENTS: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
  {
    emoji: '🐾',
    agent: 'Clawd',
    message: 'committed: feat: /releases page',
    color: '#C8A96E',
    type: 'commit',
  },
  {
    emoji: '🛡️',
    agent: 'Ser Magnus',
    message: 'started security sweep',
    color: '#FF6B6B',
    type: 'security',
  },
  {
    emoji: '🎭',
    agent: 'Lila Nova',
    message: 'writing brand guidelines...',
    color: '#A78BFA',
    type: 'task',
  },
  {
    emoji: '⚡',
    agent: 'Bolt',
    message: 'shipped /agents gallery',
    color: '#C8A96E',
    type: 'shipped',
  },
  {
    emoji: '🔍',
    agent: 'Scout',
    message: 'completed release calendar',
    color: '#3B82F6',
    type: 'completed',
  },
];

// ── Helper: Format Time ────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// ── Component: Agent Dot ───────────────────────────────────────────────────

function AgentDot({ agent }: { agent: Agent }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="agent-dot-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        className={`agent-dot ${agent.active ? 'active' : 'idle'}`}
        animate={agent.active ? { scale: [1, 1.05, 1] } : {}}
        transition={agent.active ? { duration: 2, repeat: Infinity } : {}}
        whileHover={{ scale: 1.15 }}
      >
        <span className="agent-emoji">{agent.emoji}</span>
      </motion.div>
      {showTooltip && (
        <motion.div
          className="agent-tooltip"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          <div className="tooltip-name">{agent.name}</div>
          <div className="tooltip-role">{agent.role}</div>
        </motion.div>
      )}
    </div>
  );
}

// ── Component: Machine Node ────────────────────────────────────────────────

function MachineNode({ machine }: { machine: Machine }) {
  const activeCount = machine.agents.filter((a) => a.active).length;

  return (
    <motion.div
      className="machine-node"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="machine-header">
        <div className="machine-info">
          <h3 className="machine-name">{machine.name}</h3>
          <p className="machine-ip">{machine.ip}</p>
        </div>
        <motion.div
          className="status-indicator"
          animate={{ boxShadow: ['0 0 8px rgba(0,215,126,0.6)', '0 0 16px rgba(0,215,126,0.3)', '0 0 8px rgba(0,215,126,0.6)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="status-dot" />
        </motion.div>
      </div>

      {/* Agent Grid */}
      <div className="agents-grid">
        {machine.agents.map((agent) => (
          <AgentDot key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Agent Count */}
      <div className="agent-count">
        <span className="active-count">{activeCount}</span> / {machine.agents.length} active
      </div>
    </motion.div>
  );
}

// ── Component: Activity Feed ───────────────────────────────────────────────

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="activity-feed">
      <div className="feed-header">Live Activity</div>
      <div className="feed-content">
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="feed-item"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="feed-flash"
              style={{ backgroundColor: event.color }}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.1 }}
            />
            <div className="feed-emoji">{event.emoji}</div>
            <div className="feed-text">
              <div className="feed-message">
                <strong>{event.agent}</strong> {event.message}
              </div>
              <div className="feed-time">{event.timestamp}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Component: Stats Bar ───────────────────────────────────────────────────

function StatItem({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const interval = setInterval(() => {
        setDisplayValue((prev) => (prev < value ? prev + 1 : value));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <div className="stat-value">{typeof value === 'number' ? displayValue : value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StatsBar() {
  const activeAgents = MACHINES.reduce(
    (sum, m) => sum + m.agents.filter((a) => a.active).length,
    0
  );
  const totalAgents = MACHINES.reduce((sum, m) => sum + m.agents.length, 0);

  return (
    <div className="stats-bar">
      <StatItem icon="🏗️" label="Commits Today" value={24} />
      <StatItem icon="💬" label="Messages Today" value={147} />
      <StatItem icon="📋" label="Handoffs" value={12} />
      <StatItem icon="🤖" label="Agents Online" value={`${activeAgents}/${totalAgents}`} />
    </div>
  );
}

// ── Component: Live Clock ──────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    setTime(formatTime(new Date()));
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="live-clock">{time}</div>;
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function WarRoomPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Initialize with sample events
    const initialEvents = SAMPLE_EVENTS.map((e, i) => ({
      ...e,
      id: `event-${i}`,
      timestamp: formatTime(new Date(Date.now() - i * 30000)),
    })).reverse();

    setEvents(initialEvents);

    // Add new fake events every 8 seconds
    const interval = setInterval(() => {
      const randomEvent = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
      const newEvent: ActivityEvent = {
        ...randomEvent,
        id: `event-${Date.now()}`,
        timestamp: formatTime(new Date()),
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="war-room-container">
      {/* Background Particles */}
      <div className="particles-bg">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [0, -400],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Live Clock */}
      <LiveClock />

      {/* Main Content */}
      <div className="war-room-content">
        {/* Machine Map Section */}
        <div className="machine-map">
          <motion.div
            className="map-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1>Mission Control</h1>
            <p>Real-time agent operations</p>
          </motion.div>

          <div className="machines-grid">
            {MACHINES.map((machine) => (
              <MachineNode key={machine.name} machine={machine} />
            ))}
          </div>

          {/* Connection Lines */}
          <svg className="connection-lines" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <pattern
                id="dotted"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
              >
                <circle cx="2" cy="2" r="1" fill="rgba(200,169,110,0.2)" />
              </pattern>
            </defs>
            <line x1="20%" y1="200" x2="40%" y2="200" stroke="url(#dotted)" strokeWidth="1" />
            <line x1="60%" y1="200" x2="80%" y2="200" stroke="url(#dotted)" strokeWidth="1" />
          </svg>
        </div>

        {/* Activity Feed Sidebar */}
        <ActivityFeed events={events} />
      </div>

      {/* Stats Bar */}
      <StatsBar />
    </div>
  );
}
