export interface WishpoolAgentSupabaseClient {
  functions: {
    invoke(name: string, input: { body: Record<string, unknown> }): any;
  };
  rpc(name: string, args?: Record<string, unknown>): any;
}

export interface WishAnalysis {
  intentType: "emotional" | "travel" | "local_life" | "growth" | "execution";
  confidence: number;
  executableAutomatically: boolean;
  needsFriendHelp: boolean;
  needsCommunityHelp: boolean;
  goal: string;
  constraints: string[];
  preferences: string[];
  timeframe?: string;
  budget?: string;
}

export interface LegacyExecutionPlan {
  steps: Array<{
    step: number;
    title: string;
    type: "auto" | "friend" | "community";
    description: string;
    estimatedTime?: string;
  }>;
  totalEstimate: string;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  message?: string;
  analysis?: WishAnalysis;
  plan?: LegacyExecutionPlan;
  result?: string;
  nextStep?: number | null;
  error?: string;
}

export interface GeneratedPlan {
  wishText: string;
  durationText: string;
  decisionTitle: string;
  decisionOptions: Array<{ key: string; label: string }>;
  planSteps: Array<{
    num: string;
    title: string;
    type: string;
    typeColor: string;
    desc: string;
  }>;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedDays: number;
}

// Computer Use 相关类型（导入自集成模块）
export type { ExecutionPlan, ExecutionStep } from './types/execution-plan'
export type { ComputerUseConfig, ComputerUseRequest, ComputerUseResponse } from './computer-use-integration'

export function mapIntentToScenario(intentType: string): number {
  const intentToScenario: Record<string, number> = {
    travel: 2,
    growth: 1,
    local_life: 3,
    execution: 4,
    emotional: 7,
  };

  return intentToScenario[intentType] || 2;
}

function generatePlanFromTemplate(wishInput: string): GeneratedPlan {
  const input = wishInput.trim().toLowerCase();

  if (input.includes("海边") || input.includes("海滩") || input.includes("放松") || input.includes("旅行")) {
    return {
      wishText: wishInput.trim(),
      durationText: "预计 3-5 天完成",
      decisionTitle: "AI 需要你决定：这次海边之行你更想要什么体验？",
      decisionOptions: [
        { key: "relax", label: "纯放松休闲" },
        { key: "activity", label: "海上活动体验" },
        { key: "photo", label: "拍照打卡风景" },
      ],
      planSteps: [
        { num: "①", title: "筛选适合的海边目的地和住宿", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动搜索推荐" },
        { num: "②", title: "预订交通和酒店，准备物品清单", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
        { num: "③", title: "找同行伙伴或当地向导推荐", type: "人群助力", typeColor: "#c084fc", desc: "AI匹配志同道合的旅友" },
        { num: "④", title: "开始海边放松之旅", type: "需你到场", typeColor: "#f97316", desc: "你本人享受旅程" },
      ],
      category: "生活体验",
      difficulty: "easy",
      estimatedDays: 4,
    };
  }

  if (input.includes("学习") || input.includes("技能") || input.includes("考试") || input.includes("读书")) {
    return {
      wishText: wishInput.trim(),
      durationText: "预计 10-14 天完成",
      decisionTitle: "AI 需要你决定：你更偏好哪种学习模式？",
      decisionOptions: [
        { key: "self", label: "自主学习" },
        { key: "course", label: "系统课程" },
        { key: "mentor", label: "导师指导" },
      ],
      planSteps: [
        { num: "①", title: "制定学习计划和时间安排", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动规划" },
        { num: "②", title: "整理学习资源和材料", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
        { num: "③", title: "寻找学习伙伴或导师", type: "人群助力", typeColor: "#c084fc", desc: "AI匹配学习搭子" },
        { num: "④", title: "开始系统化学习", type: "需你到场", typeColor: "#f97316", desc: "你本人投入学习" },
      ],
      category: "学习成长",
      difficulty: "medium",
      estimatedDays: 12,
    };
  }

  if (input.includes("运动") || input.includes("跑步") || input.includes("健身") || input.includes("锻炼")) {
    return {
      wishText: wishInput.trim(),
      durationText: "预计 7 天完成",
      decisionTitle: "AI 需要你决定：你更喜欢哪种运动节奏？",
      decisionOptions: [
        { key: "light", label: "轻松入门" },
        { key: "regular", label: "规律训练" },
        { key: "intense", label: "高强度挑战" },
      ],
      planSteps: [
        { num: "①", title: "制定适合的运动计划", type: "线上直出", typeColor: "var(--accent)", desc: "AI 个性化规划" },
        { num: "②", title: "准备运动装备和场地", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
        { num: "③", title: "寻找运动伙伴或教练", type: "人群助力", typeColor: "#c084fc", desc: "AI匹配运动搭子" },
        { num: "④", title: "开始规律运动", type: "需你到场", typeColor: "#f97316", desc: "你本人坚持锻炼" },
      ],
      category: "运动健康",
      difficulty: "easy",
      estimatedDays: 7,
    };
  }

  return {
    wishText: wishInput.trim(),
    durationText: "预计 5 天完成",
    decisionTitle: "AI 需要你决定：你更偏好哪种执行方式？",
    decisionOptions: [
      { key: "solo", label: "独自完成" },
      { key: "partner", label: "寻找搭子" },
      { key: "community", label: "社区协助" },
    ],
    planSteps: [
      { num: "①", title: "分析需求并制定计划", type: "线上直出", typeColor: "var(--accent)", desc: "AI 智能分析" },
      { num: "②", title: "准备必要的资源和信息", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
      { num: "③", title: "寻找合适的协助伙伴", type: "人群助力", typeColor: "#c084fc", desc: "AI匹配合适搭子" },
      { num: "④", title: "开始执行你的心愿", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" },
    ],
    category: "生活体验",
    difficulty: "medium",
    estimatedDays: 5,
  };
}

// AI Server 地址（本地服务 或 远程）
const AI_SERVER_URL = "http://localhost:3100";

// Computer Use 服务地址
const COMPUTER_USE_URL = "http://localhost:3200";

export async function generateAIPlan(
  wishInput: string,
  options?: {
    timeout?: number; // 超时时间（毫秒），默认 30000
    onTimeout?: () => void; // 超时回调
  }
): Promise<{
  success: boolean;
  plan?: GeneratedPlan;
  executionPlan?: import('./types/execution-plan').ExecutionPlan;
  provider?: string;
  error?: string;
  timedOut?: boolean; // 是否超时
}> {
  const timeout = options?.timeout || 30000; // 默认 30 秒超时

  try {
    console.log("🤖 调用本地 AI Server 生成方案:", { wishInput, timeout });

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      options?.onTimeout?.();
    }, timeout);

    const response = await fetch(`${AI_SERVER_URL}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI Server 返回 ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log(`🎯 AI 方案生成成功 (${data.provider}):`, {
        hasExecutionPlan: !!data.executionPlan,
        hasLegacyPlan: !!data.plan
      });

      return {
        success: true,
        plan: data.plan || data.generatedPlan, // 兼容旧格式
        executionPlan: data.executionPlan,     // 新的详细执行计划
        provider: data.provider
      };
    }

    console.warn("AI Server 返回失败，降级到本地模板:", data.error);
    return { success: true, plan: generatePlanFromTemplate(wishInput) };
  } catch (error) {
    // 检查是否是超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn("AI Server 超时，降级到本地模板");
      return {
        success: true,
        plan: generatePlanFromTemplate(wishInput),
        timedOut: true,
        error: "AI 方案生成超时"
      };
    }

    console.warn("AI Server 不可用，降级到本地模板:", error);
    return { success: true, plan: generatePlanFromTemplate(wishInput) };
  }
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatAPIResponse {
  success: boolean;
  reply?: string;
  status?: string;
  suggestedActions?: Array<{ type: string; text: string; action: string }>;
  provider?: string;
  error?: string;
}

export async function chatWithAI(params: {
  character: "moon" | "star" | "cloud";
  mode: "casual" | "wish";
  message: string;
  context?: ChatMessage[];
  attachedWish?: string | null;
}): Promise<ChatAPIResponse> {
  try {
    const response = await fetch(`${AI_SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`AI Server 返回 ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("AI Server 对话不可用:", error);
    return { success: false, error: "AI Server 不可用" };
  }
}

export async function analyzeWishViaAIServer(
  wish: string,
): Promise<{ success: boolean; analysis?: any; provider?: string; error?: string }> {
  try {
    const response = await fetch(`${AI_SERVER_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish }),
    });

    if (!response.ok) throw new Error(`AI Server 返回 ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("AI Server 意图分析不可用:", error);
    return { success: false, error: "AI Server 不可用" };
  }
}

export function createWishpoolAgentApi(supabase: WishpoolAgentSupabaseClient) {
  const analyzeWish = async (wish: string): Promise<AgentResponse<WishAnalysis>> => {
    try {
      const { data, error } = await supabase.functions.invoke("agent", {
        body: {
          wish,
          action: "analyze",
        },
      });

      if (error) {
        console.error("Agent API error:", error);
        return { success: false, error: error.message };
      }

      return data as AgentResponse<WishAnalysis>;
    } catch (error) {
      console.error("Agent request failed:", error);
      return { success: false, error: "网络请求失败" };
    }
  };

  const generateExecutionPlan = async (wish: string): Promise<AgentResponse<LegacyExecutionPlan>> => {
    try {
      const { data, error } = await supabase.functions.invoke("agent", {
        body: {
          wish,
          action: "plan",
        },
      });

      if (error) {
        console.error("Agent API error:", error);
        return { success: false, error: error.message };
      }

      return data as AgentResponse<LegacyExecutionPlan>;
    } catch (error) {
      console.error("Agent request failed:", error);
      return { success: false, error: "计划生成失败" };
    }
  };

  const executeStep = async (stepIndex: number, planData: LegacyExecutionPlan): Promise<AgentResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke("agent", {
        body: {
          action: "execute",
          stepIndex,
          planData,
        },
      });

      if (error) {
        console.error("Agent API error:", error);
        return { success: false, error: error.message };
      }

      return data as AgentResponse;
    } catch (error) {
      console.error("Agent request failed:", error);
      return { success: false, error: "执行失败" };
    }
  };

  const intelligentScenarioMatch = async (wishInput: string) => {
    const analysisResult = await analyzeWish(wishInput);

    if (analysisResult.success && analysisResult.analysis) {
      const analysis = analysisResult.analysis;

      return {
        scenarioId: mapIntentToScenario(analysis.intentType),
        needsClarification: false,
        analysis,
        confidence: analysis.confidence,
      };
    }

    console.warn("AI分析失败，降级到关键词匹配:", analysisResult.error);

    return {
      scenarioId: 2,
      needsClarification: true,
      analysis: null,
      confidence: 0,
    };
  };

  const getUserAgentHistory = async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_agent_history");

      if (error) {
        console.error("获取Agent历史失败:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Agent历史请求失败:", error);
      return [];
    }
  };

  return {
    analyzeWish,
    generateExecutionPlan,
    executeStep,
    intelligentScenarioMatch,
    getUserAgentHistory,
  };
}

// ============ Computer Use 集成功能 ============

/**
 * 执行Computer Use自动化步骤
 */
export async function executeComputerUseStep(
  stepConfig: import('./types/execution-plan').ExecutionStep,
  sessionId: string,
  executionContext?: {
    userPreferences?: Record<string, any>;
    budgetLimits?: { maxAmount: number; currency: string };
    safetyMode?: boolean;
  }
): Promise<import('./computer-use-integration').ComputerUseResponse> {
  try {
    console.log(`🤖 执行Computer Use步骤: ${stepConfig.title}`);

    // 验证步骤是否可以自动执行
    if (!stepConfig.auto_executable) {
      return {
        success: false,
        sessionId,
        error: '该步骤不支持自动执行'
      };
    }

    const response = await fetch(`${COMPUTER_USE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stepConfig,
        sessionId,
        executionContext
      }),
    });

    if (!response.ok) {
      throw new Error(`Computer Use API 调用失败: ${response.status}`);
    }

    const result = await response.json();
    console.log(`🎯 Computer Use执行结果:`, {
      success: result.success,
      completed: result.stepResult?.completed,
      needsUserInput: result.stepResult?.requiresUserInput
    });

    return result;

  } catch (error) {
    console.error('❌ Computer Use执行失败:', error);
    return {
      success: false,
      sessionId,
      error: error instanceof Error ? error.message : '执行失败'
    };
  }
}

/**
 * 检查Computer Use服务状态
 */
export async function checkComputerUseStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${COMPUTER_USE_URL}/status`, {
      timeout: 5000
    } as any);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 停止Computer Use执行会话
 */
export async function stopComputerUseExecution(sessionId: string): Promise<void> {
  try {
    await fetch(`${COMPUTER_USE_URL}/stop/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`🛑 Computer Use会话已停止: ${sessionId}`);
  } catch (error) {
    console.warn('停止Computer Use会话失败:', error);
  }
}

/**
 * 获取Computer Use执行截图
 */
export async function getComputerUseScreenshot(
  sessionId: string,
  screenshotName: string
): Promise<string | null> {
  try {
    const response = await fetch(`${COMPUTER_USE_URL}/screenshot/${sessionId}/${screenshotName}`);
    if (response.ok) {
      const data = await response.json();
      return data.url || null;
    }
  } catch (error) {
    console.warn('获取Computer Use截图失败:', error);
  }
  return null;
}

/**
 * 批量执行ExecutionPlan中的所有可自动执行步骤
 */
export async function executeAllAutoSteps(
  executionPlan: import('./types/execution-plan').ExecutionPlan,
  onStepComplete?: (stepId: string, result: import('./computer-use-integration').ComputerUseResponse) => void,
  onError?: (stepId: string, error: string) => void
): Promise<{
  totalExecuted: number;
  successfulSteps: string[];
  failedSteps: Array<{ stepId: string; error: string }>;
}> {
  const autoSteps = executionPlan.steps.filter(step =>
    step.auto_executable &&
    step.status === 'pending' &&
    step.computer_use_config
  );

  console.log(`🚀 开始批量执行 ${autoSteps.length} 个可自动化步骤`);

  const successfulSteps: string[] = [];
  const failedSteps: Array<{ stepId: string; error: string }> = [];

  // 依次执行每个步骤（避免并发执行导致的问题）
  for (const step of autoSteps) {
    try {
      console.log(`📋 执行步骤: ${step.title}`);

      const result = await executeComputerUseStep(step, executionPlan.id, {
        safetyMode: executionPlan.automation_config?.safe_mode || true,
        budgetLimits: {
          maxAmount: executionPlan.automation_config?.budget_limit || 500,
          currency: 'CNY'
        }
      });

      if (result.success && result.stepResult?.completed) {
        successfulSteps.push(step.id);
        console.log(`✅ 步骤执行成功: ${step.title}`);
      } else {
        const errorMsg = result.error || result.stepResult?.message || '执行失败';
        failedSteps.push({ stepId: step.id, error: errorMsg });
        console.warn(`❌ 步骤执行失败: ${step.title} - ${errorMsg}`);
      }

      // 回调通知
      onStepComplete?.(step.id, result);

      // 步骤间间隔，避免过于频繁的请求
      if (autoSteps.indexOf(step) < autoSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      failedSteps.push({ stepId: step.id, error: errorMsg });
      onError?.(step.id, errorMsg);
      console.error(`💥 步骤执行异常: ${step.title}`, error);
    }
  }

  const result = {
    totalExecuted: autoSteps.length,
    successfulSteps,
    failedSteps
  };

  console.log(`🏁 批量执行完成:`, result);
  return result;
}
