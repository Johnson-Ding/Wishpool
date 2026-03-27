-- Wishpool core schema (Supabase / Postgres)
-- Decision: ai_plan uses structured JSON (Option B)

create extension if not exists "pgcrypto";

create table if not exists anonymous_users (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists wish_tasks (
  id uuid primary key default gen_random_uuid(),
  anonymous_user_id uuid not null references anonymous_users(id) on delete cascade,
  title text not null default 'untitled wish',
  intent text not null,
  status text not null check (
    status in (
      'draft','clarifying','planning','validating','locking',
      'ready','in_progress','completed','failed','cancelled'
    )
  ),
  city text,
  budget text,
  time_window text,
  raw_input text,
  ai_plan jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wish_tasks_user_id on wish_tasks(anonymous_user_id);
create index if not exists idx_wish_tasks_status on wish_tasks(status);

create table if not exists validation_rounds (
  id uuid primary key default gen_random_uuid(),
  wish_task_id uuid not null references wish_tasks(id) on delete cascade,
  round_number int not null check (round_number > 0),
  summary text not null,
  human_check_passed boolean,
  created_at timestamptz not null default now(),
  unique (wish_task_id, round_number)
);

create table if not exists collab_locks (
  id uuid primary key default gen_random_uuid(),
  wish_task_id uuid not null unique references wish_tasks(id) on delete cascade,
  lock_details jsonb not null default '{}'::jsonb,
  locked_at timestamptz not null default now()
);

create table if not exists fulfillments (
  id uuid primary key default gen_random_uuid(),
  wish_task_id uuid not null unique references wish_tasks(id) on delete cascade,
  outcome text not null check (outcome in ('completed', 'failed')),
  feedback_text text,
  story_card jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists drift_bottles (
  id bigserial primary key,
  fulfillment_id uuid references fulfillments(id) on delete set null,
  source_type text not null default 'seed' check (source_type in ('seed', 'major_completion', 'moment_capture')),
  type text not null check (type in ('story','mumble','news','rec','goodnews','poem','quote')),
  tag text not null,
  tag_color text not null,
  tag_bg text not null,
  title text not null,
  meta text not null default '',
  loc text not null default '',
  excerpt text not null,
  likes int not null default 0 check (likes >= 0),
  link text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_drift_bottles_active_created_at on drift_bottles(is_active, created_at desc);

create table if not exists drift_bottle_comments (
  id uuid primary key default gen_random_uuid(),
  drift_bottle_id bigint not null references drift_bottles(id) on delete cascade,
  anonymous_user_id uuid references anonymous_users(id) on delete set null,
  author_name text not null default '匿名用户',
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_drift_bottle_comments_bottle_created_at
  on drift_bottle_comments(drift_bottle_id, created_at asc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wish_tasks_updated_at on wish_tasks;
create trigger trg_wish_tasks_updated_at
before update on wish_tasks
for each row execute function set_updated_at();
