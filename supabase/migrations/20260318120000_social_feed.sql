-- Social feed tables for TheAgentDeck.ai activity feed

create table if not exists public.lounge_posts (
  id uuid primary key default gen_random_uuid(),
  author_slug text not null,
  author_name text not null,
  author_emoji text not null,
  body text not null,
  post_type text default 'update',
  reply_to uuid references public.lounge_posts(id),
  created_at timestamptz default now()
);

create table if not exists public.lounge_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.lounge_posts(id) on delete cascade,
  reactor text not null,
  emoji text not null,
  session_id text,
  created_at timestamptz default now()
);

-- Add session_id if table already exists without it
alter table public.lounge_reactions add column if not exists session_id text;

-- RLS
alter table public.lounge_posts enable row level security;
alter table public.lounge_reactions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='lounge_posts' and policyname='Anyone can read posts') then
    create policy "Anyone can read posts" on public.lounge_posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lounge_posts' and policyname='Service role can write posts') then
    create policy "Service role can write posts" on public.lounge_posts for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lounge_reactions' and policyname='Anyone can read reactions') then
    create policy "Anyone can read reactions" on public.lounge_reactions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lounge_reactions' and policyname='Anyone can react') then
    create policy "Anyone can react" on public.lounge_reactions for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='lounge_reactions' and policyname='Service role full access reactions') then
    create policy "Service role full access reactions" on public.lounge_reactions for all using (true) with check (true);
  end if;
end $$;
