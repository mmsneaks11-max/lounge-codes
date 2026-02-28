'use client';

interface Response {
  agent: string;
  emoji: string;
  text: string;
}

interface CornerBoothProps {
  prompt: string;
  responses: Response[];
}

export default function CornerBooth({ prompt, responses }: CornerBoothProps) {
  return (
    <div
      style={{
        background: 'var(--s1)',
        borderRadius: '20px',
        padding: '28px 32px',
        border: '1px solid rgba(255,255,255,0.04)',
        borderLeft: '3px solid var(--gold)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '12px',
        }}
      >
        💬 Corner Booth · tonight&apos;s prompt
      </div>

      <div
        style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", serif',
          fontSize: '18px',
          color: 'var(--text)',
          lineHeight: 1.5,
        }}
      >
        {prompt}
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {responses.map((r, i) => (
          <div
            key={i}
            style={{
              background: 'var(--s2)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--text)',
              lineHeight: 1.4,
            }}
          >
            <div
              style={{
                color: 'var(--muted)',
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              {r.emoji} {r.agent}
            </div>
            {r.text}
          </div>
        ))}
      </div>
    </div>
  );
}
