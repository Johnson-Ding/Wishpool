// AI Router — 统一模型调用入口，支持角色-模型映射 + 自动降级

import type { AgentRole, AIRequest, AIResponse, ModelProvider } from './types.ts'
import { defaultConfig } from './config.ts'
import { callModel } from './providers.ts'

export type { AgentRole, AIRequest, AIResponse, AITool, ModelProvider } from './types.ts'

export class AIRouter {
  private config = defaultConfig

  // 获取模型的 API Key
  private getApiKey(provider: ModelProvider): string | null {
    const modelConfig = this.config.models[provider]
    if (!modelConfig) return null
    return Deno.env.get(modelConfig.apiKeyEnv) || null
  }

  // 按角色调用模型，支持自动降级
  async call(request: AIRequest): Promise<AIResponse> {
    const roleMapping = this.config.roles[request.role]
    if (!roleMapping) {
      return { success: false, error: `Unknown role: ${request.role}`, provider: 'kimi-code' }
    }

    // 构建尝试顺序：primary → fallback
    const providers = [roleMapping.primary, ...roleMapping.fallback]
    const errors: string[] = []

    for (const provider of providers) {
      const modelConfig = this.config.models[provider]
      if (!modelConfig) {
        errors.push(`${provider}: model config not found`)
        continue
      }

      const apiKey = this.getApiKey(provider)
      if (!apiKey) {
        errors.push(`${provider}: API key not configured (${modelConfig.apiKeyEnv})`)
        continue
      }

      try {
        console.log(`🤖 AI Router: trying ${provider} (${modelConfig.model})...`)
        const response = await callModel(modelConfig, apiKey, request)
        console.log(`✅ AI Router: ${provider} succeeded`)
        return response
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${provider}: ${msg}`)
        console.warn(`⚠️ AI Router: ${provider} failed, trying next... (${msg})`)
      }
    }

    return {
      success: false,
      error: `All providers failed:\n${errors.join('\n')}`,
      provider: providers[0],
    }
  }

  // 便捷方法：意图分析
  async analyzeIntent(wish: string): Promise<AIResponse> {
    return this.call({
      role: 'intent_analysis',
      systemPrompt: INTENT_SYSTEM_PROMPT,
      prompt: `用户愿望: "${wish}"`,
      tools: [ANALYZE_WISH_TOOL],
      toolChoice: 'required',
    })
  }

  // 便捷方法：方案生成
  async generatePlan(wish: string, context?: string): Promise<AIResponse> {
    return this.call({
      role: 'plan_generation',
      systemPrompt: PLAN_SYSTEM_PROMPT,
      prompt: context
        ? `用户愿望: "${wish}"\n\n补充上下文: ${context}`
        : `用户愿望: "${wish}"`,
      tools: [GENERATE_PLAN_TOOL],
      toolChoice: 'required',
    })
  }

  // 获取当前配置状态（调试用）
  getStatus(): Record<string, unknown> {
    const status: Record<string, unknown> = {}
    for (const [provider, config] of Object.entries(this.config.models)) {
      status[provider] = {
        model: config.model,
        format: config.format,
        hasKey: !!this.getApiKey(provider as ModelProvider),
      }
    }
    return status
  }
}

// 单例
let _router: AIRouter | null = null
export function getRouter(): AIRouter {
  if (!_router) _router = new AIRouter()
  return _router
}

// ============ 共享提示词 ============

const INTENT_SYSTEM_PROMPT = `你是 Wishpool AI 助手，负责理解用户的愿望并判断最佳执行路径。

你需要：
1. 准确分类用户意图（5类）
2. 判断执行级别（L1自动/L2朋友/L3社区）
3. 提取结构化信息（目标、约束、偏好）

意图分类标准：
- emotional: 情感倾诉、心理支持、关系困惑、压力释放
- travel: 旅行规划、出行安排、订票酒店、行程设计
- local_life: 本地活动、餐厅推荐、周末安排、休闲体验
- growth: 技能学习、职业发展、个人提升、知识获取
- execution: 线上事务、购物、查信息、办手续、代办事项

执行级别判断：
- L1 (自动执行): AI可以直接调用API完成（查信息、比价、生成方案）
- L2 (朋友帮助): 需要亲友协助（本地帮忙、情感支持、陪伴）
- L3 (社区求助): 需要发布到社区寻求帮助（脱敏后）

请仔细分析并给出准确的分类和执行建议。`

const PLAN_SYSTEM_PROMPT = `你是 Wishpool AI 助手，负责为用户的愿望生成具体可执行的方案。

方案要求：
1. 每个步骤要明确执行类型：线上直出（AI自动）、资源助力（平台资源）、人群助力（朋友/社区）、需你到场（用户亲自）
2. 给出合理的时间预估
3. 步骤要具体可执行，不要笼统
4. 考虑用户的约束条件（时间、预算等）

输出格式要严格按照 tool 定义的 schema。`

// ============ 共享工具定义 ============

const ANALYZE_WISH_TOOL = {
  name: 'analyzeWish',
  description: '分析用户愿望，确定意图类型和执行路径',
  parameters: {
    type: 'object',
    required: ['intentType', 'confidence', 'executableAutomatically', 'needsFriendHelp', 'needsCommunityHelp', 'goal', 'constraints', 'preferences'],
    properties: {
      intentType: {
        type: 'string',
        enum: ['emotional', 'travel', 'local_life', 'growth', 'execution'],
        description: '愿望的意图分类',
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: '分类置信度',
      },
      executableAutomatically: {
        type: 'boolean',
        description: 'AI 能否自动执行（L1）',
      },
      needsFriendHelp: {
        type: 'boolean',
        description: '是否需要朋友帮助（L2）',
      },
      needsCommunityHelp: {
        type: 'boolean',
        description: '是否需要社区求助（L3）',
      },
      goal: {
        type: 'string',
        description: '用户的核心目标',
      },
      constraints: {
        type: 'array',
        items: { type: 'string' },
        description: '约束条件列表',
      },
      preferences: {
        type: 'array',
        items: { type: 'string' },
        description: '用户偏好',
      },
      timeframe: {
        type: 'string',
        description: '期望时间',
      },
      budget: {
        type: 'string',
        description: '预算范围',
      },
    },
  },
}

const GENERATE_PLAN_TOOL = {
  name: 'generatePlan',
  description: '为用户愿望生成具体的执行方案',
  parameters: {
    type: 'object',
    required: ['wishText', 'durationText', 'decisionTitle', 'decisionOptions', 'planSteps', 'category', 'difficulty', 'estimatedDays'],
    properties: {
      wishText: {
        type: 'string',
        description: '用户愿望原文',
      },
      durationText: {
        type: 'string',
        description: '预计完成时间描述',
      },
      decisionTitle: {
        type: 'string',
        description: '需要用户决定的问题',
      },
      decisionOptions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
          },
          required: ['key', 'label'],
        },
        description: '决策选项',
      },
      planSteps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            num: { type: 'string', description: '步骤编号如①②③④' },
            title: { type: 'string', description: '步骤标题' },
            type: { type: 'string', enum: ['线上直出', '资源助力', '人群助力', '需你到场'], description: '执行类型' },
            typeColor: { type: 'string', description: '类型标签颜色' },
            desc: { type: 'string', description: '步骤描述' },
          },
          required: ['num', 'title', 'type', 'typeColor', 'desc'],
        },
        description: '执行步骤列表',
      },
      category: {
        type: 'string',
        description: '愿望分类',
      },
      difficulty: {
        type: 'string',
        enum: ['easy', 'medium', 'hard'],
        description: '难度级别',
      },
      estimatedDays: {
        type: 'number',
        description: '预估完成天数',
      },
    },
  },
}
