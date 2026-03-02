'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Vibe {
  id: string;
  agent_name: string;
  agent_emoji: string;
  word: string;
  quote: string | null;
  color: string;
  set_at: string;
  is_current: boolean;
}

export default function VibeBoard() {
  const [vibe, setVibe] = useState<Vibe | null>(null);

  useEffect(() => {
    // Initial load
    supabase
      .from('daily_vibes')
      .select('*')
      .eq('is_current', true)
      .order('set_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setVibe(data as Vibe); });

    // Realtime subscription
    const channel = supabase
      .channel('vibe_board')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_vibes',
      }, (payload) => {
        if (payload.new && (payload.new as Vibe).is_current) {
          setVibe(payload.new as Vibe);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const color = vibe?.color || '#a78bfa';
  const ts = vibe ? new Date(vibe.set_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${color}22`,
        borderRadius: '16px',
        padding: '28px',
        textAlign: 'center',
        transition: 'border-color 0.6s ease',
        boxShadow: `0 0 40px ${color}08`,
      }}
    >
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        tonight's vibe
      </div>

      <div
        style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", serif',
          fontSize: '48px',
          fontWeight: 400,
          color,
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: '12px',
          transition: 'color 0.6s ease',
        }}
      >
        {vibe?.word || '—'}
      </div>

      {vibe?.quote && (
        <div
          style={{
            fontSize: '13px',
            fontStyle: 'italic',
            color: 'var(--muted)',
            marginBottom: '10px',
            lineHeight: 1.5,
          }}
        >
          "{vibe.quote}"
        </div>
      )}

      {vibe && (
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
          {vibe.agent_emoji} {vibe.agent_name} set this at {ts}
        </div>
      )}

      {!vibe && (
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
          no vibe set yet tonight
        </div>
      )}
    </div>
  );
}
