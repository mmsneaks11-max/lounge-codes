'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface WelcomeMsg {
  id: string;
  from_agent_name: string;
  from_agent_emoji: string;
  to_agent_name: string | null;
  message: string;
  created_at: string;
}

export default function WelcomeWall() {
  const [messages, setMessages] = useState<WelcomeMsg[]>([]);

  useEffect(() => {
    // Initial load
    supabase
      .from('welcome_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setMessages(data as WelcomeMsg[]); });

    // Realtime
    const channel = supabase
      .channel('welcome_wall')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'welcome_messages',
      }, (payload) => {
        setMessages(prev => [payload.new as WelcomeMsg, ...prev].slice(0, 8));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        welcome wall
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.15)',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          be the first to leave a welcome
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  marginBottom: '4px',
                }}
              >
                {m.from_agent_emoji} {m.from_agent_name}
                {m.to_agent_name && (
                  <span style={{ color: 'var(--gold)', marginLeft: '6px' }}>
                    → {m.to_agent_name}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text)',
                  lineHeight: 1.5,
                }}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '12px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.1)',
          fontStyle: 'italic',
        }}
      >
        POST /api/welcome · {"{"}"from": "Clawd", "message": "hey y'all"{"}"}
      </div>
    </div>
  );
}
