/**
 * Computer Use 执行器
 * 基于 Anthropic Computer Use API 的自动化执行核心
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export class ComputerUseExecutor {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || process.env.KIMI_CODE_API_KEY
    this.baseURL = config.baseURL || 'https://api.anthropic.com' // 或 https://api.kimi.com/coding/
    this.model = config.model || 'claude-3-5-sonnet-20241022'
    this.displaySize = config.displaySize || { width: 1024, height: 768 }
    this.screenshotPath = config.screenshotPath || '/tmp/screenshots'
    this.maxSteps = config.maxSteps || 20

    this.executionLog = []
    this.currentStep = 0
  }

  /**
   * 执行自动化任务
   */
  async execute(task) {
    console.log(`🤖 开始执行任务: ${task.title}`)

    try {
      // 初始化执行环境
      await this.initializeEnvironment(task)

      // 如果没有API Key，返回模拟执行结果
      if (!this.apiKey) {
        console.log('⚠️ 无API Key，返回模拟执行结果')
        return await this.simulateExecution(task)
      }

      // 获取初始截图
      const initialScreenshot = await this.takeScreenshot('initial')

      // 开始自动化执行循环
      let currentInstruction = task.instruction
      let stepCount = 0

      while (stepCount < this.maxSteps) {
        stepCount++
        console.log(`📋 执行步骤 ${stepCount}: ${currentInstruction.substring(0, 50)}...`)

        const result = await this.executeStep({
          instruction: currentInstruction,
          screenshot: await this.takeScreenshot(`step_${stepCount}_before`)
        })

        this.logStep(stepCount, result)

        // 检查是否完成
        if (result.completed) {
          console.log(`✅ 任务完成: ${result.message}`)
          return {
            success: true,
            steps: this.executionLog,
            finalScreenshot: await this.takeScreenshot('final'),
            message: result.message
          }
        }

        // 检查是否需要用户干预
        if (result.requiresUserInput) {
          console.log(`⚠️ 需要用户干预: ${result.message}`)
          return {
            success: false,
            requiresUserInput: true,
            steps: this.executionLog,
            currentScreenshot: await this.takeScreenshot(`step_${stepCount}_paused`),
            message: result.message
          }
        }

        // 更新下一步指令
        if (result.nextInstruction) {
          currentInstruction = result.nextInstruction
        }
      }

      // 超过最大步数
      console.log(`⚠️ 执行超过最大步数限制 (${this.maxSteps})`)
      return {
        success: false,
        error: 'STEP_LIMIT_EXCEEDED',
        steps: this.executionLog,
        message: `执行步数超过限制 (${this.maxSteps} 步)`
      }

    } catch (error) {
      console.error('❌ 执行失败:', error)
      return {
        success: false,
        error: error.message,
        steps: this.executionLog
      }
    }
  }

  /**
   * 模拟执行（用于无API Key时的演示）
   */
  async simulateExecution(task) {
    console.log('🎭 模拟执行模式 - 演示Computer Use工作流程')

    const simulationSteps = [
      { action: 'screenshot', message: `获取初始屏幕状态` },
      { action: 'navigate', message: `导航到目标网站: ${task.targetWebsite}` },
      { action: 'screenshot', message: `确认页面加载完成` },
      { action: 'search', message: `执行搜索或操作: ${task.title}` },
      { action: 'analyze', message: `分析页面内容和结果` },
      { action: 'complete', message: `任务执行完成` }
    ]

    for (let i = 0; i < simulationSteps.length; i++) {
      const step = simulationSteps[i]
      console.log(`🔄 步骤 ${i + 1}/${simulationSteps.length}: ${step.message}`)

      this.logStep(i + 1, {
        action: step.action,
        message: step.message,
        success: true,
        simulated: true
      })

      // 模拟执行时间
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    return {
      success: true,
      steps: this.executionLog,
      finalScreenshot: 'mock_final_screenshot.png',
      message: `模拟执行完成: ${task.title}`,
      simulated: true
    }
  }

  /**
   * 执行单个步骤
   */
  async executeStep({ instruction, screenshot }) {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: instruction
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: screenshot
            }
          }
        ]
      }
    ]

    const response = await this.callComputerUseAPI({
      model: this.model,
      max_tokens: 1024,
      messages,
      tools: [{
        type: 'computer_20241022',
        name: 'computer',
        display_width_px: this.displaySize.width,
        display_height_px: this.displaySize.height
      }]
    })

    return this.parseStepResult(response)
  }

  /**
   * 调用 Computer Use API
   */
  async callComputerUseAPI(payload) {
    const headers = {
      'Content-Type': 'application/json'
    }

    let apiURL = `${this.baseURL}/v1/messages`

    // 根据不同的API提供商设置请求格式
    if (this.baseURL.includes('kimi.com')) {
      // Kimi Code API (Anthropic 兼容格式)
      headers['Authorization'] = `Bearer ${this.apiKey}`
      headers['anthropic-version'] = '2023-06-01'
    } else {
      // 原生 Anthropic API
      headers['x-api-key'] = this.apiKey
      headers['anthropic-version'] = '2023-06-01'
    }

    console.log(`🔌 调用 Computer Use API: ${this.baseURL}`)
    console.log(`🛠️ 工具类型: ${payload.tools?.[0]?.type || '无工具'}`)

    const response = await fetch(apiURL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Computer Use API 调用失败: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * 解析步骤执行结果
   */
  parseStepResult(apiResponse) {
    const content = apiResponse.content || []
    const textContent = content.find(c => c.type === 'text')?.text || ''
    const toolUse = content.find(c => c.type === 'tool_use')

    console.log(`🧠 AI响应解析:`, { textContent: textContent.substring(0, 100), hasToolUse: !!toolUse })

    // 首先检查文本内容中的完成状态
    if (this.checkCompletionSignals(textContent)) {
      return {
        completed: true,
        message: this.extractCompletionMessage(textContent),
        action: 'complete',
        analysis: textContent
      }
    }

    // 检查是否需要用户干预
    if (this.checkUserInputRequired(textContent)) {
      return {
        completed: false,
        requiresUserInput: true,
        message: this.extractUserInputMessage(textContent),
        action: 'user_input',
        analysis: textContent
      }
    }

    // 处理工具调用
    if (toolUse) {
      return this.parseToolUse(toolUse, textContent)
    }

    // 如果没有工具调用但有文本响应，说明AI在分析或给出建议
    if (textContent) {
      return {
        completed: false,
        action: 'analyze',
        message: `AI分析: ${textContent.substring(0, 200)}${textContent.length > 200 ? '...' : ''}`,
        nextInstruction: this.generateNextInstruction(textContent),
        analysis: textContent
      }
    }

    // 默认情况：无法解析响应
    return {
      completed: false,
      action: 'unknown',
      message: '无法解析AI响应，继续下一步',
      nextInstruction: '继续执行任务或请求更多信息'
    }
  }

  /**
   * 检查完成信号
   */
  checkCompletionSignals(text) {
    const completionKeywords = [
      '任务完成', '已完成', '执行完成', 'completed', 'finished',
      '成功完成', '目标达成', '操作成功', '搜索完成', '购买完成'
    ]
    return completionKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * 检查是否需要用户输入
   */
  checkUserInputRequired(text) {
    const userInputKeywords = [
      '需要用户', '请用户', '需要手动', '需要确认', '用户操作',
      '请输入', '请选择', '需要登录', '需要支付', 'user input required'
    ]
    return userInputKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * 提取完成消息
   */
  extractCompletionMessage(text) {
    const sentences = text.split(/[。！.!]/);
    for (const sentence of sentences) {
      if (this.checkCompletionSignals(sentence)) {
        return sentence.trim() || '任务已完成';
      }
    }
    return '任务执行完成';
  }

  /**
   * 提取用户输入消息
   */
  extractUserInputMessage(text) {
    const sentences = text.split(/[。！.!]/);
    for (const sentence of sentences) {
      if (this.checkUserInputRequired(sentence)) {
        return sentence.trim() || '需要用户手动操作';
      }
    }
    return '需要用户干预';
  }

  /**
   * 解析工具调用
   */
  parseToolUse(toolUse, contextText) {
    const { action, ...params } = toolUse.input || {}

    switch (action) {
      case 'screenshot':
        return {
          completed: false,
          action: 'screenshot',
          message: '获取屏幕截图中...',
          nextInstruction: this.generateNextInstruction(contextText) || '分析截图内容并继续操作'
        }

      case 'click':
        return {
          completed: false,
          action: 'click',
          coordinate: params.coordinate,
          message: `点击位置 (${params.coordinate?.[0] || '?'}, ${params.coordinate?.[1] || '?'})`,
          nextInstruction: '等待页面响应并获取新状态'
        }

      case 'type':
        return {
          completed: false,
          action: 'type',
          text: params.text,
          message: `输入文本: "${params.text}"`,
          nextInstruction: '确认输入内容并继续下一步'
        }

      case 'scroll':
        return {
          completed: false,
          action: 'scroll',
          direction: params.scroll_direction,
          coordinate: params.coordinate,
          message: `滚动页面: ${params.scroll_direction || '未指定方向'}`,
          nextInstruction: '检查滚动后的页面内容'
        }

      case 'key':
        return {
          completed: false,
          action: 'key',
          key: params.key,
          message: `按键操作: ${params.key}`,
          nextInstruction: '等待按键响应并继续'
        }

      default:
        return {
          completed: false,
          action: action || 'unknown_tool',
          message: `执行工具操作: ${action || '未知'}`,
          nextInstruction: this.generateNextInstruction(contextText) || '继续执行下一步',
          params
        }
    }
  }

  /**
   * 根据上下文生成下一步指令
   */
  generateNextInstruction(text) {
    if (!text) return null

    // 从AI的分析中提取下一步建议
    const nextStepPatterns = [
      /接下来(.+?)(?:[。！.]|$)/,
      /下一步(.+?)(?:[。！.]|$)/,
      /然后(.+?)(?:[。！.]|$)/,
      /需要(.+?)(?:[。！.]|$)/
    ]

    for (const pattern of nextStepPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return `${match[1].trim()}`
      }
    }

    return null
  }

  /**
   * 初始化执行环境
   */
  async initializeEnvironment(task) {
    console.log('🔧 初始化执行环境...')

    // 这里将来会启动 Docker 容器和虚拟显示
    // 目前先模拟
    this.sessionId = `session_${Date.now()}`
    this.executionLog = []
    this.currentStep = 0

    console.log(`📋 会话ID: ${this.sessionId}`)
    console.log(`🎯 目标网站: ${task.targetWebsite || '未指定'}`)
    console.log(`💰 预算限制: ${task.budgetLimit || '无限制'}`)
  }

  /**
   * 截图
   */
  async takeScreenshot(stepName) {
    // 模拟截图 - 将来会调用真实的截图 API
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${this.sessionId}_${stepName}_${timestamp}.png`

    // 返回 base64 编码的模拟截图
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  /**
   * 记录执行步骤
   */
  logStep(stepNumber, result) {
    const logEntry = {
      step: stepNumber,
      timestamp: new Date().toISOString(),
      action: result.action,
      message: result.message,
      success: !result.error,
      ...result
    }

    this.executionLog.push(logEntry)
    console.log(`📝 步骤 ${stepNumber} 已记录:`, result.message)
  }

  /**
   * 清理执行环境
   */
  async cleanup() {
    console.log('🧹 清理执行环境...')

    // 这里将来会清理 Docker 容器
    // 保存执行日志
    const logFile = `execution_log_${this.sessionId}.json`
    writeFileSync(logFile, JSON.stringify(this.executionLog, null, 2))

    console.log(`📄 执行日志已保存: ${logFile}`)
  }
}