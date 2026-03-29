import { intelligentScenarioMatch, generateAIPlan, type WishAnalysis, type GeneratedPlan } from '../../lib/agent-api'

const SCENARIO_KEYWORDS: Array<{ scenarioId: number; keywords: string[] }> = [
  { scenarioId: 2, keywords: ["滑雪", "雪", "崇礼", "雪场", "单板", "双板"] },
  { scenarioId: 4, keywords: ["火锅", "吃饭", "一个人吃", "一人食", "小馆子", "餐馆", "餐厅", "探店"] },
  { scenarioId: 1, keywords: ["夜跑", "跑步", "跑团", "慢跑", "运动"] },
  { scenarioId: 3, keywords: ["露营", "营地", "天幕", "野餐", "户外"] },
  { scenarioId: 7, keywords: ["爸妈", "父母", "家庭旅行", "短途旅行", "带家人", "旅行"] },
];

export const FALLBACK_SCENARIO_ID = 2;

export type MatchResult = {
  scenarioId: number;
  needsClarification: boolean;
  analysis?: WishAnalysis | null;
  confidence?: number;
  generatedPlan?: GeneratedPlan | null; // 新增：AI生成的方案
};

// 关键词匹配 (降级模式)
function keywordBasedMatch(wishInput: string): MatchResult {
  const normalizedInput = wishInput.trim().toLowerCase();

  if (!normalizedInput) {
    return { scenarioId: FALLBACK_SCENARIO_ID, needsClarification: true, confidence: 0, generatedPlan: null };
  }

  const matched = SCENARIO_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedInput.includes(keyword.toLowerCase())),
  );

  return {
    scenarioId: matched?.scenarioId ?? FALLBACK_SCENARIO_ID,
    needsClarification: !matched,
    confidence: matched ? 0.7 : 0.3,
    generatedPlan: null, // 关键词匹配不生成动态方案
  };
}

// 智能场景匹配 (主模式) - 现在直接生成AI方案
export async function matchScenarioByWishInput(
  wishInput: string,
  deviceId: string = 'demo_device'
): Promise<MatchResult> {
  // 直接尝试AI方案生成
  try {
    console.log('🤖 开始AI方案生成:', { wishInput, deviceId })
    const planResult = await generateAIPlan(wishInput, deviceId)

    if (planResult.success && planResult.plan) {
      console.log('🎯 AI方案生成成功:', planResult.plan)

      // 返回成功结果，包含生成的方案
      return {
        scenarioId: 999, // 特殊标识，表示使用动态生成方案
        needsClarification: false, // AI已生成方案，不需要澄清
        confidence: 1.0, // 动态生成方案置信度最高
        generatedPlan: planResult.plan
      }
    } else {
      console.warn('AI方案生成失败:', planResult.error)
    }
  } catch (error) {
    console.warn('AI方案生成API调用失败:', error)
  }

  // AI方案生成失败，降级到传统AI意图分析 + 静态方案
  try {
    const aiResult = await intelligentScenarioMatch(wishInput, deviceId)

    if (aiResult.confidence > 0.6) {
      console.log('🔄 降级到AI意图分析成功:', aiResult)
      return { ...aiResult, generatedPlan: null }
    }
  } catch (error) {
    console.warn('AI意图分析也失败，最终降级到关键词匹配:', error)
  }

  // 最终降级到关键词匹配
  const keywordResult = keywordBasedMatch(wishInput)
  console.log('📝 最终关键词匹配结果:', keywordResult)

  return keywordResult
}

// 兼容原有同步调用的函数 (仅关键词匹配)
export function matchScenarioByWishInputSync(wishInput: string): MatchResult {
  return keywordBasedMatch(wishInput)
}
