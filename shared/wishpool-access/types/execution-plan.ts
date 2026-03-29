/**
 * 进度管理系统 - 执行计划类型定义
 * 基于现有 wish_agent_states.execution_plan (jsonb) 字段
 */

export type ExecutionStepStatus =
  | 'pending'       // 待执行
  | 'in_progress'   // 执行中
  | 'completed'     // 已完成
  | 'failed'        // 执行失败
  | 'skipped'       // 已跳过
  | 'waiting_user'  // 等待用户操作

export type ExecutionStepType =
  | 'research'      // 信息收集
  | 'decide'        // 决策选择
  | 'book'          // 预订/购买
  | 'prepare'       // 准备工作
  | 'execute'       // 执行操作
  | 'verify'        // 验证结果
  | 'manual'        // 需要手动完成

export interface ExecutionStep {
  id: string                     // 步骤唯一ID
  index: number                  // 步骤序号 (1, 2, 3...)
  title: string                  // 步骤标题
  description: string            // 详细描述
  type: ExecutionStepType        // 步骤类型
  status: ExecutionStepStatus    // 当前状态

  // 执行相关
  estimated_duration?: number    // 预估耗时(分钟)
  auto_executable?: boolean      // 是否支持 Computer Use 自动执行
  requires_user_input?: boolean  // 是否需要用户输入

  // Computer Use 相关
  computer_use_config?: {
    target_website: string       // 目标网站
    actions: string[]           // 需要执行的操作序列
    validation_rules: string[]   // 执行验证规则
  }

  // 进度跟踪
  started_at?: string           // 开始时间 (ISO string)
  completed_at?: string         // 完成时间 (ISO string)
  execution_result?: {          // 执行结果
    success: boolean
    message?: string
    data?: any
    screenshot_url?: string     // Computer Use 截图
  }

  // 用户交互
  user_notes?: string          // 用户备注
  manual_override?: boolean    // 用户手动标记完成
}

export interface ExecutionPlan {
  id: string                    // 执行计划ID
  wish_text: string            // 原始愿望文本
  intent_type: string          // 意图类型
  execution_level: 'L1_auto' | 'L2_friend' | 'L3_community'

  // 步骤管理
  steps: ExecutionStep[]       // 步骤列表
  current_step_index: number   // 当前执行到的步骤索引
  total_steps: number          // 总步骤数
  completed_steps: number      // 已完成步骤数

  // 时间跟踪
  estimated_total_duration?: number  // 预估总耗时(分钟)
  actual_duration?: number          // 实际耗时(分钟)

  // 执行状态
  overall_status: 'analyzing' | 'planned' | 'executing' | 'completed' | 'failed' | 'escalated'
  progress_percentage: number       // 完成百分比 (0-100)

  // Computer Use 配置
  automation_config?: {
    enabled: boolean               // 是否启用自动执行
    budget_limit?: number         // 预算限制(元)
    requires_approval_above?: number // 超过此金额需要确认
    safe_mode: boolean            // 安全模式(只读操作)
  }

  // 元数据
  created_at: string
  updated_at: string
  completed_at?: string
}

/**
 * 用于 AI Agent API 响应的进度展示格式
 */
export interface ProgressDisplay {
  plan: ExecutionPlan
  current_step?: ExecutionStep
  next_steps: ExecutionStep[]      // 接下来的3-5个步骤预览
  actionable_items: {              // 当前用户可执行的操作
    can_start_automation?: boolean
    can_mark_step_complete?: boolean
    can_skip_step?: boolean
    pending_user_inputs?: string[]
  }
}

/**
 * 步骤执行请求
 */
export interface StepExecutionRequest {
  agent_state_id: string
  step_id: string
  action: 'start' | 'complete' | 'skip' | 'retry' | 'add_note'
  user_input?: any               // 用户提供的输入数据
  notes?: string                // 用户备注
}

/**
 * 步骤执行响应
 */
export interface StepExecutionResponse {
  success: boolean
  updated_step: ExecutionStep
  next_step?: ExecutionStep
  plan_summary: {
    progress_percentage: number
    completed_steps: number
    total_steps: number
    estimated_remaining_time: number
  }
  requires_user_action?: {
    type: 'input' | 'approval' | 'manual_completion'
    message: string
    options?: string[]
  }
}