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

💡 提示: 使用 node --watch server.js 启动可热重载代码
  `)
})
