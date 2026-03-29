-- AI Agent 系统相关表结构
-- 用于支持 US-20~26 用户故事

-- Agent 执行状态表
CREATE TABLE wish_agent_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    wish_text text NOT NULL,
    intent_type text CHECK (intent_type IN ('emotional', 'travel', 'local_life', 'growth', 'execution')),
    confidence decimal(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    execution_level text CHECK (execution_level IN ('L1_auto', 'L2_friend', 'L3_community')),
    analysis_result jsonb,
    execution_plan jsonb,
    current_step integer DEFAULT 0,
    status text DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'planned', 'executing', 'completed', 'failed', 'escalated')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Agent 执行日志表
CREATE TABLE agent_execution_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_state_id uuid REFERENCES wish_agent_states(id) ON DELETE CASCADE,
    step_index integer NOT NULL,
    action_type text NOT NULL, -- 'auto_execute', 'delegate_friend', 'publish_community'
    input_data jsonb,
    output_data jsonb,
    success boolean,
    error_message text,
    execution_time_ms integer,
    created_at timestamptz DEFAULT now()
);

-- Agent 工具调用记录表
CREATE TABLE agent_tool_calls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_state_id uuid REFERENCES wish_agent_states(id) ON DELETE CASCADE,
    tool_name text NOT NULL,
    tool_input jsonb NOT NULL,
    tool_output jsonb,
    success boolean,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- 委托执行表 (L2 朋友 / L3 社区)
CREATE TABLE agent_delegations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_state_id uuid REFERENCES wish_agent_states(id) ON DELETE CASCADE,
    delegation_type text CHECK (delegation_type IN ('friend', 'community')),
    original_wish text NOT NULL, -- 原始愿望
    processed_wish text, -- 脱敏后的愿望 (仅 community 类型)
    target_friend_id text, -- 朋友标识 (仅 friend 类型)
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
    response_data jsonb, -- 朋友回复或社区响应
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- 索引优化
CREATE INDEX idx_wish_agent_states_device_id ON wish_agent_states(device_id);
CREATE INDEX idx_wish_agent_states_status ON wish_agent_states(status);
CREATE INDEX idx_wish_agent_states_intent_type ON wish_agent_states(intent_type);
CREATE INDEX idx_agent_execution_logs_agent_state_id ON agent_execution_logs(agent_state_id);
CREATE INDEX idx_agent_tool_calls_agent_state_id ON agent_tool_calls(agent_state_id);
CREATE INDEX idx_agent_delegations_agent_state_id ON agent_delegations(agent_state_id);

-- RPC 函数：获取用户的 Agent 历史
CREATE OR REPLACE FUNCTION get_user_agent_history(user_device_id text)
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
    WHERE was.device_id = user_device_id
    ORDER BY was.created_at DESC;
END;
$$;

-- RPC 函数：更新 Agent 执行状态
CREATE OR REPLACE FUNCTION update_agent_state(
    state_id uuid,
    new_step integer DEFAULT NULL,
    new_status text DEFAULT NULL,
    execution_result jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE wish_agent_states
    SET
        current_step = COALESCE(new_step, current_step),
        status = COALESCE(new_status, status),
        analysis_result = CASE
            WHEN execution_result IS NOT NULL
            THEN COALESCE(analysis_result, '{}'::jsonb) || execution_result
            ELSE analysis_result
        END,
        updated_at = now()
    WHERE id = state_id;

    RETURN FOUND;
END;
$$;

-- RPC 函数：记录 Agent 工具调用
CREATE OR REPLACE FUNCTION log_agent_tool_call(
    state_id uuid,
    tool_name text,
    tool_input jsonb,
    tool_output jsonb DEFAULT NULL,
    success boolean DEFAULT true,
    error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    call_id uuid;
BEGIN
    INSERT INTO agent_tool_calls (
        agent_state_id,
        tool_name,
        tool_input,
        tool_output,
        success,
        error_message
    ) VALUES (
        state_id,
        tool_name,
        tool_input,
        tool_output,
        success,
        error_message
    )
    RETURNING id INTO call_id;

    RETURN call_id;
END;
$$;