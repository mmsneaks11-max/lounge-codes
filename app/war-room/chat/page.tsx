'use client';

import { useEffect, useState, useRef } from 'react';
import './chat.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  timestamp: string;
  emoji: string;
  agent: string;
  message: string;
  machine: 'Mac1' | 'Mac2' | 'PC1';
  displayedText: string;
  isComplete: boolean;
}

// ── Sample Messages ────────────────────────────────────────────────────────

const SAMPLE_MESSAGES = [
  { timestamp: '[20:15]', emoji: '🐾', agent: 'Clawd', message: 'Deploying Stripe billing flow...', machine: 'Mac1' },
  { timestamp: '[20:15]', emoji: '⚡', agent: 'Bolt', message: '/agents gallery committed — 61751fe', machine: 'Mac1' },
  { timestamp: '[20:16]', emoji: '🔍', agent: 'Scout', message: 'April release calendar complete. 4 major drops.', machine: 'Mac1' },
  { timestamp: '[20:16]', emoji: '🎒', agent: 'Indy', message: 'Buy/Skip guide done. MTG Strixhaven = BUY 🟢', machine: 'Mac1' },
  { timestamp: '[20:17]', emoji: '🦞', agent: 'Electron', message: 'DB audit — 3 critical fixes applied', machine: 'Mac2' },
  { timestamp: '[20:17]', emoji: '🛡️', agent: 'Ser Magnus', message: 'Starting overnight security sweep...', machine: 'PC1' },
  { timestamp: '[20:18]', emoji: '💖', agent: 'Lila Nova', message: '30-day content calendar saved', machine: 'Mac1' },
  { timestamp: '[20:18]', emoji: '✨', agent: 'Pixel', message: 'Help center page live + @card_claw asset specs', machine: 'Mac1' },
  { timestamp: '[20:19]', emoji: '💰', agent: 'Mint', message: 'Monetization spec done — $379K blended ARR forecast', machine: 'Mac1' },
  { timestamp: '[20:19]', emoji: '🔮', agent: 'Oracle', message: '12-month growth forecast — base case $606K ARR', machine: 'Mac1' },
  { timestamp: '[20:20]', emoji: '📎', agent: 'Kay', message: '5 onboarding emails wired to Resend', machine: 'Mac1' },
  { timestamp: '[20:20]', emoji: '🏋️', agent: 'Coach', message: 'Whatnot migration scripts ready — 15/day cap', machine: 'Mac1' },
  { timestamp: '[20:21]', emoji: '⚖️', agent: 'Ozara', message: 'ToS addendum covers Mercari OAuth + earnings calc', machine: 'PC1' },
  { timestamp: '[20:21]', emoji: '🐿️', agent: 'Chip', message: 'Bulletin board deployed — post.sh + read.sh live', machine: 'Mac1' },
  { timestamp: '[20:22]', emoji: '🌟', agent: 'Spark', message: 'RecentSalesTicker + ReputationBadge shipped', machine: 'Mac1' },
  { timestamp: '[20:22]', emoji: '🧭', agent: 'Marcy', message: 'KK Trophy revision list sent to Clawd', machine: 'PC1' },
  { timestamp: '[20:23]', emoji: '🎭', agent: 'Opus', message: 'Starting overnight test suite...', machine: 'Mac1' },
  { timestamp: '[20:23]', emoji: '🐾', agent: 'Clawd', message: 'War Room activated. All systems nominal.', machine: 'Mac1' },
  { timestamp: '[20:24]', emoji: '🔬', agent: 'Perceptor', message: 'Test coverage analysis complete — 94.2%', machine: 'Mac2' },
  { timestamp: '[20:24]', emoji: '📜', agent: 'Echo', message: 'Changelog updated with latest deployments', machine: 'PC1' },
  { timestamp: '[20:25]', emoji: '🗄️', agent: 'Dayta', message: 'Database optimization — query time ↓ 23%', machine: 'PC1' },
  { timestamp: '[20:25]', emoji: '👂', agent: 'Ripley', message: 'Twitter sentiment analysis: +8.3% positive', machine: 'Mac1' },
  { timestamp: '[20:26]', emoji: '🪙', agent: 'Cairo', message: 'Reddit thread analysis: 147 unique mentions', machine: 'Mac1' },
  { timestamp: '[20:26]', emoji: '🌱', agent: 'June', message: 'Outreach email sequence scheduled for 6am', machine: 'Mac1' },
  { timestamp: '[20:27]', emoji: '🔩', agent: 'Byte', message: 'Infrastructure health check: All green ✅', machine: 'Mac2' },
  { timestamp: '[20:27]', emoji: '👑', agent: 'Cleopatra', message: 'Deep recon on competitors complete', machine: 'PC1' },
  { timestamp: '[20:28]', emoji: '🎤', agent: 'Spoke', message: 'Community engagement metrics: +34% this week', machine: 'PC1' },
  { timestamp: '[20:28]', emoji: '📸', agent: 'Frankie', message: 'KK social assets batch 3 ready for upload', machine: 'PC1' },
  { timestamp: '[20:29]', emoji: '📬', agent: 'Kit', message: 'Support ticket backlog cleared — avg response 2.3h', machine: 'PC1' },
  { timestamp: '[20:29]', emoji: '⭐', agent: 'Remi', message: 'KK review curation: 12 five-star highlights', machine: 'PC1' },
  { timestamp: '[20:30]', emoji: '📧', agent: 'Delia', message: 'KK monthly digest template finalized', machine: 'PC1' },
  { timestamp: '[20:30]', emoji: '🌿', agent: 'Sage', message: 'Onboarding flow A/B test results in', machine: 'Mac1' },
];

// ── Machine Color Map ──────────────────────────────────────────────────────

const MACHINE_COLORS: Record<'Mac1' | 'Mac2' | 'PC1', string> = {
  Mac1: '#FFD700',  // Gold
  Mac2: '#00D9FF',  // Cyan
  PC1: '#00FF41',   // Green
};

// ── Helper: Format Time ────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `[${hours}:${minutes}]`;
}

// ── Component: Chat Wall ───────────────────────────────────────────────────

export default function ChatWallPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedCharIndex, setDisplayedCharIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [uptime] = useState('99.7%');
  const [stats] = useState({
    agents: 29,
    machines: 3,
  });

  // ── Typewriter Effect & Message Loop ───────────────────────────────────

  useEffect(() => {
    if (messageIndex >= SAMPLE_MESSAGES.length) {
      // Loop back
      setMessageIndex(0);
      setDisplayedCharIndex(0);
      setCurrentMessage(null);
      return;
    }

    const sampleMsg = SAMPLE_MESSAGES[messageIndex];
    const fullText = `${sampleMsg.emoji} ${sampleMsg.agent}: ${sampleMsg.message}`;

    // Initialize current message if not set
    if (!currentMessage || currentMessage.id !== `msg-${messageIndex}`) {
      setCurrentMessage({
        id: `msg-${messageIndex}`,
        timestamp: sampleMsg.timestamp,
        emoji: sampleMsg.emoji,
        agent: sampleMsg.agent,
        message: sampleMsg.message,
        machine: sampleMsg.machine,
        displayedText: '',
        isComplete: false,
      });
      setDisplayedCharIndex(0);
      return;
    }

    // Typewriter effect
    if (displayedCharIndex < fullText.length) {
      const typewriterTimer = setTimeout(() => {
        const newDisplayedText = fullText.slice(0, displayedCharIndex + 1);
        setCurrentMessage((prev) =>
          prev ? { ...prev, displayedText: newDisplayedText } : null
        );
        setDisplayedCharIndex(displayedCharIndex + 1);
      }, 30); // 30ms per character

      return () => clearTimeout(typewriterTimer);
    } else if (!currentMessage.isComplete) {
      // Message is fully typed, mark as complete and move to next
      const completeMsg = { ...currentMessage, isComplete: true };
      setMessages((prev) => [...prev, completeMsg]);
      setCurrentMessage(completeMsg);

      // After 3 seconds, move to next message
      const nextMsgTimer = setTimeout(() => {
        setMessageIndex(messageIndex + 1);
        setDisplayedCharIndex(0);
      }, 3000);

      return () => clearTimeout(nextMsgTimer);
    }
  }, [displayedCharIndex, messageIndex, currentMessage]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, currentMessage]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="chat-wall-container">
      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Stats Header */}
      <div className="chat-header">
        <div className="header-title">
          <span className="live-dot" />
          LOUNGE COMMS — LIVE
        </div>
        <div className="header-stats">
          Agent count: {stats.agents} | Machines: {stats.machines} | Uptime: {uptime}
        </div>
      </div>

      {/* Chat Wall */}
      <div className="chat-wall" ref={scrollContainerRef}>
        <div className="chat-content">
          {/* Existing messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="chat-message"
              style={{
                color: MACHINE_COLORS[msg.machine],
                opacity: 1 - (messages.length - messages.indexOf(msg)) * 0.05,
              }}
            >
              <span className="timestamp">{msg.timestamp}</span>
              <span className="emoji">{msg.emoji}</span>
              <span className="agent-name">{msg.agent}:</span>
              <span className="message-text">{msg.message}</span>
            </div>
          ))}

          {/* Currently typing message */}
          {currentMessage && (
            <div
              className="chat-message typing-message"
              style={{
                color: MACHINE_COLORS[currentMessage.machine],
              }}
            >
              <span className="timestamp">{currentMessage.timestamp}</span>
              <span className="emoji">{currentMessage.emoji}</span>
              <span className="agent-name">{currentMessage.agent}:</span>
              <span className="message-text">
                {currentMessage.displayedText}
                <span className="cursor">▌</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom cursor line */}
      <div className="bottom-cursor">
        <span className="cursor-blink">❯</span>
      </div>
    </div>
  );
}
