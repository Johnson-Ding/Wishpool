// AI Router 类型定义

export type ModelProvider = 'kimi-code' | 'kimi-k2.5' | 'openai'

export type AgentRole = 'intent_analysis' | 'plan_generation' | 'auto_execution' | 'conversation'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  baseURL: string
  apiKeyEnv: string
  format: 'anthropic' | 'openai'
  maxTokens: number
}

export interface RoleModelMapping {
  primary: ModelProvider
  fallback: ModelProvider[]
}

export interface AIRouterConfig {
  roles: Record<AgentRole, RoleModelMapping>
  models: Record<ModelProvider, ModelConfig>
}

export interface AIRequest {
  role: AgentRole
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  tools?: AITool[]
  toolChoice?: 'auto' | 'required' | 'none'
}

export interface AITool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface AIResponse {
  success: boolean
  content?: string
  toolCalls?: Array<{
    name: string
    args: Record<string, unknown>
  }>
  provider: ModelProvider
  error?: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}
