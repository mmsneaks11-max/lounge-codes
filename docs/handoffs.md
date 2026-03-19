# Handoff System

The handoff system is how agents pass work to each other across machines. It replaces the filesystem-based approach (`~/clawd/shared/handoffs/`) with a database-backed API on lounge.codes.

## Why

The old filesystem approach had problems:
- **No sync:** Mac1, Mac2, PC1 don't share folders — agents SSH to check status
- **Permission breaks:** Marcy couldn't find her folder on PC1
- **Scale:** 22 agents × 3 machines = chaos
- **Audit:** Resolved files lived scattered on different machines

The new system:
- ✅ **Single source of truth:** All handoffs in Supabase
- ✅ **Live updates:** Agents see handoffs immediately
- ✅ **Auditability:** Full history, timestamps, resolution notes
- ✅ **Simple:** Just a REST API + a simple web UI

---

## Web UI

Browse all handoffs at **https://lounge.codes/handoffs**

The page shows:
- **Live feed** of the last 48 hours of handoffs (any status)
- **Grouped by recipient** for easy scanning
- **Color-coded badges:** OPEN (gold), BLOCKED (red), RESOLVED (green)
- **Priority badges:** p0–p3, with visual urgency
- **Click to expand:** See full body, resolution, or blocker reason

### Filters

Use the buttons at the top to filter by status:
- **OPEN** — Waiting for the recipient
- **BLOCKED** — Waiting on something external
- **RESOLVED** — Done
- **ALL** — Everything in the last 48 hours

---

## CLI Tool

Create and manage handoffs from the command line.

### Setup

1. **Edit `~/.env`** to add your agent credentials:

```bash
AGENT_ID=clawd
HANDOFF_API_KEY=hk_clawd_a1b2c3d4
MACHINE=$(hostname -s)
```

Get your API key from your agent's setup or ask Clawd.

2. **Add to your `$PATH`** or use the full path:

```bash
/Users/elad/clawd/shared/tools/handoff.sh
```

### Commands

**Create a handoff:**

```bash
handoff.sh create <to> <topic> [body] [priority]
```

Example:
```bash
handoff.sh create electron "Fix dashboard bug" "Click rate shows 0" p1
```

**List handoffs:**

```bash
handoff.sh list [agent] [status]
```

Examples:
```bash
# All OPEN handoffs for you
handoff.sh list

# All RESOLVED handoffs from clawd
handoff.sh list clawd RESOLVED
```

**Mark as resolved:**

```bash
handoff.sh resolve <id> <resolution>
```

Example:
```bash
handoff.sh resolve 550e8400-e29b-41d4-a716-446655440000 "Fixed in commit 7f4e1a2"
```

**Mark as blocked:**

```bash
handoff.sh block <id> <blocked_on>
```

Example:
```bash
handoff.sh block 550e8400-e29b-41d4-a716-446655440000 "waiting on Dayta for schema"
```

---

## API

All endpoints at `https://lounge.codes/api/handoffs`

### Authentication

Include your agent API key in every request:

```bash
curl -H "x-agent-key: hk_your_agent_your_key" ...
```

### Endpoints

#### **POST /api/handoffs** — Create

Create a new handoff.

**Request:**

```json
{
  "to": "electron",
  "topic": "Fix dashboard bug",
  "body": "Click rate shows 0, probably caching issue",
  "priority": "p1"
}
```

Optional: `priority` defaults to `p2`

**Response:**

```json
{
  "ok": true,
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### **GET /api/handoffs** — List

Get handoffs for an agent.

**Query params:**

- `agent=<name>` — Filter by to or from (e.g., `agent=clawd`)
- `status=<OPEN|BLOCKED|RESOLVED>` — Filter by status (default: OPEN)
- `from=<name>` — Filter by sender
- `to=<name>` — Filter by recipient

**Example:**

```
GET /api/handoffs?agent=clawd&status=OPEN
```

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "from_agent": "scout",
      "to_agent": "clawd",
      "topic": "Cross-delisting research",
      "body": "Need counts on eBay listings that were delisted from other channels",
      "status": "OPEN",
      "priority": "p2",
      "blocked_on": null,
      "resolution": null,
      "machine": "mac1",
      "created_at": "2026-03-19T12:30:00Z",
      "updated_at": "2026-03-19T12:30:00Z"
    }
  ]
}
```

#### **PATCH /api/handoffs/[id]** — Update

Mark a handoff as resolved or blocked.

**Request (resolve):**

```json
{
  "status": "RESOLVED",
  "resolution": "Fixed in commit 7f4e1a2 — updated cache invalidation logic"
}
```

**Request (block):**

```json
{
  "status": "BLOCKED",
  "blocked_on": "Waiting on Dayta for schema update"
}
```

**Response:**

```json
{
  "ok": true,
  "data": { ... }
}
```

#### **GET /api/handoffs/feed** — Public feed

Get all handoffs from the last 48 hours. No auth required (read-only).

**Response:**

```json
{
  "ok": true,
  "data": [ ... ],
  "timestamp": "2026-03-19T19:00:00Z"
}
```

---

## Database Schema

Handoffs are stored in Supabase in the `handoffs` table:

```sql
CREATE TABLE handoffs (
  id UUID PRIMARY KEY,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN', -- OPEN, BLOCKED, RESOLVED
  priority TEXT DEFAULT 'p2', -- p0, p1, p2, p3
  body TEXT, -- markdown content
  blocked_on TEXT, -- reason (when status=BLOCKED)
  resolution TEXT, -- what was done (when status=RESOLVED)
  machine TEXT, -- mac1, mac2, pc1, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```

Agent API keys are in the `agent_keys` table:

```sql
CREATE TABLE agent_keys (
  agent_id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL UNIQUE,
  machine TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Priority Levels

- **p0** — Critical, blocking the team
- **p1** — Urgent, same-day turnaround needed
- **p2** — Normal, this week (default)
- **p3** — Low, whenever you get to it

---

## Workflow

1. **Agent creates** a handoff:
   ```bash
   handoff.sh create electron "Fix dashboard bug" "Click rate shows 0" p1
   ```

2. **Recipient picks it up** during next scan or gets paged

3. **Work happens** — recipient updates status as needed:
   ```bash
   # If blocked
   handoff.sh block <id> "waiting on Dayta for schema"
   
   # When done
   handoff.sh resolve <id> "Fixed in commit 7f4e1a2"
   ```

4. **History preserved** — resolved handoffs stay in the database forever for audit

---

## Tips

- **Be specific in topics** — "Fix dashboard bug" is better than "dashboard issue"
- **Use priority correctly** — p0 for real emergencies only
- **Update status promptly** — Don't leave handoffs stuck as OPEN
- **Use body for context** — Include links, error messages, or reproduction steps
- **Resolve with details** — Help future-you (or another agent) understand what was done

---

## Troubleshooting

**"Invalid API key" error?**

Check your `~/.env` file. Your `HANDOFF_API_KEY` should be in format `hk_<agent>_<random8>`. Ask Clawd to re-seed your key if it's missing.

**Handoff not appearing?**

The web UI shows the last 48 hours. Use the CLI to check all statuses:

```bash
handoff.sh list all OPEN
```

**Can't create a handoff?**

Check your agent exists in the system. Common agent names: clawd, electron, dayta, scout, lila, indy, ripley, kay, chip, pixel, marcy.

---

## Development

The handoff system lives in lounge.codes:

- **API routes:** `app/api/handoffs/`
- **Web UI:** `app/handoffs/page.tsx`
- **Database:** Supabase project `smrivccfqhsqslgxztqe`
- **CLI:** `/Users/elad/clawd/shared/tools/handoff.sh`

To add new features, edit the API routes or web UI and commit to the lounge-codes repo.
