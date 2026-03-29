-- ============================================================
-- 006: 从 device_id 匿名方案迁移到 Supabase Auth 匿名登录
-- 前提：可清空所有用户数据，重新开始
-- ============================================================

-- 0. 清空所有用户相关数据
TRUNCATE ai_generated_plans, agent_delegations, agent_tool_calls, agent_execution_logs,
         wish_agent_states, drift_bottle_comments, fulfillments, collab_locks,
         validation_rounds, wish_tasks, anonymous_users CASCADE;

-- 1. 删除旧的 anonymous_users 表
DROP TABLE IF EXISTS anonymous_users CASCADE;

-- 2. 创建 profiles 表（关联 auth.users）
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_member boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. wish_tasks: anonymous_user_id → user_id
ALTER TABLE wish_tasks DROP COLUMN IF EXISTS anonymous_user_id;
ALTER TABLE wish_tasks ADD COLUMN user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS idx_wish_tasks_user_id;
CREATE INDEX idx_wish_tasks_user_id ON wish_tasks(user_id);

-- 5. drift_bottle_comments: anonymous_user_id → user_id
ALTER TABLE drift_bottle_comments DROP COLUMN IF EXISTS anonymous_user_id;
ALTER TABLE drift_bottle_comments ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. wish_agent_states: device_id → user_id
ALTER TABLE wish_agent_states DROP COLUMN IF EXISTS device_id;
ALTER TABLE wish_agent_states ADD COLUMN user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS idx_wish_agent_states_device_id;
CREATE INDEX idx_wish_agent_states_user_id ON wish_agent_states(user_id);

-- 7. ai_generated_plans: device_id → user_id
ALTER TABLE ai_generated_plans DROP COLUMN IF EXISTS device_id;
ALTER TABLE ai_generated_plans ADD COLUMN user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS idx_ai_generated_plans_device_id;
CREATE INDEX idx_ai_generated_plans_user_id ON ai_generated_plans(user_id);

-- ============================================================
-- 8. 启用 RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drift_bottle_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_agent_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RLS 策略
-- ============================================================

-- profiles: 只能查看和更新自己的
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- wish_tasks: 用户管理自己的心愿
CREATE POLICY "Users can view own wishes" ON wish_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create wishes" ON wish_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishes" ON wish_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishes" ON wish_tasks FOR DELETE USING (auth.uid() = user_id);

-- validation_rounds: 通过 wish 归属关联
CREATE POLICY "Users can view own validation rounds" ON validation_rounds
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_tasks WHERE wish_tasks.id = validation_rounds.wish_task_id AND wish_tasks.user_id = auth.uid()
  ));
CREATE POLICY "Users can create validation rounds" ON validation_rounds
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM wish_tasks WHERE wish_tasks.id = validation_rounds.wish_task_id AND wish_tasks.user_id = auth.uid()
  ));

-- collab_locks: 通过 wish 归属关联
CREATE POLICY "Users can view own collab locks" ON collab_locks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_tasks WHERE wish_tasks.id = collab_locks.wish_task_id AND wish_tasks.user_id = auth.uid()
  ));

-- fulfillments: 通过 wish 归属关联
CREATE POLICY "Users can view own fulfillments" ON fulfillments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_tasks WHERE wish_tasks.id = fulfillments.wish_task_id AND wish_tasks.user_id = auth.uid()
  ));

-- drift_bottles: 公开可读（广场）
CREATE POLICY "Anyone can view active bottles" ON drift_bottles FOR SELECT USING (is_active = true);

-- drift_bottle_comments: 公开可读，认证用户可评论
CREATE POLICY "Anyone can view comments" ON drift_bottle_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON drift_bottle_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- wish_agent_states: 用户管理自己的 agent 记录
CREATE POLICY "Users can view own agent states" ON wish_agent_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create agent states" ON wish_agent_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent states" ON wish_agent_states FOR UPDATE USING (auth.uid() = user_id);

-- agent_execution_logs: 通过 agent_state 归属关联
CREATE POLICY "Users can view own execution logs" ON agent_execution_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_execution_logs.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));
CREATE POLICY "Users can create execution logs" ON agent_execution_logs
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_execution_logs.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));

-- agent_tool_calls: 通过 agent_state 归属关联
CREATE POLICY "Users can view own tool calls" ON agent_tool_calls
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_tool_calls.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));
CREATE POLICY "Users can create tool calls" ON agent_tool_calls
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_tool_calls.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));

-- agent_delegations: 通过 agent_state 归属关联
CREATE POLICY "Users can view own delegations" ON agent_delegations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_delegations.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));
CREATE POLICY "Users can create delegations" ON agent_delegations
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM wish_agent_states WHERE wish_agent_states.id = agent_delegations.agent_state_id AND wish_agent_states.user_id = auth.uid()
  ));

-- ai_generated_plans: 用户管理自己的 AI 方案
CREATE POLICY "Users can view own plans" ON ai_generated_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create plans" ON ai_generated_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. 更新 RPC 函数（使用 auth.uid() 代替 device_id）
-- ============================================================

-- create_wish: 不再需要 p_device_id，使用 auth.uid()
CREATE OR REPLACE FUNCTION create_wish(
  p_intent text,
  p_title text DEFAULT 'untitled wish',
  p_city text DEFAULT NULL,
  p_budget text DEFAULT NULL,
  p_time_window text DEFAULT NULL,
  p_raw_input text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_wish wish_tasks%rowtype;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  INSERT INTO wish_tasks (user_id, title, intent, status, city, budget, time_window, raw_input, ai_plan)
  VALUES (
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
  RETURNING * INTO v_wish;

  RETURN row_to_json(v_wish);
END;
$$;

-- clarify_wish: 保持不变（通过 wish_id 操作，RLS 保护归属）
CREATE OR REPLACE FUNCTION clarify_wish(
  p_wish_id uuid,
  p_title text DEFAULT NULL,
  p_intent text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_budget text DEFAULT NULL,
  p_time_window text DEFAULT NULL,
  p_raw_input text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_wish wish_tasks%rowtype;
BEGIN
  SELECT * INTO v_wish FROM wish_tasks WHERE id = p_wish_id AND user_id = auth.uid() FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'wish_not_found: %', p_wish_id;
  END IF;

  IF v_wish.status <> 'clarifying' THEN
    RAISE EXCEPTION 'invalid_status: expected clarifying, got %', v_wish.status;
  END IF;

  UPDATE wish_tasks SET
    title       = coalesce(p_title, title),
    intent      = coalesce(p_intent, intent),
    city        = coalesce(p_city, city),
    budget      = coalesce(p_budget, budget),
    time_window = coalesce(p_time_window, time_window),
    raw_input   = coalesce(p_raw_input, raw_input),
    status      = 'planning'
  WHERE id = p_wish_id
  RETURNING * INTO v_wish;

  RETURN row_to_json(v_wish);
END;
$$;

-- like_bottle: 公开操作，使用 SECURITY DEFINER
CREATE OR REPLACE FUNCTION like_bottle(
  p_bottle_id bigint
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bottle drift_bottles%rowtype;
BEGIN
  UPDATE drift_bottles
  SET likes = likes + 1
  WHERE id = p_bottle_id AND is_active = true
  RETURNING * INTO v_bottle;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'bottle_not_found: %', p_bottle_id;
  END IF;

  RETURN row_to_json(v_bottle);
END;
$$;

-- list_my_wishes: 不再需要 p_device_id，使用 auth.uid()
CREATE OR REPLACE FUNCTION list_my_wishes()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  SELECT coalesce(json_agg(row_to_json(w) ORDER BY w.updated_at DESC), '[]'::json)
  INTO v_result
  FROM wish_tasks w
  WHERE w.user_id = v_user_id;

  RETURN v_result;
END;
$$;

-- confirm_wish_plan: 添加 auth.uid() 归属校验
CREATE OR REPLACE FUNCTION confirm_wish_plan(
  p_wish_id uuid
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_wish wish_tasks%rowtype;
BEGIN
  SELECT * INTO v_wish FROM wish_tasks WHERE id = p_wish_id AND user_id = auth.uid() FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'wish_not_found: %', p_wish_id;
  END IF;

  IF v_wish.status <> 'planning' THEN
    RAISE EXCEPTION 'invalid_status: expected planning, got %', v_wish.status;
  END IF;

  UPDATE wish_tasks SET
    status = 'ready',
    confirmed_at = now()
  WHERE id = p_wish_id
  RETURNING * INTO v_wish;

  RETURN row_to_json(v_wish);
END;
$$;

-- get_user_agent_history: 不再需要 device_id，使用 auth.uid()
CREATE OR REPLACE FUNCTION get_user_agent_history()
RETURNS TABLE (
    id uuid,
    wish_text text,
    intent_type text,
    execution_level text,
    status text,
    created_at timestamptz,
    execution_summary jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        was.id,
        was.wish_text,
        was.intent_type,
        was.execution_level,
        was.status,
        was.created_at,
        jsonb_build_object(
            'total_steps', jsonb_array_length(was.execution_plan->'steps'),
            'completed_steps', was.current_step,
            'last_action', (
                SELECT action_type
                FROM agent_execution_logs
                WHERE agent_state_id = was.id
                ORDER BY created_at DESC
                LIMIT 1
            )
        ) as execution_summary
    FROM wish_agent_states was
    WHERE was.user_id = auth.uid()
    ORDER BY was.created_at DESC;
END;
$$;

-- update_agent_state: 保持不变（通过 state_id 操作）
-- log_agent_tool_call: 保持不变（通过 state_id 操作）
