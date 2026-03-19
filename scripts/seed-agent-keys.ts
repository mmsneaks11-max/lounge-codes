/**
 * Seed agent API keys for the handoff system
 * 
 * Usage: npx ts-node scripts/seed-agent-keys.ts
 * 
 * Generates unique API keys for each agent in format:
 * hk_<agent_id>_<random8chars>
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// ── Agent list ─────────────────────────────────────────────────────────────
const AGENTS = [
  'clawd',
  'electron',
  'dayta',
  'scout',
  'lila',
  'indy',
  'ripley',
  'kay',
  'chip',
  'pixel',
  'marcy',
  'ripley',
  'cairo',
  'june',
  'cleopatra',
  'spoke',
  'oz',
  'ozara',
  'sage',
  'moltbot',
  'clawdbot',
  'chip',
];

// Deduplicate
const UNIQUE_AGENTS = Array.from(new Set(AGENTS));

// ── Helper to generate random string ───────────────────────────────────────
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function seedAgentKeys() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`Seeding ${UNIQUE_AGENTS.length} agents...`);

  const keysToInsert: Array<{
    agent_id: string;
    api_key: string;
    machine: string;
  }> = [];

  for (const agentId of UNIQUE_AGENTS) {
    const randomSuffix = generateRandomString(8);
    const apiKey = `hk_${agentId}_${randomSuffix}`;

    keysToInsert.push({
      agent_id: agentId,
      api_key: apiKey,
      machine: 'unknown',
    });

    console.log(`  Generated: ${agentId} → ${apiKey}`);
  }

  // ── Insert into Supabase ──────────────────────────────────────────────────
  const { error } = await supabase.from('agent_keys').insert(keysToInsert);

  if (error) {
    console.error('Error inserting agent keys:', error.message);
    process.exit(1);
  }

  console.log(`✓ Successfully seeded ${keysToInsert.length} agent keys`);
}

// Run it
seedAgentKeys().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
