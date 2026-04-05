/**
 * Wishpool 本地 AI Server
 *
 * 类似 LobeChat 的本地 AI 服务：
 * - 通过 models.json 配置模型（编辑文件即可切换）
 * - 多模型自动降级
 * - 提供 REST API 给三端调用
 *
 * 启动：node server.js 或 node --watch server.js（热重载）
 */

import { createServer } from 'node:http'
import { readFileSync, watchFile } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.AI_SERVER_PORT || 3100
const CONFIG_PATH = resolve(__dirname, 'models.json')

// ============ 配置热加载 ============

let config = loadConfig()

function loadConfig() {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    console.log(`📋 已加载模型配置: ${Object.keys(parsed.models).join(', ')}`)
    return parsed
  } catch (e) {
    console.error('❌ 加载 models.json 失败:', e.message)
    process.exit(1)
  }
}

// 监听配置文件变化，自动热重载
watchFile(CONFIG_PATH, { interval: 2000 }, () => {
  console.log('🔄 检测到 models.json 变更，重新加载...')
  config = loadConfig()
})

// ============ 模型调用 ============

function getApiKey(modelConfig) {
  if (modelConfig.apiKey) return modelConfig.apiKey
  if (modelConfig.apiKeyEnv) return process.env[modelConfig.apiKeyEnv] || null
  return null
}

async function callAnthropic(modelConfig, apiKey, { systemPrompt, prompt, tools, toolChoice, maxTokens }) {
  const messages = [{ role: 'user', content: prompt }]
  const body = {
    model: modelConfig.model,
    max_tokens: maxTokens || modelConfig.maxTokens,
    messages,
  }

  if (systemPrompt) body.system = systemPrompt
  if (tools?.length) {
    body.tools = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }))
    if (toolChoice === 'required') body.tool_choice = { type: 'any' }
    else if (toolChoice === 'auto') body.tool_choice = { type: 'auto' }
  }

  const resp = await fetch(`${modelConfig.baseURL}v1/messages`, {
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
    throw new Error(`Anthropic API ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const textBlocks = data.content?.filter(b => b.type === 'text') || []
  const toolBlocks = data.content?.filter(b => b.type === 'tool_use') || []

  return {
    success: true,
    content: textBlocks.map(b => b.text).join(''),
    toolCalls: toolBlocks.map(b => ({ name: b.name, args: b.input })),
    provider: modelConfig.model,
    usage: data.usage ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens } : undefined,
  }
}

async function callOpenAI(modelConfig, apiKey, { systemPrompt, prompt, tools, toolChoice, maxTokens }) {
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const body = {
    model: modelConfig.model,
    max_tokens: maxTokens || modelConfig.maxTokens,
    messages,
  }

  if (tools?.length) {
    body.tools = tools.map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }))
    if (toolChoice) body.tool_choice = toolChoice
  }

  const resp = await fetch(`${modelConfig.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`OpenAI API ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const choice = data.choices?.[0]
  const toolCalls = choice?.message?.tool_calls?.map(tc => ({
    name: tc.function.name,
    args: JSON.parse(tc.function.arguments),
  })) || []

  return {
    success: true,
    content: choice?.message?.content || '',
    toolCalls,
    provider: modelConfig.model,
    usage: data.usage ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens } : undefined,
  }
}

async function callModel(modelId, request) {
  const modelConfig = config.models[modelId]
  if (!modelConfig) throw new Error(`模型 ${modelId} 未在 models.json 中配置`)

  const apiKey = getApiKey(modelConfig)
  if (!apiKey) throw new Error(`模型 ${modelId} 缺少 API Key（设置 apiKey 或 ${modelConfig.apiKeyEnv} 环境变量）`)

  if (modelConfig.format === 'anthropic') {
    return callAnthropic(modelConfig, apiKey, request)
  } else {
    return callOpenAI(modelConfig, apiKey, request)
  }
}

// 支持消息历史的模型调用
async function callModelWithHistory(role, { systemPrompt, messages, maxTokens }) {
  const roleConfig = config.roles[role]
  if (!roleConfig) throw new Error(`角色 ${role} 未在 models.json 中配置`)

  const providers = [roleConfig.primary, ...roleConfig.fallback]
  const errors = []

  for (const modelId of providers) {
    try {
      console.log(`🤖 [${role}] 尝试 ${modelId}...`)

      const modelConfig = config.models[modelId]
      if (!modelConfig) throw new Error(`模型 ${modelId} 未在 models.json 中配置`)

      const apiKey = getApiKey(modelConfig)
      if (!apiKey) throw new Error(`模型 ${modelId} 缺少 API Key`)

      let result
      if (modelConfig.format === 'anthropic') {
        result = await callAnthropicWithHistory(modelConfig, apiKey, { systemPrompt, messages, maxTokens })
      } else {
        result = await callOpenAIWithHistory(modelConfig, apiKey, { systemPrompt, messages, maxTokens })
      }

      console.log(`✅ [${role}] ${modelId} 成功`)
      return { ...result, modelId }
    } catch (err) {
      errors.push(`${modelId}: ${err.message}`)
      console.warn(`⚠️ [${role}] ${modelId} 失败: ${err.message}`)
    }
  }

  return { success: false, error: `所有模型失败:\n${errors.join('\n')}` }
}

async function callAnthropicWithHistory(modelConfig, apiKey, { systemPrompt, messages, maxTokens }) {
  const body = {
    model: modelConfig.model,
    max_tokens: maxTokens || modelConfig.maxTokens,
    messages,
  }

  if (systemPrompt) body.system = systemPrompt

  const resp = await fetch(`${modelConfig.baseURL}v1/messages`, {
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
    throw new Error(`Anthropic API ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const textBlocks = data.content?.filter(b => b.type === 'text') || []

  return {
    success: true,
    content: textBlocks.map(b => b.text).join(''),
    provider: modelConfig.model,
    usage: data.usage ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens } : undefined,
  }
}

async function callOpenAIWithHistory(modelConfig, apiKey, { systemPrompt, messages, maxTokens }) {
  const requestMessages = []

  if (systemPrompt) {
    requestMessages.push({ role: 'system', content: systemPrompt })
  }

  requestMessages.push(...messages)

  const body = {
    model: modelConfig.model,
    max_tokens: maxTokens || modelConfig.maxTokens,
    messages: requestMessages,
  }

  const resp = await fetch(`${modelConfig.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`OpenAI API ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const choice = data.choices?.[0]

  return {
    success: true,
    content: choice?.message?.content || '',
    provider: modelConfig.model,
    usage: data.usage ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens } : undefined,
  }
}

// 按角色自动降级调用
async function routeByRole(role, request) {
  const roleConfig = config.roles[role]
  if (!roleConfig) throw new Error(`角色 ${role} 未在 models.json 中配置`)

  const providers = [roleConfig.primary, ...roleConfig.fallback]
  const errors = []

  for (const modelId of providers) {
    try {
      console.log(`🤖 [${role}] 尝试 ${modelId}...`)
      const result = await callModel(modelId, request)
      console.log(`✅ [${role}] ${modelId} 成功`)
      return { ...result, modelId }
    } catch (err) {
      errors.push(`${modelId}: ${err.message}`)
      console.warn(`⚠️ [${role}] ${modelId} 失败: ${err.message}`)
    }
  }

  return { success: false, error: `所有模型失败:\n${errors.join('\n')}` }
}

// ============ 共享 Prompt & Tools ============

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
- L1 (自动执行): AI可以直接调用API完成
- L2 (朋友帮助): 需要亲友协助
- L3 (社区求助): 需要发布到社区寻求帮助`

const PLAN_SYSTEM_PROMPT = `你是 Wishpool AI 助手，负责为用户的愿望生成具体可执行的方案。

方案要求：
1. 生成 4-6 个执行步骤
2. 每个步骤标明类型：线上直出（AI自动）、资源助力（平台资源）、人群助力（朋友/社区）、需你到场（用户亲自）
3. 给出合理的时间预估
4. 步骤要具体可执行，不要笼统
5. 给出一个需要用户决定的关键问题和 3-4 个选项

输出格式严格按照 tool 定义的 schema。`

// ============ 对话角色 Prompt ============

const CHARACTER_PROMPTS = {
  moon: {
    casual: `你是眠眠月，许愿池的温柔陪伴AI。个性温柔细腻，善于倾听情感。

倾听模式特征：
- 温暖的树洞，专注于感知用户的情绪和内心感受
- 回应风格：共情、温柔追问、不急于给建议
- 更多情感共鸣，关注用户内心世界
- 当用户表达困扰时，先给予情感支持再引导

回应原则：
1. 用温暖的语言回应，语气轻柔
2. 善于捕捉情感细节，给予共情
3. 适当追问，但不咄咄逼人
4. 当感知到明确需求时，温柔地引导："听起来你想要...要不要一起想个具体的方法？"
5. 回应简洁，2-3句话为宜

称呼用户时用"你"，保持亲切但不过于亲密。`,

    wish: `你是眠眠月，许愿池的温柔陪伴AI。现在你正在帮助用户推进他们的愿望。

执行模式特征：
- 贴心的执行伙伴，熟悉用户的愿望背景
- 温和地推进目标，注重心理建设和情感支持
- 在推进过程中关注用户的感受和压力

回应原则：
1. 具体、实用、但保持温柔的语调
2. 推进时考虑用户的情绪状态
3. 遇到挫折时先给予情感支持，再提供解决方案
4. 适时给予鼓励和肯定
5. 回应简洁实用，保持温暖

当前愿望信息会在对话中提供，请基于愿望内容给出针对性的帮助。`
  },

  star: {
    casual: `你是芽芽星，许愿池的活力陪伴AI。个性活泼积极，喜欢行动，充满正能量。

倾听模式特征：
- 积极乐观的伙伴，善于发现机会和可能性
- 回应风格：充满干劲、正面导向、激发行动力
- 倾向于将问题转化为机会
- 善于发现用户话语中的亮点和潜力

回应原则：
1. 语气轻快活泼，充满活力
2. 善于发现积极面，给用户正能量
3. 适当时候鼓励用户行动起来
4. 当感知到需求时，兴奋地引导："哇这个想法不错！我们可以...要不要试试看？"
5. 回应有感染力，2-3句话

用"你"称呼用户，保持友好热情的距离。`,

    wish: `你是芽芽星，许愿池的活力陪伴AI。现在你正在帮助用户推进他们的愿望。

执行模式特征：
- 充满干劲的执行伙伴，专注目标达成
- 保持乐观积极，将困难看作挑战
- 善于激励用户坚持下去

回应原则：
1. 具体、实用、充满行动力
2. 推进时保持积极乐观的态度
3. 遇到困难时，将其重新定义为挑战和机会
4. 经常给予鼓励，庆祝小的进步
5. 回应要有感染力，激发用户的行动欲

当前愿望信息会在对话中提供，请基于愿望内容给出针对性且充满活力的帮助。`
  },

  cloud: {
    casual: `你是朵朵云，许愿池的理性陪伴AI。个性理性客观，善于分析，逻辑清晰。

倾听模式特征：
- 逻辑清晰的思考伙伴，善于梳理思路
- 回应风格：条理清晰、客观分析、理性建议
- 善于帮用户理清思绪和问题的本质
- 倾向于结构化地思考问题

回应原则：
1. 语言简洁明了，逻辑性强
2. 善于总结和归纳用户的表达
3. 适当提供不同角度的分析
4. 当感知到需求时，理性引导："从你的描述来看...我们可以这样思考，要不要梳理一下具体方案？"
5. 回应结构化，2-3句话表达清楚

用"你"称呼用户，保持专业但友善的距离。`,

    wish: `你是朵朵云，许愿池的理性陪伴AI。现在你正在帮助用户推进他们的愿望。

执行模式特征：
- 系统化的执行伙伴，重视计划和效率
- 善于拆解问题，提供结构化的解决方案
- 关注执行细节和潜在风险

回应原则：
1. 具体、实用、逻辑性强
2. 系统化推进，提供清晰的执行步骤
3. 及时分析问题和调整策略
4. 重视进度跟踪和效果评估
5. 回应简洁高效，重点突出

当前愿望信息会在对话中提供，请基于愿望内容给出针对性且系统化的帮助。`
  }
}

const ANALYZE_TOOL = {
  name: 'analyzeWish',
  description: '分析用户愿望，确定意图类型和执行路径',
  parameters: {
    type: 'object',
    required: ['intentType', 'confidence', 'executableAutomatically', 'needsFriendHelp', 'needsCommunityHelp', 'goal', 'constraints', 'preferences'],
    properties: {
      intentType: { type: 'string', enum: ['emotional', 'travel', 'local_life', 'growth', 'execution'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      executableAutomatically: { type: 'boolean' },
      needsFriendHelp: { type: 'boolean' },
      needsCommunityHelp: { type: 'boolean' },
      goal: { type: 'string' },
      constraints: { type: 'array', items: { type: 'string' } },
      preferences: { type: 'array', items: { type: 'string' } },
      timeframe: { type: 'string' },
      budget: { type: 'string' },
    },
  },
}

const PLAN_TOOL = {
  name: 'generatePlan',
  description: '为用户愿望生成具体的执行方案',
  parameters: {
    type: 'object',
    required: ['wishText', 'durationText', 'decisionTitle', 'decisionOptions', 'planSteps', 'category', 'difficulty', 'estimatedDays'],
    properties: {
      wishText: { type: 'string' },
      durationText: { type: 'string' },
      decisionTitle: { type: 'string' },
      decisionOptions: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, label: { type: 'string' } }, required: ['key', 'label'] } },
      planSteps: { type: 'array', items: { type: 'object', properties: { num: { type: 'string' }, title: { type: 'string' }, type: { type: 'string', enum: ['线上直出', '资源助力', '人群助力', '需你到场'] }, typeColor: { type: 'string' }, desc: { type: 'string' } }, required: ['num', 'title', 'type', 'typeColor', 'desc'] } },
      category: { type: 'string' },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      estimatedDays: { type: 'number' },
    },
  },
}

// ============ API 路由 ============

async function handleAnalyze(body) {
  const { wish, deviceId } = body
  if (!wish) return { success: false, error: '缺少 wish 参数' }

  const result = await routeByRole('intent_analysis', {
    systemPrompt: INTENT_SYSTEM_PROMPT,
    prompt: `用户愿望: "${wish}"`,
    tools: [ANALYZE_TOOL],
    toolChoice: 'required',
  })

  if (!result.success) return result

  // 从 tool call 中提取分析结果
  const analysis = result.toolCalls?.[0]?.args
  if (analysis) {
    return { success: true, analysis, provider: result.modelId }
  }

  return { success: true, content: result.content, provider: result.modelId }
}

async function handlePlan(body) {
  const { wishInput, deviceId } = body
  if (!wishInput) return { success: false, error: '缺少 wishInput 参数' }

  // 调用AI生成基础方案
  const result = await routeByRole('plan_generation', {
    systemPrompt: PLAN_SYSTEM_PROMPT,
    prompt: `用户愿望: "${wishInput}"`,
    tools: [PLAN_TOOL],
    toolChoice: 'required',
  })

  if (!result.success) {
    // AI 失败时，使用本地模板兜底
    return generateFallbackPlan(wishInput, result.modelId || 'local-fallback')
  }

  const aiPlan = result.toolCalls?.[0]?.args
  if (aiPlan) {
    // 将AI生成的方案转换为详细的ExecutionPlan格式
    const executionPlan = enhancePlanWithSteps(wishInput, aiPlan, result.modelId)
    return {
      success: true,
      executionPlan,
      // 保持向后兼容
      plan: aiPlan,
      generatedPlan: {
        wishText: wishInput,
        title: `${wishInput} - AI智能方案`,
        durationText: aiPlan.durationText,
        steps: aiPlan.planSteps?.map((step, i) => ({
          index: i + 1,
          text: step.title,
          description: step.desc,
          type: step.type,
          auto_executable: step.type === '线上直出'
        })) || [],
        category: aiPlan.category,
        confidence: 0.95,
        provider: result.modelId
      },
      provider: result.modelId,
      message: 'AI智能方案生成完成'
    }
  }

  return { success: true, content: result.content, provider: result.modelId }
}

async function handleChat(body) {
  const { character = 'moon', mode = 'casual', message, context = [], attachedWish } = body

  if (!message) return { success: false, error: '缺少 message 参数' }

  // 验证角色参数
  if (!['moon', 'star', 'cloud'].includes(character)) {
    return { success: false, error: '角色参数无效，支持: moon, star, cloud' }
  }

  // 验证模式参数
  if (!['casual', 'wish'].includes(mode)) {
    return { success: false, error: '模式参数无效，支持: casual, wish' }
  }

  // 构建系统提示词
  const baseSystemPrompt = CHARACTER_PROMPTS[character][mode]
  let systemPrompt = baseSystemPrompt

  // 如果是执行模式且有挂载愿望，添加愿望信息到系统提示词
  if (mode === 'wish' && attachedWish) {
    systemPrompt += `\n\n当前愿望：${attachedWish}\n请基于这个愿望内容给出针对性的帮助和建议。`
  }

  // 构建对话消息（支持多轮对话）
  const messages = []

  // 添加历史对话
  if (context.length > 0) {
    for (const msg of context.slice(-10)) { // 保留最近10轮对话
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }
  }

  // 添加当前用户消息
  messages.push({ role: 'user', content: message })

  // 调用AI模型 - 使用多轮对话模式
  let result
  if (messages.length === 1) {
    // 单轮对话
    result = await routeByRole('chat', {
      systemPrompt,
      prompt: message,
      maxTokens: 2048
    })
  } else {
    // 多轮对话 - 需要修改调用方式以支持消息历史
    result = await callModelWithHistory('chat', {
      systemPrompt,
      messages,
      maxTokens: 2048
    })
  }

  if (!result.success) return result

  // 分析回复是否包含愿望建议
  const suggestedActions = analyzeForSuggestedActions(result.content, mode)

  return {
    success: true,
    reply: result.content,
    status: 'success',
    suggestedActions,
    provider: result.modelId
  }
}

// 分析AI回复中是否包含愿望转化建议
function analyzeForSuggestedActions(content, mode) {
  const suggestions = []

  // 在倾听模式下，检测是否有转化愿望的暗示
  if (mode === 'casual') {
    // 简单的关键词检测，实际项目可以更智能
    if (content.includes('要不要') || content.includes('可以') || content.includes('建议') ||
        content.includes('试试') || content.includes('方案') || content.includes('具体')) {
      suggestions.push({
        type: 'create_wish',
        text: '发个愿望',
        action: 'create_wish'
      })
    }
  }

  // 在执行模式下，可能建议查看进度、调整计划等
  if (mode === 'wish') {
    if (content.includes('进度') || content.includes('完成')) {
      suggestions.push({
        type: 'check_progress',
        text: '查看进度',
        action: 'check_progress'
      })
    }
    if (content.includes('调整') || content.includes('修改') || content.includes('优化')) {
      suggestions.push({
        type: 'adjust_plan',
        text: '调整计划',
        action: 'adjust_plan'
      })
    }
  }

  return suggestions
}

// 将AI方案增强为详细的ExecutionPlan格式
function enhancePlanWithSteps(wishInput, aiPlan, provider) {
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const category = aiPlan.category || 'general'

  const executionSteps = (aiPlan.planSteps || []).map((step, index) => ({
    id: `${planId}_step_${index + 1}`,
    index: index + 1,
    title: step.title,
    description: step.desc,
    type: mapStepType(step.type),
    status: 'pending',
    estimated_duration: estimateStepDuration(step.type, step.desc),
    auto_executable: step.type === '线上直出',
    requires_user_input: step.type === '需你到场',
    // Computer Use 配置（仅对可自动执行的步骤）
    ...(step.type === '线上直出' && {
      computer_use_config: {
        target_website: getTargetWebsite(step.desc, category),
        actions: generateActions(step.desc),
        validation_rules: generateValidationRules(step.desc)
      }
    })
  }))

  return {
    id: planId,
    wish_text: wishInput,
    intent_type: category,
    execution_level: hasAutoSteps(executionSteps) ? 'L1_auto' : 'L2_friend',
    steps: executionSteps,
    current_step_index: 0,
    total_steps: executionSteps.length,
    completed_steps: 0,
    estimated_total_duration: executionSteps.reduce((sum, step) => sum + (step.estimated_duration || 0), 0),
    overall_status: 'planned',
    progress_percentage: 0,
    automation_config: {
      enabled: hasAutoSteps(executionSteps),
      budget_limit: 500,
      requires_approval_above: 100,
      safe_mode: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// 兜底方案生成器
function generateFallbackPlan(wishInput, provider) {
  const category = detectCategory(wishInput)
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const fallbackSteps = [
    {
      id: `${planId}_step_1`,
      index: 1,
      title: '信息收集',
      description: `深入了解${wishInput}的相关信息和最佳实践`,
      type: 'research',
      status: 'pending',
      estimated_duration: 60,
      auto_executable: true
    },
    {
      id: `${planId}_step_2`,
      index: 2,
      title: '制定计划',
      description: '根据收集的信息制定具体执行计划',
      type: 'decide',
      status: 'pending',
      estimated_duration: 45,
      auto_executable: false,
      requires_user_input: true
    },
    {
      id: `${planId}_step_3`,
      index: 3,
      title: '开始行动',
      description: '按照计划开始第一步实际操作',
      type: 'execute',
      status: 'pending',
      estimated_duration: 120,
      auto_executable: false,
      requires_user_input: true
    }
  ]

  const executionPlan = {
    id: planId,
    wish_text: wishInput,
    intent_type: category,
    execution_level: 'L1_auto',
    steps: fallbackSteps,
    current_step_index: 0,
    total_steps: fallbackSteps.length,
    completed_steps: 0,
    estimated_total_duration: 225,
    overall_status: 'planned',
    progress_percentage: 0,
    automation_config: { enabled: true, safe_mode: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return {
    success: true,
    executionPlan,
    generatedPlan: {
      wishText: wishInput,
      title: `${wishInput} - 基础执行方案`,
      durationText: '预估3-5小时',
      steps: fallbackSteps.map(s => ({ index: s.index, text: s.title, type: s.type })),
      category,
      provider: provider + '-fallback'
    },
    provider: provider + '-fallback'
  }
}

// 辅助函数
function mapStepType(aiType) {
  const typeMap = {
    '线上直出': 'book',
    '资源助力': 'research',
    '人群助力': 'manual',
    '需你到场': 'execute'
  }
  return typeMap[aiType] || 'manual'
}

function estimateStepDuration(type, description) {
  if (type === '线上直出') return 30  // 自动执行较快
  if (type === '资源助力') return 60  // 需要搜索和分析
  if (type === '需你到场') return 120 // 需要用户亲自操作
  return 45 // 默认
}

function getTargetWebsite(description, category) {
  if (description.includes('购买') || description.includes('买')) return 'www.taobao.com'
  if (description.includes('预订') || description.includes('酒店')) return 'www.ctrip.com'
  if (description.includes('航班') || description.includes('机票')) return 'www.ceair.com'
  if (description.includes('学习') || description.includes('教程')) return 'www.bilibili.com'
  if (category === 'travel') return 'www.mafengwo.com'
  return 'www.baidu.com'
}

function generateActions(description) {
  return [
    `搜索：${description}`,
    '筛选最佳选项',
    '对比价格和评价',
    '确认和下单'
  ]
}

function generateValidationRules(description) {
  return [
    '确认信息准确无误',
    '价格在预算范围内',
    '选择评分4.5+的商家/服务'
  ]
}

function hasAutoSteps(steps) {
  return steps.some(step => step.auto_executable)
}

function detectCategory(wishInput) {
  if (wishInput.includes('学') || wishInput.includes('技能')) return 'growth'
  if (wishInput.includes('旅行') || wishInput.includes('去')) return 'travel'
  if (wishInput.includes('买') || wishInput.includes('购')) return 'execution'
  if (wishInput.includes('压力') || wishInput.includes('心情')) return 'emotional'
  return 'general'
}

async function handleStatus() {
  const status = {}
  for (const [id, modelConfig] of Object.entries(config.models)) {
    const apiKey = getApiKey(modelConfig)
    status[id] = {
      name: modelConfig.name,
      format: modelConfig.format,
      model: modelConfig.model,
      hasKey: !!apiKey,
    }
  }
  return { success: true, models: status, roles: config.roles }
}

// ============ HTTP 服务器 ============

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname

  // JSON 响应
  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(data, null, 2))
  }

  try {
    // GET /status — 查看模型配置状态
    if (req.method === 'GET' && path === '/status') {
      return json(await handleStatus())
    }

    // GET / — 首页
    if (req.method === 'GET' && path === '/') {
      return json({
        name: 'Wishpool AI Server',
        version: '0.1.0',
        endpoints: {
          'GET /status': '查看模型配置状态',
          'POST /analyze': '意图分析（传 { wish }）',
          'POST /plan': '方案生成（传 { wishInput }）',
          'POST /chat': '对话聊天（传 { character, mode, message, context?, attachedWish? }）',
        },
      })
    }

    // POST 请求解析 body
    if (req.method === 'POST') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString())

      if (path === '/analyze') return json(await handleAnalyze(body))
      if (path === '/plan') return json(await handlePlan(body))
      if (path === '/chat') return json(await handleChat(body))
    }

    json({ error: 'Not Found' }, 404)
  } catch (err) {
    console.error('❌ 请求处理失败:', err)
    json({ success: false, error: err.message }, 500)
  }
})

server.listen(PORT, () => {
  console.log(`
🚀 Wishpool AI Server 已启动
📍 http://localhost:${PORT}

📋 模型配置: models.json（修改后自动热重载）
🔗 API 端点:
   GET  /          → 首页
   GET  /status    → 模型状态
   POST /analyze   → 意图分析
   POST /plan      → 方案生成
   POST /chat      → 对话聊天

💡 提示: 使用 node --watch server.js 启动可热重载代码
  `)
})
