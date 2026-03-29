export interface WishpoolAgentSupabaseClient {
  functions: {
    invoke(name: string, input: { body: Record<string, unknown> }): any;
  };
  rpc(name: string, args: Record<string, unknown>): any;
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

export interface ExecutionPlan {
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
  plan?: ExecutionPlan;
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

export async function generateAIPlan(
  wishInput: string,
  _deviceId: string,
): Promise<{ success: boolean; plan?: GeneratedPlan; error?: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const plan = generatePlanFromTemplate(wishInput);
    console.log("🎯 前端模拟AI方案生成成功:", plan);

    return {
      success: true,
      plan,
    };
  } catch (error) {
    console.error("AI方案生成失败:", error);
    return { success: false, error: "方案生成失败" };
  }
}

export function createWishpoolAgentApi(supabase: WishpoolAgentSupabaseClient) {
  const analyzeWish = async (wish: string, deviceId: string): Promise<AgentResponse<WishAnalysis>> => {
    try {
      const { data, error } = await supabase.functions.invoke("agent", {
        body: {
          wish,
          action: "analyze",
          deviceId,
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

  const generateExecutionPlan = async (wish: string): Promise<AgentResponse<ExecutionPlan>> => {
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

      return data as AgentResponse<ExecutionPlan>;
    } catch (error) {
      console.error("Agent request failed:", error);
      return { success: false, error: "计划生成失败" };
    }
  };

  const executeStep = async (stepIndex: number, planData: ExecutionPlan): Promise<AgentResponse> => {
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

  const intelligentScenarioMatch = async (wishInput: string, deviceId: string) => {
    const analysisResult = await analyzeWish(wishInput, deviceId);

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

  const getUserAgentHistory = async (deviceId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_user_agent_history", {
        user_device_id: deviceId,
      });

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
