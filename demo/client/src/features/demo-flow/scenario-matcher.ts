const SCENARIO_KEYWORDS: Array<{ scenarioId: number; keywords: string[] }> = [
  { scenarioId: 2, keywords: ["滑雪", "雪", "崇礼", "雪场", "单板", "双板"] },
  { scenarioId: 4, keywords: ["火锅", "吃饭", "一个人吃", "一人食", "小馆子", "餐馆", "餐厅", "探店"] },
  { scenarioId: 1, keywords: ["夜跑", "跑步", "跑团", "慢跑", "运动"] },
  { scenarioId: 3, keywords: ["露营", "营地", "天幕", "野餐", "户外"] },
  { scenarioId: 7, keywords: ["爸妈", "父母", "家庭旅行", "短途旅行", "带家人", "旅行"] },
];

export const FALLBACK_SCENARIO_ID = 2;

export function matchScenarioByWishInput(wishInput: string): number {
  const normalizedInput = wishInput.trim().toLowerCase();

  if (!normalizedInput) {
    return FALLBACK_SCENARIO_ID;
  }

  const matched = SCENARIO_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedInput.includes(keyword.toLowerCase())),
  );

  return matched?.scenarioId ?? FALLBACK_SCENARIO_ID;
}
