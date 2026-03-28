-- ============================================================
-- RPC functions for PostgREST direct access (三端共享)
-- 三端（Web / iOS / Android）通过 Supabase SDK 调用:
--   supabase.rpc('create_wish', { p_device_id: '...', p_intent: '...' })
--   supabase.rpc('clarify_wish', { p_wish_id: '...', p_city: '...' })
--   supabase.rpc('like_bottle', { p_bottle_id: 1 })
-- ============================================================

-- 1. create_wish: upsert anonymous user + create wish task
create or replace function create_wish(
  p_device_id text,
  p_intent text,
  p_title text default 'untitled wish',
  p_city text default null,
  p_budget text default null,
  p_time_window text default null,
  p_raw_input text default null
)
returns json
language plpgsql
as $$
declare
  v_user_id uuid;
  v_wish wish_tasks%rowtype;
begin
  -- upsert anonymous user
  insert into anonymous_users (device_id)
  values (p_device_id)
  on conflict (device_id) do update set device_id = excluded.device_id
  returning id into v_user_id;

  -- create wish task in 'clarifying' state
  insert into wish_tasks (anonymous_user_id, title, intent, status, city, budget, time_window, raw_input, ai_plan)
  values (
    v_user_id,
    p_title,
    p_intent,
    'clarifying',
    p_city,
    p_budget,
    p_time_window,
    p_raw_input,
    jsonb_build_object(
      'source', 'system_placeholder',
      'summary', '正在为你生成计划…',
      'constraints', jsonb_build_object('city', coalesce(p_city,''), 'budget', coalesce(p_budget,''), 'timeWindow', coalesce(p_time_window,'')),
      'steps', '[]'::jsonb,
      'intent', p_intent
    )
  )
  returning * into v_wish;

  return row_to_json(v_wish);
end;
$$;

-- 2. clarify_wish: validate state + update constraints + transition to planning
create or replace function clarify_wish(
  p_wish_id uuid,
  p_title text default null,
  p_intent text default null,
  p_city text default null,
  p_budget text default null,
  p_time_window text default null,
  p_raw_input text default null
)
returns json
language plpgsql
as $$
declare
  v_wish wish_tasks%rowtype;
begin
  -- lock the row and check status
  select * into v_wish from wish_tasks where id = p_wish_id for update;

  if not found then
    raise exception 'wish_not_found: %', p_wish_id;
  end if;

  if v_wish.status <> 'clarifying' then
    raise exception 'invalid_status: expected clarifying, got %', v_wish.status;
  end if;

  -- update fields (only non-null params)
  update wish_tasks set
    title       = coalesce(p_title, title),
    intent      = coalesce(p_intent, intent),
    city        = coalesce(p_city, city),
    budget      = coalesce(p_budget, budget),
    time_window = coalesce(p_time_window, time_window),
    raw_input   = coalesce(p_raw_input, raw_input),
    status      = 'planning'
  where id = p_wish_id
  returning * into v_wish;

  return row_to_json(v_wish);
end;
$$;

-- 3. like_bottle: atomic increment
create or replace function like_bottle(
  p_bottle_id bigint
)
returns json
language plpgsql
as $$
declare
  v_bottle drift_bottles%rowtype;
begin
  update drift_bottles
  set likes = likes + 1
  where id = p_bottle_id and is_active = true
  returning * into v_bottle;

  if not found then
    raise exception 'bottle_not_found: %', p_bottle_id;
  end if;

  return row_to_json(v_bottle);
end;
$$;
