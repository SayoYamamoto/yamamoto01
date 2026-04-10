-- 住民説明まわり MVP（仕様書 第1版 §6）
-- Phase 2: データ基盤。適用後は Supabase MCP / SQL Editor でテーブル・ポリシーを確認してください。

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.briefing_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  scheduled_at timestamptz,
  location text,
  owner_name text,
  status text not null default 'scheduled',
  site_name text,
  site_identifier text,
  household_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  constraint briefing_sessions_status_check check (status in ('scheduled', 'completed', 'cancelled')),
  constraint briefing_sessions_household_count_check check (household_count is null or household_count >= 0)
);

create table public.briefing_materials (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.briefing_sessions (id) on delete cascade,
  title text not null,
  url text,
  storage_path text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.briefing_qa (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.briefing_sessions (id) on delete cascade,
  question text not null,
  draft_answer text,
  confirmed_answer text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint briefing_qa_status_check check (status in ('open', 'confirmed'))
);

create table public.briefing_decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.briefing_sessions (id) on delete cascade,
  body text not null,
  decided_on date not null default (timezone('utc', now()))::date,
  related_material_id uuid references public.briefing_materials (id) on delete set null,
  related_qa_id uuid references public.briefing_qa (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index briefing_materials_session_id_idx on public.briefing_materials (session_id);
create index briefing_qa_session_id_idx on public.briefing_qa (session_id);
create index briefing_decisions_session_id_idx on public.briefing_decisions (session_id);
create index briefing_sessions_scheduled_at_idx on public.briefing_sessions (scheduled_at);
create index briefing_sessions_status_idx on public.briefing_sessions (status);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger briefing_sessions_set_updated_at
  before update on public.briefing_sessions
  for each row execute function public.set_updated_at();

create trigger briefing_materials_set_updated_at
  before update on public.briefing_materials
  for each row execute function public.set_updated_at();

create trigger briefing_qa_set_updated_at
  before update on public.briefing_qa
  for each row execute function public.set_updated_at();

create trigger briefing_decisions_set_updated_at
  before update on public.briefing_decisions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS（MVP: ログインユーザー＝社内のみ想定。ロール細分化は後続）
-- ---------------------------------------------------------------------------

alter table public.briefing_sessions enable row level security;
alter table public.briefing_materials enable row level security;
alter table public.briefing_qa enable row level security;
alter table public.briefing_decisions enable row level security;

create policy "briefing_sessions_authenticated_all"
  on public.briefing_sessions
  for all
  to authenticated
  using (true)
  with check (true);

create policy "briefing_materials_authenticated_all"
  on public.briefing_materials
  for all
  to authenticated
  using (true)
  with check (true);

create policy "briefing_qa_authenticated_all"
  on public.briefing_qa
  for all
  to authenticated
  using (true)
  with check (true);

create policy "briefing_decisions_authenticated_all"
  on public.briefing_decisions
  for all
  to authenticated
  using (true)
  with check (true);
