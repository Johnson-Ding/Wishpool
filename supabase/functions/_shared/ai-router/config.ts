// AI Router 配置 — 角色-模型映射 + 模型配置

import type { AIRouterConfig } from './types.ts'

export const defaultConfig: AIRouterConfig = {
  // 角色-模型映射：每个角色优先用哪个模型，降级用哪个
  roles: {
    intent_analysis: {
      primary: 'kimi-code',
      fallback: ['kimi-k2.5'],
    },
    plan_generation: {
      primary: 'kimi-code',
      fallback: ['kimi-k2.5'],
    },
    auto_execution: {
      primary: 'kimi-code',
      fallback: ['kimi-k2.5'],
    },
    conversation: {
      primary: 'kimi-code',
      fallback: ['kimi-k2.5'],
    },
  },

  // 模型配置
  models: {
    'kimi-code': {
      provider: 'kimi-code',
      model: 'claude-sonnet-4-20250514',
      baseURL: 'https://api.kimi.com/coding/',
      apiKeyEnv: 'KIMI_CODE_API_KEY',
      format: 'anthropic',
      maxTokens: 4096,
    },
    'kimi-k2.5': {
      provider: 'kimi-k2.5',
      model: 'kimi-k2.5',
      baseURL: 'https://api.moonshot.cn/v1',
      apiKeyEnv: 'MOONSHOT_API_KEY',
      format: 'openai',
      maxTokens: 4096,
    },
    openai: {
      provider: 'openai',
      model: 'gpt-4o',
      baseURL: 'https://api.openai.com/v1',
      apiKeyEnv: 'OPENAI_API_KEY',
      format: 'openai',
      maxTokens: 4096,
    },
  },
}
