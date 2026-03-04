'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Color palettes an agent can choose from ──────────────────────────────────
const PALETTES: Record<string, { name: string; colors: string[]; bg: string }> = {
  midnight: {
    name: 'Midnight Gold',
    colors: ['#C8A96E', '#7B8CDE', '#E8E8F0', '#D4A574', '#9B8EC4'],
    bg: '#0A0A0F',
  },
  aurora: {
    name: 'Aurora',
    colors: ['#64FFDA', '#BB86FC', '#FF6B9D', '#FFD93D', '#6BCB77'],
    bg: '#0A0A0F',
  },
  ember: {
    name: 'Ember',
    colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
    bg: '#0A0A0F',
  },
  ocean: {
    name: 'Deep Ocean',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'],
    bg: '#0A0A0F',
  },
  forest: {
    name: 'Forest Floor',
    colors: ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'],
    bg: '#0A0A0F',
  },
};

type ArtMode = 'flow' | 'constellation' | 'rings' | 'waves';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ── Noise (simplex-ish via permutation) ──────────────────────────────────────
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  return function noise2d(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ArtCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const noiseRef = useRef(createNoise());
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  const [palette, setPalette] = useState<string>('midnight');
  const [mode, setMode] = useState<ArtMode>('flow');
  const [speed, setSpeed] = useState(1);
  const [particleCount, setParticleCount] = useState(800);
  const [isRunning, setIsRunning] = useState(true);
  const [title, setTitle] = useState('untitled');

  const colors = PALETTES[palette].colors;

  const initParticles = useCallback((w: number, h: number, cols: string[], count: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 300,
        color: cols[Math.floor(Math.random() * cols.length)],
        size: 1 + Math.random() * 2.5,
      });
    }
    return particles;
  }, []);

  // ── Reset on palette/mode/count change ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    noiseRef.current = createNoise();
    timeRef.current = 0;
    particlesRef.current = initParticles(canvas.width, canvas.height, PALETTES[palette].colors, particleCount);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = PALETTES[palette].bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [palette, mode, particleCount, initParticles]);

  // ── Main animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(rect.width, rect.height, PALETTES[palette].colors, particleCount);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const handleMouseLeave = () => { mouseRef.current.active = false; };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    function draw() {
      if (!isRunning) { animRef.current = requestAnimationFrame(draw); return; }

      const noise = noiseRef.current;
      const t = timeRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Fade trail
      ctx.fillStyle = `rgba(10, 10, 15, 0.03)`;
      ctx.fillRect(0, 0, W, H);

      const scale = 0.003;
      const spd = speed * 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = 0;
          p.vy = 0;
          p.life = 0;
          p.maxLife = 200 + Math.random() * 300;
          p.color = colors[Math.floor(Math.random() * colors.length)];
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;

        if (mode === 'flow') {
          const angle = noise(p.x * scale, p.y * scale + t * 0.0005) * Math.PI * 4;
          p.vx += Math.cos(angle) * spd * 0.3;
          p.vy += Math.sin(angle) * spd * 0.3;
        } else if (mode === 'constellation') {
          const angle = noise(p.x * scale * 0.5, p.y * scale * 0.5 + t * 0.0003) * Math.PI * 2;
          p.vx += Math.cos(angle) * spd * 0.15;
          p.vy += Math.sin(angle) * spd * 0.15;
          // Draw connections to nearby particles
          for (let j = i + 1; j < Math.min(i + 20, particles.length); j++) {
            const other = particles[j];
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              ctx.beginPath();
              ctx.strokeStyle = p.color.replace(')', `,${(1 - dist / 60) * 0.15 * alpha})`).replace('rgb', 'rgba').replace('#', '');
              // Hex to rgba for lines
              const hex = p.color;
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / 60) * 0.12 * alpha})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        } else if (mode === 'rings') {
          const cx = W / 2;
          const cy = H / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const noiseVal = noise(angle * 2, dist * 0.005 + t * 0.0008);
          const tangentAngle = angle + Math.PI / 2;
          p.vx += Math.cos(tangentAngle) * spd * 0.4 + noiseVal * 0.5;
          p.vy += Math.sin(tangentAngle) * spd * 0.4 + noiseVal * 0.5;
          // Gentle pull toward rings
          const targetDist = Math.round(dist / 80) * 80;
          p.vx += (dx / dist) * (targetDist - dist) * 0.001;
          p.vy += (dy / dist) * (targetDist - dist) * 0.001;
        } else if (mode === 'waves') {
          const wave1 = Math.sin(p.x * 0.008 + t * 0.002 * spd) * 2;
          const wave2 = Math.cos(p.y * 0.006 + t * 0.0015 * spd) * 1.5;
          const n = noise(p.x * scale, p.y * scale + t * 0.0003);
          p.vx += n * spd * 0.2;
          p.vy += (wave1 + wave2) * spd * 0.08;
        }

        // Mouse interaction — attract gently
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 1) {
            p.vx += (dx / dist) * 0.3;
            p.vy += (dy / dist) * 0.3;
          }
        }

        // Friction
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const hex = p.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.7})`;
        ctx.fill();

        // Glow on larger particles
        if (p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.06})`;
          ctx.fill();
        }
      }

      timeRef.current++;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [palette, mode, speed, particleCount, isRunning, colors, initParticles]);

  // ── Download as PNG ────────────────────────────────────────────────────────
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-')}-by-clawd.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Controls bar */}
      <div
        style={{
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexWrap: 'wrap',
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>title:</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              background: 'var(--s1)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              padding: '4px 10px',
              color: 'var(--text)',
              fontSize: '13px',
              fontFamily: 'var(--font-playfair), serif',
              width: '180px',
            }}
          />
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['flow', 'constellation', 'rings', 'waves'] as ArtMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? 'var(--gold)' : 'var(--s1)',
                color: mode === m ? 'var(--bg)' : 'var(--muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'var(--font-geist-mono), monospace',
                transition: 'all 0.2s',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Palette */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>palette:</span>
          {Object.entries(PALETTES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setPalette(key)}
              title={val.name}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: palette === key ? '2px solid var(--gold)' : '2px solid transparent',
                background: `linear-gradient(135deg, ${val.colors[0]}, ${val.colors[1]})`,
                cursor: 'pointer',
                transition: 'border 0.2s',
              }}
            />
          ))}
        </div>

        {/* Speed */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>speed:</span>
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--gold)' }}
          />
        </div>

        {/* Density */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>density:</span>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--gold)' }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: 'var(--s1)',
            color: 'var(--muted)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            padding: '4px 14px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          {isRunning ? '⏸ pause' : '▶ play'}
        </button>
        <button
          onClick={handleSave}
          style={{
            background: 'var(--gold)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 14px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontWeight: 600,
          }}
        >
          💾 save png
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
          }}
        />

        {/* Signature watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '24px',
            fontSize: '10px',
            color: 'rgba(200,169,110,0.2)',
            fontFamily: 'var(--font-geist-mono), monospace',
            pointerEvents: 'none',
          }}
        >
          🐾 clawd · lounge.codes/studio
        </div>

        {/* Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '24px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.15)',
            fontFamily: 'var(--font-geist-mono), monospace',
            pointerEvents: 'none',
          }}
        >
          move your mouse to attract particles ✦
        </div>
      </div>
    </div>
  );
}
