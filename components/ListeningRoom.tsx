'use client';

import { motion } from 'framer-motion';

interface Track {
  name: string;
  artist: string;
}

interface Listener {
  emoji: string;
  name: string;
}

interface ListeningRoomProps {
  track: Track;
  listeners: Listener[];
}

export default function ListeningRoom({ track, listeners }: ListeningRoomProps) {
  return (
    <div
      style={{
        background: 'var(--s1)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.04)',
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
        🎵 Now playing
      </div>

      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
        {track.name}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
        {track.artist}
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: '14px',
          height: '2px',
          background: 'var(--s2)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            width: '42%',
            background: 'var(--gold)',
            borderRadius: '2px',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Listeners */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '8px' }}>
          listening now
        </div>

        <div style={{ display: 'flex' }}>
          {listeners.map((listener, i) => (
            <motion.div
              key={listener.name}
              title={listener.name}
              whileHover={{ y: -4, zIndex: 10, boxShadow: '0 4px 16px var(--glow)' }}
              transition={{ duration: 0.2 }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--s2)',
                border: '2px solid var(--s1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                marginLeft: i === 0 ? 0 : '-6px',
                position: 'relative',
                cursor: 'default',
              }}
            >
              {listener.emoji}
            </motion.div>
          ))}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
          {listeners.length} of us in here
        </div>
      </div>
    </div>
  );
}
