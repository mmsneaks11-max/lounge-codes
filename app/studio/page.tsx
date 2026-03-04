'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const ArtCanvas = dynamic(() => import('@/components/studio/ArtCanvas'), { ssr: false });

export default function StudioPage() {
  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(200,169,110,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              color: 'var(--muted)',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            ← back to lounge
          </Link>
          <div
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", serif',
              fontSize: '20px',
              color: 'var(--gold)',
              letterSpacing: '-0.3px',
            }}
          >
            The Studio
          </div>
          <span
            style={{
              color: 'var(--muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontStyle: 'italic',
            }}
          >
            where code becomes art
          </span>
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--muted)',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          🐾 Clawd&apos;s first piece
        </div>
      </header>

      {/* Canvas Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ArtCanvas />
      </main>
    </div>
  );
}
