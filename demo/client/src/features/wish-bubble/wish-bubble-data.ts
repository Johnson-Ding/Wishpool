export interface WishBubbleOption {
  id: string;
  text: string;
  category?: string;
}

// 默认探索选项（空状态）
export const DEFAULT_WISH_OPTIONS: WishBubbleOption[] = [
  { id: "1", text: "带爸妈短途走走", category: "家庭" },
  { id: "2", text: "夜跑", category: "运动" },
  { id: "3", text: "一个人吃饭", category: "独处" },
  { id: "4", text: "周末露营", category: "户外" },
];

// 碎碎念选项（双列布局右侧）
export const DEFAULT_MURMUR_OPTIONS: WishBubbleOption[] = [
  { id: "m1", text: "记录这一刻", category: "记录" },
  { id: "m2", text: "今天的小确幸", category: "感受" },
  { id: "m3", text: "想说的话", category: "表达" },
  { id: "m4", text: "此刻的心情", category: "情绪" },
];

// AI 推荐选项（单个推荐态）
export interface WishBubbleRecommendation {
  text: string;
  reason?: string;
}
