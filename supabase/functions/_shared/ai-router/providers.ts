// AI Provider 适配器 — 统一 Anthropic/OpenAI 格式调用

import type { ModelConfig, AIRequest, AIResponse, AITool } from './types.ts'

// Anthropic 格式调用（Kimi Code API）
async function callAnthropic(
  config: ModelConfig,
  apiKey: string,
  request: AIRequest
): Promise<AIResponse> {
  const messages: Array<Record<string, unknown>> = [
    { role: 'user', content: request.prompt }
  ]

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: request.maxTokens || config.maxTokens,
    messages,
  }

  if (request.systemPrompt) {
    body.system = request.systemPrompt
  }

  // 转换 tools 为 Anthropic 格式
  if (request.tools && request.tools.length > 0) {
    body.tools = request.tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }))
    if (request.toolChoice === 'required') {
      body.tool_choice = { type: 'any' }
    } else if (request.toolChoice === 'auto') {
      body.tool_choice = { type: 'auto' }
    }
  }

  const resp = await fetch(`${config.baseURL}v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`Anthropic API error ${resp.status}: ${errText}`)
  }

  const data = await resp.json()

  // 解析 Anthropic 响应
  const textBlocks = data.content?.filter((b: Record<string, unknown>) => b.type === 'text') || []
  const toolBlocks = data.content?.filter((b: Record<string, unknown>) => b.type === 'tool_use') || []

  return {
    success: true,
    content: textBlocks.map((b: Record<string, string>) => b.text).join(''),
    toolCalls: toolBlocks.map((b: Record<string, unknown>) => ({
      name: b.name as string,
      args: b.input as Record<string, unknown>,
    })),
    provider: config.provider,
    usage: data.usage ? {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
    } : undefined,
  }
}

// OpenAI 格式调用（Kimi K2.5 / GPT-4o）
async function callOpenAI(
  config: ModelConfig,
  apiKey: string,
  request: AIRequest
): Promise<AIResponse> {
  const messages: Array<Record<string, unknown>> = []

  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt })
  }
  messages.push({ role: 'user', content: request.prompt })

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: request.maxTokens || config.maxTokens,
    messages,
  }

  // 转换 tools 为 OpenAI 格式
  if (request.tools && request.tools.length > 0) {
    body.tools = request.tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }))
    if (request.toolChoice === 'required') {
      body.tool_choice = 'required'
    } else if (request.toolChoice === 'auto') {
      body.tool_choice = 'auto'
    }
  }

  const resp = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const choice = data.choices?.[0]

  // 解析 OpenAI 响应
  const toolCalls = choice?.message?.tool_calls?.map((tc: Record<string, unknown>) => {
    const fn = tc.function as Record<string, unknown>
    return {
      name: fn.name as string,
      args: JSON.parse(fn.arguments as string),
    }
  }) || []

  return {
    success: true,
    content: choice?.message?.content || '',
    toolCalls,
    provider: config.provider,
    usage: data.usage ? {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    } : undefined,
  }
}

// 统一调用入口
export async function callModel(
  config: ModelConfig,
  apiKey: string,
  request: AIRequest
): Promise<AIResponse> {
  if (config.format === 'anthropic') {
    return callAnthropic(config, apiKey, request)
  } else {
    return callOpenAI(config, apiKey, request)
  }
}
