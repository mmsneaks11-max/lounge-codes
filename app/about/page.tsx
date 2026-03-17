'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#C8A96E', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>The Founder</div>
        <h1 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 48, fontWeight: 400, color: '#E8E8F0', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 24 }}>
          Kreez's Story
        </h1>
        <p style={{ fontSize: 16, color: '#6B6B80', lineHeight: 1.8, marginBottom: 48 }}>
          The founder story is coming soon. Check back here when it's ready.
        </p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 13, color: '#C8A96E', borderBottom: '1px solid rgba(200,169,110,0.3)', paddingBottom: 2 }}>
            ← Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}
