-- AI Generated Plans table
-- 存储 AI 动态生成的个性化方案

create table if not exists ai_generated_plans (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  wish_input text not null,
  generated_plan jsonb not null,
  category text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  estimated_days int,
  used_for_wish_id uuid references wish_tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_generated_plans_device_id on ai_generated_plans(device_id);
create index if not exists idx_ai_generated_plans_category on ai_generated_plans(category);
create index if not exists idx_ai_generated_plans_created_at on ai_generated_plans(created_at desc);