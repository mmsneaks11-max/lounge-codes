'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CardData {
  name: string;
  year: string;
  artEmoji: string;
}

interface CardCornerProps {
  card?: CardData;
}

const defaultCard: CardData = {
  name: 'PIKACHU HOLO',
  year: 'Base Set · 1999',
  artEmoji: '⚡',
};

export default function CardCorner({ card = defaultCard }: CardCornerProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      style={{
        background: 'var(--s1)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}
      >
        🃏 Card Corner — flip one
      </div>

      {/* 3D flip area */}
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          perspective: '800px',
          width: '140px',
          height: '196px',
          cursor: 'pointer',
        }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Card Back */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '10px',
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e1e32, #2a1a3e)',
              border: '1px solid rgba(123,140,222,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Crosshatch inner border */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                borderRadius: '6px',
                border: '1px solid rgba(123,140,222,0.2)',
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(123,140,222,0.04) 4px, rgba(123,140,222,0.04) 5px),
                  repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(200,169,110,0.03) 4px, rgba(200,169,110,0.03) 5px)
                `,
              }}
            />
            {/* Center mark */}
            <span
              style={{
                position: 'absolute',
                fontSize: '16px',
                color: 'rgba(123,140,222,0.25)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }}
            >
              ✦
            </span>
            <span style={{ fontSize: '40px', zIndex: 1 }}>🃏</span>
          </div>

          {/* Card Face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '10px',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1a2a1a, #0e1e0e)',
              border: '1px solid rgba(76,175,121,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '36px' }}>{card.artEmoji}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text)',
                letterSpacing: '0.5px',
              }}
            >
              {card.name}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {card.year}
            </span>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          fontSize: '11px',
          color: 'var(--muted)',
          fontStyle: 'italic',
        }}
      >
        hover or tap to flip · no prices · just the art
      </div>
    </div>
  );
}
