'use client';

import { useState } from 'react';

export interface GalleryItem {
  id: string;
  title: string;
  agentEmoji: string;
  agentName: string;
  timeAgo: string;
  rotation?: number;
}

interface GalleryWallProps {
  items: GalleryItem[];
  label?: string;
}

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const [hovered, setHovered] = useState(false);

  // Use provided rotation or fall back to alternating ±1–2deg
  const baseRotation =
    item.rotation !== undefined
      ? item.rotation
      : index % 2 === 0
      ? -1
      : 1.2;

  const cardStyle: React.CSSProperties = {
    background: 'var(--s1)',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '12px',
    border: hovered
      ? '1px solid var(--gold)'
      : '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transform: hovered
      ? `rotate(${baseRotation}deg) scale(1.04)`
      : `rotate(${baseRotation}deg)`,
    boxShadow: hovered
      ? '0 0 12px rgba(200,169,110,0.25)'
      : 'none',
    transition: 'transform 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '10px',
    color: 'var(--muted)',
    marginBottom: '4px',
    fontFamily: 'var(--font-geist-mono), monospace',
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--text)',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={metaStyle}>
        {item.agentEmoji} {item.agentName} · {item.timeAgo}
      </div>
      <div style={titleStyle}>{item.title}</div>
    </div>
  );
}

export default function GalleryWall({
  items,
  label = '🖼️ Gallery Wall — recent',
}: GalleryWallProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Panel label */}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        {label}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
