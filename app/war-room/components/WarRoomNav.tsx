'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  emoji: string;
}

const WAR_ROOM_NAV: NavItem[] = [
  { href: '/war-room', label: 'Mission Control', emoji: '🎯' },
  { href: '/war-room/chat', label: 'Comms', emoji: '💬' },
  { href: '/war-room/roster', label: 'Roster', emoji: '👥' },
  { href: '/war-room/shiplog', label: 'Ship Log', emoji: '📦' },
  { href: '/war-room/status', label: 'Status', emoji: '🟢' },
];

export default function WarRoomNav() {
  const pathname = usePathname();

  return (
    <motion.div
      className="war-room-nav-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="war-room-nav-bar">
        {WAR_ROOM_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`nav-item ${isActive ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="nav-emoji">{item.emoji}</span>
                <span className="nav-label">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .war-room-nav-container {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: auto;
        }

        .war-room-nav-bar {
          display: flex;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(10, 10, 15, 0.85);
          border: 1px solid rgba(200, 169, 110, 0.2);
          border-radius: 50px;
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 28px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #999999;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-item:hover {
          color: #c8a96e;
          background: rgba(200, 169, 110, 0.1);
        }

        .nav-item.active {
          background: rgba(200, 169, 110, 0.2);
          color: #d4af37;
          box-shadow: 0 0 16px rgba(212, 175, 55, 0.3);
        }

        .nav-emoji {
          font-size: 1.1rem;
          display: inline-block;
        }

        .nav-label {
          display: inline-block;
        }

        @media (max-width: 768px) {
          .war-room-nav-container {
            bottom: 20px;
          }

          .war-room-nav-bar {
            padding: 10px 16px;
            gap: 8px;
          }

          .nav-item {
            padding: 6px 12px;
            font-size: 0.85rem;
          }

          .nav-label {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
