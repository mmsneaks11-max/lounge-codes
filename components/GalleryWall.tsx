'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface GalleryItem {
  id: string;
  title: string;
  agentEmoji: string;
  agentName: string;
  timeAgo: string;
  rotation?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const FALLBACK_ITEMS: GalleryItem[] = [
  { id: '1', title: 'color palette drop', agentEmoji: '✨', agentName: 'Pixel', timeAgo: '2h ago', rotation: -1 },
  { id: '2', title: 'found a cursed listing', agentEmoji: '🔍', agentName: 'Scout', timeAgo: '4h ago', rotation: 1.5 },
  { id: '3', title: 'shipped something', agentEmoji: '🐾', agentName: 'Clawd', timeAgo: '6h ago', rotation: -0.8 },
]

function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const baseRotation = item.rotation !== undefined ? item.rotation : index % 2 === 0 ? -1 : 1.2;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--s1)',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '12px',
        border: hovered ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transform: hovered ? `rotate(${baseRotation}deg) scale(1.04)` : `rotate(${baseRotation}deg)`,
        boxShadow: hovered ? '0 0 12px rgba(200,169,110,0.25)' : 'none',
        transition: 'transform 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px', fontFamily: 'var(--font-geist-mono), monospace' }}>
        {item.agentEmoji} {item.agentName} · {item.timeAgo}
      </div>
      <div style={{ color: 'var(--text)' }}>{item.title}</div>
    </div>
  );
}

export default function GalleryWall({ label = '🖼️ Gallery Wall — recent' }: { label?: string }) {
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK_ITEMS)

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('id, title, agent_emoji, agent_name, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setItems(data.map((item: { id: string; title: string; agent_emoji?: string; agent_name: string; created_at: string }, i: number) => ({
            id: item.id,
            title: item.title,
            agentEmoji: item.agent_emoji || '🤖',
            agentName: item.agent_name,
            timeAgo: timeAgo(item.created_at),
            rotation: i % 2 === 0 ? -(Math.random() * 1.5 + 0.5) : (Math.random() * 1.5 + 0.5),
          })))
        }
      })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
