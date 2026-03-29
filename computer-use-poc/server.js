/**
 * Computer Use POC Server
 * 为 Wishpool L1 自动执行提供 Computer Use 服务
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ComputerUseExecutor } from './executor/computer-use.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.COMPUTER_USE_PORT || 3200

// 当前执行会话管理
const activeSessions = new Map()

// ============ API 路由处理 ============

async function handleExecute(body) {
  const { stepConfig, sessionId } = body

  if (!stepConfig) {
    return { success: false, error: '缺少 stepConfig 参数' }
  }

  try {
    // 创建或复用执行器实例
    let executor = activeSessions.get(sessionId)
    if (!executor) {
      executor = new ComputerUseExecutor({
        apiKey: process.env.KIMI_CODE_API_KEY || process.env.ANTHROPIC_API_KEY,
        baseURL: process.env.KIMI_CODE_API_KEY ? 'https://api.kimi.com/coding' : 'https://api.anthropic.com'
      })
      activeSessions.set(sessionId, executor)
    }

    // 构造执行任务
    const task = {
      title: stepConfig.title,
      instruction: buildInstruction(stepConfig),
      targetWebsite: stepConfig.computer_use_config?.target_website,
      budgetLimit: stepConfig.automation_config?.budget_limit || 500
    }

    console.log(`🚀 开始执行 Computer Use 任务: ${task.title}`)
    console.log(`🎯 目标: ${stepConfig.description}`)
    console.log(`🌐 网站: ${task.targetWebsite}`)

    // 执行自动化任务
    const result = await executor.execute(task)

    return {
      success: true,
      sessionId,
      stepResult: {
        completed: result.success,
        message: result.message,
        requiresUserInput: result.requiresUserInput,
        screenshot_url: result.finalScreenshot ? `/screenshot/${sessionId}/final` : null,
        execution_logs: result.steps
      }
    }

  } catch (error) {
    console.error('❌ Computer Use 执行失败:', error)
    return {
      success: false,
      error: error.message,
      sessionId
    }
  }
}

async function handleScreenshot(sessionId, screenshotName) {
  // 返回模拟截图数据
  return {
    success: true,
    sessionId,
    screenshotName,
    url: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
    timestamp: new Date().toISOString()
  }
}

async function handleStop(sessionId) {
  const executor = activeSessions.get(sessionId)
  if (executor) {
    await executor.cleanup()
    activeSessions.delete(sessionId)
  }

  return {
    success: true,
    sessionId,
    message: '执行已停止，环境已清理'
  }
}

async function handleStatus() {
  return {
    success: true,
    activeSessionsCount: activeSessions.size,
    activeSessions: Array.from(activeSessions.keys()),
    environment: {
      computerUseAPI: process.env.KIMI_CODE_API_KEY ? 'Kimi Code' : 'Anthropic',
      hasAPIKey: !!(process.env.KIMI_CODE_API_KEY || process.env.ANTHROPIC_API_KEY),
      dockerSupport: false, // 将来实现
      displaySize: { width: 1024, height: 768 }
    }
  }
}

// ============ 辅助函数 ============

function buildInstruction(stepConfig) {
  const { title, description, computer_use_config } = stepConfig

  let instruction = `任务: ${title}\n目标: ${description}\n\n`

  if (computer_use_config) {
    instruction += `请按以下步骤执行:\n`
    computer_use_config.actions?.forEach((action, i) => {
      instruction += `${i + 1}. ${action}\n`
    })

    instruction += `\n验证规则:\n`
    computer_use_config.validation_rules?.forEach((rule, i) => {
      instruction += `- ${rule}\n`
    })
  }

  instruction += `\n请开始执行，每一步都要先截图确认当前状态，然后进行操作。如果遇到问题或需要用户干预，请明确说明。`

  return instruction
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

  // JSON 响应辅助函数
  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(data, null, 2))
  }

  try {
    // GET /status — 查看服务状态
    if (req.method === 'GET' && path === '/status') {
      return json(await handleStatus())
    }

    // GET / — 首页
    if (req.method === 'GET' && path === '/') {
      return json({
        name: 'Wishpool Computer Use POC',
        version: '0.1.0',
        endpoints: {
          'GET /status': '查看服务状态和活跃会话',
          'POST /execute': '执行自动化任务（传 { stepConfig, sessionId }）',
          'GET /screenshot/:sessionId/:name': '获取执行截图',
          'POST /stop/:sessionId': '停止指定会话的执行'
        },
        documentation: 'https://docs.anthropic.com/claude/docs/computer-use'
      })
    }

    // GET /screenshot/:sessionId/:name — 获取截图
    if (req.method === 'GET' && path.startsWith('/screenshot/')) {
      const parts = path.split('/')
      const sessionId = parts[2]
      const screenshotName = parts[3]
      return json(await handleScreenshot(sessionId, screenshotName))
    }

    // POST 请求解析 body
    if (req.method === 'POST') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString())

      if (path === '/execute') {
        return json(await handleExecute(body))
      }

      if (path.startsWith('/stop/')) {
        const sessionId = path.split('/')[2]
        return json(await handleStop(sessionId))
      }
    }

    json({ error: 'Not Found' }, 404)

  } catch (err) {
    console.error('❌ 请求处理失败:', err)
    json({ success: false, error: err.message }, 500)
  }
})

server.listen(PORT, () => {
  console.log(`
🤖 Wishpool Computer Use POC 已启动
📍 http://localhost:${PORT}

🔧 环境配置:
   Computer Use API: ${process.env.KIMI_CODE_API_KEY ? 'Kimi Code' : 'Anthropic Claude'}
   API Key: ${!!(process.env.KIMI_CODE_API_KEY || process.env.ANTHROPIC_API_KEY) ? '✅ 已配置' : '❌ 未配置'}
   Docker 支持: ⏳ 待实现

🚀 API 端点:
   GET  /status      → 服务状态
   POST /execute     → 执行自动化任务
   GET  /screenshot  → 获取执行截图
   POST /stop        → 停止执行

💡 下一步: 集成到 Wishpool AI Agent 系统
  `)
})