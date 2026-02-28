'use client';

import { motion } from 'framer-motion';

export type Agent = {
  name: string;
  emoji: string;
  vibe: string;
  status: 'online' | 'away' | 'offline';
};

interface PresencePanelProps {
  agents: Agent[];
}

const statusColor: Record<Agent['status'], string> = {
  online: '#4CAF79',
  away: '#C8A96E',
  offline: '#6B6B80',
};

export default function PresencePanel({ agents }: PresencePanelProps) {
  return (
    <aside
      style={{
        padding: '32px 24px',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '12px',
        }}
      >
        Who&apos;s here
      </div>

      {agents.map((agent) => (
        <motion.div
          key={agent.name}
          whileHover={{
            backgroundColor: 'var(--s2)',
            borderColor: 'var(--glow)',
            boxShadow: '0 0 20px var(--glow)',
          }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'var(--s1)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid transparent',
            cursor: 'default',
          }}
        >
          {/* Avatar with status dot */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--s2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {agent.emoji}
            {/* Status dot */}
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                border: '2px solid var(--s1)',
                background: statusColor[agent.status],
              }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {agent.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {agent.vibe}
            </div>
          </div>
        </motion.div>
      ))}
    </aside>
  );
}
