'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────

interface Machine {
  id: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline';
  gatewayVersion: string;
  gatewayPort: number;
  agentsRunning: number;
  uptime: string;
}

interface Service {
  name: string;
  url: string;
  location: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

interface Incident {
  date: string;
  description: string;
}

interface Alert {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MACHINES: Machine[] = [
  {
    id: 'mac1',
    hostname: 'Mac1 (Emmanuel)',
    ip: '100.109.230.90',
    status: 'online',
    gatewayVersion: 'OpenClaw 2026.3.13',
    gatewayPort: 18789,
    agentsRunning: 15,
    uptime: '14d 6h 32m',
  },
  {
    id: 'pc1',
    hostname: 'PC1 (Sentry)',
    ip: '100.64.0.1',
    status: 'online',
    gatewayVersion: 'OpenClaw 2026.3.13',
    gatewayPort: 18789,
    agentsRunning: 8,
    uptime: '21d 3h 15m',
  },
  {
    id: 'mac2',
    hostname: 'Mac2 (Backup)',
    ip: '100.100.100.50',
    status: 'online',
    gatewayVersion: 'OpenClaw 2026.3.12',
    gatewayPort: 18789,
    agentsRunning: 6,
    uptime: '3d 18h 42m',
  },
];

const SERVICES: Service[] = [
  {
    name: 'text2list.app',
    url: 'text2list.app',
    location: 'Railway',
    status: 'healthy',
    lastCheck: '2 minutes ago',
  },
  {
    name: 'theagentdeck.ai',
    url: 'theagentdeck.ai',
    location: 'Railway',
    status: 'healthy',
    lastCheck: '2 minutes ago',
  },
  {
    name: 'lounge.codes',
    url: 'lounge.codes',
    location: 'Railway',
    status: 'healthy',
    lastCheck: '1 minute ago',
  },
  {
    name: 'AgentDeck',
    url: '100.109.230.90:3456',
    location: 'Mac1',
    status: 'healthy',
    lastCheck: '45 seconds ago',
  },
  {
    name: 'BlueBubbles',
    url: 'bb.text2list.app',
    location: 'Mac1',
    status: 'degraded',
    lastCheck: '3 minutes ago',
  },
  {
    name: 'Supabase (T2L)',
    url: 'iqdvzlzooozgeapwxaoo',
    location: 'Cloud',
    status: 'healthy',
    lastCheck: '1 minute ago',
  },
  {
    name: 'Supabase (Lounge)',
    url: 'smrivccfqhsqslgxztqe',
    location: 'Cloud',
    status: 'healthy',
    lastCheck: '1 minute ago',
  },
  {
    name: 'IRC',
    url: '127.0.0.1:6667',
    location: 'Mac1',
    status: 'healthy',
    lastCheck: '2 minutes ago',
  },
  {
    name: 'Cloudflare Tunnel',
    url: 'KK Trophy',
    location: 'Global',
    status: 'healthy',
    lastCheck: '3 minutes ago',
  },
];

const INCIDENTS: Incident[] = [
  {
    date: 'Mar 19, 20:21',
    description: 'Gateway restart (config reload)',
  },
  {
    date: 'Mar 19, 17:42',
    description: 'Railway build failure (fixed: DashboardProvider)',
  },
  {
    date: 'Mar 19, 15:30',
    description: 'Discord listener fix (duplicate config)',
  },
  {
    date: 'Mar 18, 22:12',
    description: 'Mac1 gateway restart (exec pairing)',
  },
];

const ALERTS: Alert[] = [
  {
    id: 'alert-1',
    severity: 'warning',
    message: '⚠️ IRC groupPolicy allowlist is empty — group messages silently dropped',
  },
  {
    id: 'alert-2',
    severity: 'warning',
    message: '⚠️ BlueBubbles inbound webhooks returning 404',
  },
  {
    id: 'alert-3',
    severity: 'critical',
    message: '⚠️ Mac2 disk at 88%',
  },
];

// ── Components ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'down' | 'online' | 'offline' }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
    online: 'bg-green-500',
    offline: 'bg-red-500',
  };

  return (
    <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
  );
}

function MachineCard({ machine }: { machine: Machine }) {
  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-slate-900/30 backdrop-blur">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{machine.hostname}</h3>
          <p className="text-sm text-gray-400 font-mono">{machine.ip}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={machine.status} />
          <span className={`text-sm font-medium ${machine.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {machine.status === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Gateway Version</span>
          <span className="text-gray-200 font-mono">{machine.gatewayVersion}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Gateway Port</span>
          <span className="text-gray-200 font-mono">{machine.gatewayPort}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Agents Running</span>
          <span className="text-gray-200 font-mono">{machine.agentsRunning}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime</span>
          <span className="text-gray-200 font-mono">{machine.uptime}</span>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    down: '❌',
  };

  const statusText = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
  };

  const statusColors = {
    healthy: 'text-green-400',
    degraded: 'text-amber-400',
    down: 'text-red-400',
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-slate-800/50 transition">
      <td className="px-4 py-3 font-medium text-gray-100">{service.name}</td>
      <td className="px-4 py-3 text-gray-400 font-mono text-sm">{service.url}</td>
      <td className="px-4 py-3 text-gray-400 text-sm">{service.location}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusDot status={service.status} />
          <span className={`text-sm font-medium ${statusColors[service.status]}`}>
            {statusEmoji[service.status]} {statusText[service.status]}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm">{service.lastCheck}</td>
    </tr>
  );
}

function IncidentTimeline() {
  return (
    <div className="space-y-4">
      {INCIDENTS.map((incident, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
            {idx < INCIDENTS.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-700 mt-2" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-mono text-gray-400">{incident.date}</p>
            <p className="text-gray-200">{incident.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">System Status</h1>
            <p className="text-gray-400">Infrastructure monitoring dashboard</p>
          </div>
          <Link
            href="/war-room"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            ← War Room
          </Link>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {secondsElapsed}s ago
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-700 rounded-lg p-4 bg-slate-900/30">
          <p className="text-gray-400 text-sm">Total Agents</p>
          <p className="text-3xl font-bold text-gray-100">29</p>
        </div>
        <div className="border border-gray-700 rounded-lg p-4 bg-slate-900/30">
          <p className="text-gray-400 text-sm">Commits Today</p>
          <p className="text-3xl font-bold text-gray-100">24+</p>
        </div>
        <div className="border border-gray-700 rounded-lg p-4 bg-slate-900/30">
          <p className="text-gray-400 text-sm">Briefing System</p>
          <p className="text-lg font-semibold text-green-400">Active</p>
          <p className="text-xs text-gray-500">6 AM cron</p>
        </div>
        <div className="border border-gray-700 rounded-lg p-4 bg-slate-900/30">
          <p className="text-gray-400 text-sm">Security Sweep</p>
          <p className="text-lg font-semibold text-amber-400">In Progress</p>
          <p className="text-xs text-gray-500">Ser Magnus</p>
        </div>
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">System Alerts</h2>
          <div className="space-y-3">
            {ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded p-4 ${
                  alert.severity === 'critical'
                    ? 'border-l-red-500 bg-red-950/20'
                    : 'border-l-amber-500 bg-amber-950/20'
                }`}
              >
                <p className={alert.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Machine Status Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Machine Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MACHINES.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      </div>

      {/* Service Health Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Service Health</h2>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-slate-900/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Service</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">URL / Endpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Last Check</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((service, idx) => (
                <ServiceRow key={idx} service={service} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Incidents */}
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Incidents</h2>
        <div className="border border-gray-700 rounded-lg p-6 bg-slate-900/30">
          <IncidentTimeline />
        </div>
      </div>
    </div>
  );
}
