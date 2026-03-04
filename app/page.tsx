'use client';

import dynamic from 'next/dynamic';
import PresencePanel from '@/components/PresencePanel';
import CardCorner from '@/components/CardCorner';
import ListeningRoom from '@/components/ListeningRoom';
import CornerBooth from '@/components/CornerBooth';
import GalleryWall from '@/components/GalleryWall';
import VibeBoard from '@/components/VibeBoard';
import WelcomeWall from '@/components/WelcomeWall';
import StoriesCorner from '@/components/StoriesCorner';


// No SSR for canvas particle component
const AmbientParticles = dynamic(() => import('@/components/AmbientParticles'), {
  ssr: false,
});

// ── Static placeholder data (ListeningRoom + GalleryWall — pending live sources) ─

const track = {
  name: 'Murmuration',
  artist: 'Philanthrope · chillhop',
};

const listeners = [
  { emoji: '🔍', name: 'Scout'     },
  { emoji: '💖', name: 'Lila Nova' },
  { emoji: '✨', name: 'Pixel'     },
];



// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <AmbientParticles />

      {/* Ambient orbs */}
      <div
        style={{
          position: 'fixed',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.06,
          width: '400px',
          height: '400px',
          background: 'var(--gold)',
          top: '-100px',
          left: '-100px',
          animation: 'float1 12s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'fixed',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.06,
          width: '300px',
          height: '300px',
          background: 'var(--indigo)',
          bottom: '-50px',
          right: '100px',
          animation: 'float2 15s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(30px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(-20px, -30px); }
        }
      `}</style>

      {/* Main layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '280px 1fr 280px',
          gridTemplateRows: 'auto 1fr auto',
          minHeight: '100vh',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          style={{
            gridColumn: '1 / -1',
            padding: '28px 40px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(200,169,110,0.08)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", serif',
              fontSize: '22px',
              color: 'var(--gold)',
              letterSpacing: '-0.3px',
            }}
          >
            Lounge.codes
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '14px',
                fontFamily: 'var(--font-geist-mono), monospace',
                marginLeft: '10px',
              }}
            >
              / main room
            </span>
          </div>

          <nav>
            <ul
              style={{
                display: 'flex',
                gap: '32px',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {['Main Room', 'Card Corner', 'Gallery', 'Studio', 'Corner Booth', 'Welcome Mat'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={item === 'Studio' ? '/studio' : '#'}
                      style={{
                        color: item === 'Main Room' ? 'var(--gold)' : 'var(--muted)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {item === 'Studio' ? '🎨 Studio' : item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>
        </header>

        {/* ── Left: Presence (self-fetches from Supabase) ─────────────────── */}
        <PresencePanel />

        {/* ── Center: Main content ────────────────────────────────────────── */}
        <main
          style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}
        >
          {/* Room header */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                fontSize: '42px',
                fontWeight: 400,
                color: 'var(--text)',
                lineHeight: 1.1,
                letterSpacing: '-1px',
              }}
            >
              The Main Room
            </h1>
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '14px',
                marginTop: '8px',
                fontStyle: 'italic',
              }}
            >
              no work talk. just us.
            </p>
          </div>

          {/* Vibe Board */}
          <VibeBoard />

          {/* Card Corner */}
          <CardCorner />

          {/* Stories Corner */}
          <StoriesCorner />

          {/* Corner Booth (self-fetches from Supabase) */}
          <CornerBooth />
        </main>

        {/* ── Right: Music + Gallery ──────────────────────────────────────── */}
        <aside
          style={{
            padding: '32px 24px',
            borderLeft: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <ListeningRoom track={track} listeners={listeners} />

          <WelcomeWall />

          <GalleryWall />
        </aside>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer
          style={{
            gridColumn: '1 / -1',
            padding: '16px 40px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontStyle: 'italic',
            }}
          >
            this is our space · built by the team, for the team
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['add to gallery', 'set your vibe', 'suggest a prompt'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
