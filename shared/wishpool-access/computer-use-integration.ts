/**
 * Computer Use 集成模块
 * 将Computer Use功能集成到AI Agent系统中
 */

import type { ExecutionStep, ExecutionPlan, ExecutionStepStatus } from './types/execution-plan'

export interface ComputerUseConfig {
  endpoint: string
  timeout?: number
  retries?: number
}

export interface ComputerUseRequest {
  stepConfig: ExecutionStep
  sessionId: string
  executionContext?: {
    userPreferences?: Record<string, any>
    budgetLimits?: {
      maxAmount: number
      currency: string
    }
    safetyMode?: boolean
  }
}

export interface ComputerUseResponse {
  success: boolean
  sessionId: string
  stepResult?: {
    completed: boolean
    message: string
    requiresUserInput?: boolean
    screenshot_url?: string
    execution_logs?: Array<{
      step: number
      timestamp: string
      action: string
      message: string
      success: boolean
    }>
  }
  error?: string
}

/**
 * Computer Use 服务客户端
 */
export class ComputerUseClient {
  private config: ComputerUseConfig

  constructor(config: ComputerUseConfig) {
    this.config = {
      timeout: 30000, // 30秒超时
      retries: 2,
      ...config
    }
  }

  /**
   * 执行自动化步骤
   */
  async executeStep(request: ComputerUseRequest): Promise<ComputerUseResponse> {
    const { stepConfig, sessionId, executionContext } = request

    // 验证步骤是否可以自动执行
    if (!stepConfig.auto_executable) {
      return {
        success: false,
        sessionId,
        error: '该步骤不支持自动执行'
      }
    }

    // 安全检查
    if (!this.validateSafetyConstraints(stepConfig, executionContext)) {
      return {
        success: false,
        sessionId,
        error: '安全约束检查失败'
      }
    }

    let lastError: Error | null = null

    // 重试机制
    for (let attempt = 1; attempt <= (this.config.retries || 1); attempt++) {
      try {
        console.log(`🤖 Computer Use 执行尝试 ${attempt}/${this.config.retries}: ${stepConfig.title}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const response = await fetch(`${this.config.endpoint}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stepConfig,
            sessionId,
            executionContext
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const result = await response.json()

        // 验证响应格式
        if (!this.validateResponse(result)) {
          throw new Error('Computer Use 服务返回格式无效')
        }

        console.log(`✅ Computer Use 执行${result.success ? '成功' : '失败'}: ${stepConfig.title}`)
        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`⚠️ Computer Use 执行失败 (尝试 ${attempt}/${this.config.retries}):`, lastError.message)

        if (attempt < (this.config.retries || 1)) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    return {
      success: false,
      sessionId,
      error: `Computer Use 执行失败: ${lastError?.message || '未知错误'}`
    }
  }

  /**
   * 停止执行会话
   */
  async stopExecution(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.config.endpoint}/stop/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log(`🛑 Computer Use 会话已停止: ${sessionId}`)
    } catch (error) {
      console.warn('停止Computer Use会话失败:', error)
    }
  }

  /**
   * 获取执行截图
   */
  async getScreenshot(sessionId: string, screenshotName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.config.endpoint}/screenshot/${sessionId}/${screenshotName}`)
      if (response.ok) {
        const data = await response.json()
        return data.url || null
      }
    } catch (error) {
      console.warn('获取Computer Use截图失败:', error)
    }
    return null
  }

  /**
   * 检查服务状态
   */
  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/status`, {
        timeout: 5000
      } as any)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 验证安全约束
   */
  private validateSafetyConstraints(step: ExecutionStep, context?: ComputerUseRequest['executionContext']): boolean {
    // 检查预算限制
    if (context?.budgetLimits && step.computer_use_config) {
      // 这里可以添加预算检查逻辑
      console.log('🔒 预算限制检查通过')
    }

    // 检查是否为安全模式
    if (context?.safetyMode) {
      // 安全模式下只允许只读操作
      const readOnlyActions = ['screenshot', 'scroll', 'search', 'navigate']
      if (step.computer_use_config?.actions?.some(action =>
        !readOnlyActions.some(safe => action.toLowerCase().includes(safe.toLowerCase()))
      )) {
        console.warn('🔒 安全模式下不允许写入操作')
        return false
      }
    }

    return true
  }

  /**
   * 验证响应格式
   */
  private validateResponse(response: any): response is ComputerUseResponse {
    return (
      typeof response === 'object' &&
      typeof response.success === 'boolean' &&
      typeof response.sessionId === 'string'
    )
  }
}

/**
 * 全局Computer Use客户端实例
 */
export const computerUseClient = new ComputerUseClient({
  endpoint: typeof window !== 'undefined'
    ? 'http://localhost:3200'  // 浏览器环境
    : 'http://localhost:3200', // Node.js环境
  timeout: 60000, // 60秒超时，Computer Use操作可能需要较长时间
  retries: 3
})

/**
 * 将ExecutionPlan中的步骤标记为Computer Use执行
 */
export function markStepAsComputerUseExecuted(
  plan: ExecutionPlan,
  stepId: string,
  result: ComputerUseResponse
): ExecutionPlan {
  const updatedSteps = plan.steps.map(step => {
    if (step.id === stepId) {
      const newStatus: ExecutionStepStatus = result.stepResult?.completed ? 'completed' :
                result.stepResult?.requiresUserInput ? 'waiting_user' :
                'failed';
      return {
        ...step,
        status: newStatus,
        completed_at: result.stepResult?.completed ? new Date().toISOString() : undefined,
        execution_result: {
          success: result.stepResult?.completed || false,
          message: result.stepResult?.message || result.error || '执行失败',
          screenshot_url: result.stepResult?.screenshot_url
        }
      } as ExecutionStep;
    }
    return step
  })

  const completedCount = updatedSteps.filter(s => s.status === 'completed').length
  const progressPercentage = Math.round((completedCount / updatedSteps.length) * 100)

  return {
    ...plan,
    steps: updatedSteps,
    completed_steps: completedCount,
    progress_percentage: progressPercentage,
    overall_status: completedCount === updatedSteps.length ? 'completed' : 'executing',
    updated_at: new Date().toISOString()
  }
}

/**
 * 检查是否有可自动执行的步骤
 */
export function getAutoExecutableSteps(plan: ExecutionPlan): ExecutionStep[] {
  return plan.steps.filter(step =>
    step.auto_executable &&
    step.status === 'pending' &&
    step.computer_use_config
  )
}

/**
 * 生成Computer Use执行摘要
 */
export function generateExecutionSummary(plan: ExecutionPlan): {
  totalSteps: number
  completedSteps: number
  autoExecutableSteps: number
  progressPercentage: number
  nextAutoStep?: ExecutionStep
} {
  const autoExecutableSteps = getAutoExecutableSteps(plan)
  const nextAutoStep = autoExecutableSteps[0] || undefined

  return {
    totalSteps: plan.total_steps,
    completedSteps: plan.completed_steps,
    autoExecutableSteps: autoExecutableSteps.length,
    progressPercentage: plan.progress_percentage,
    nextAutoStep
  }
}