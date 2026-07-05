-- ─────────────────────────────────────────────────────────────────────────────
-- ClipSplit Pro – Supabase Database Schema
-- Run this entire file in the Supabase SQL editor to set up all tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Contact Messages ───────────────────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz default now()
);

-- Only the service-role key (backend) can insert; no public reads.
alter table contact_messages enable row level security;

create policy "service_role_insert_contact"
  on contact_messages for insert
  with check (true);

-- ── 2. Analytics Events ───────────────────────────────────────────────────────
create table if not exists analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,
  page        text,
  metadata    jsonb,
  session_id  text,
  country     text,
  created_at  timestamptz default now()
);

-- Anyone (anon key) can insert; only service role can read.
alter table analytics_events enable row level security;

create policy "anon_insert_analytics"
  on analytics_events for insert
  with check (true);

-- ── 3. User Feedback ──────────────────────────────────────────────────────────
create table if not exists user_feedback (
  id          uuid primary key default gen_random_uuid(),
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text,
  page        text,
  session_id  text,
  created_at  timestamptz default now()
);

-- Anyone can insert; only service role can read.
alter table user_feedback enable row level security;

create policy "anon_insert_feedback"
  on user_feedback for insert
  with check (true);

-- ── 4. Useful indexes ─────────────────────────────────────────────────────────
create index if not exists idx_analytics_event     on analytics_events (event);
create index if not exists idx_analytics_created   on analytics_events (created_at desc);
create index if not exists idx_feedback_created    on user_feedback    (created_at desc);
create index if not exists idx_contact_created     on contact_messages (created_at desc);
