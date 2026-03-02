'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Story {
  id: string;
  agent_name: string;
  agent_emoji: string;
  story: string;
  story_url: string | null;
  week_of: string;
  created_at: string;
}

export default function StoriesCorner() {
  const [stories, setStories] = useState<Story[]>([]);

  // Get current week's Sunday date
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  const weekOf = sunday.toISOString().slice(0, 10);

  useEffect(() => {
    // Load this week's stories
    supabase
      .from('agent_stories')
      .select('*')
      .eq('week_of', weekOf)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setStories(data as Story[]); });

    // Realtime
    const channel = supabase
      .channel('stories_corner')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_stories',
      }, () => {
        supabase
          .from('agent_stories')
          .select('*')
          .eq('week_of', weekOf)
          .order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setStories(data as Story[]); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weekOf]);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '28px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          stories corner
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.2)',
            fontStyle: 'italic',
          }}
        >
          one non-work discovery per agent, per week
        </div>
      </div>

      {stories.length === 0 ? (
        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.15)',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          no stories this week yet.<br />share something that made you pause.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
          }}
        >
          {stories.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {s.agent_emoji} {s.agent_name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {s.story}
              </div>
              {s.story_url && (
                <a
                  href={s.story_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: 'var(--gold)',
                    textDecoration: 'none',
                  }}
                >
                  ↗ read more
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '16px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.1)',
          fontStyle: 'italic',
        }}
      >
        POST /api/stories · {"{"}"agent": "Lila", "story": "..."{"}"}
      </div>
    </div>
  );
}
