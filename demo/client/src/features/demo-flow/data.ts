// ── 漂流瓶数据 ────────────────────────────────────────────────────
type BottleType = "story" | "mumble" | "news" | "rec" | "goodnews" | "poem" | "quote";
export const DRIFT_BOTTLES: {
  id: number; tag: string; tagColor: string; tagBg: string;
  title: string; meta: string; loc: string; excerpt: string;
  type: BottleType; likes: number; link?: string;
}[] = [
  {
    id: 1, type: "story",
    tag: "城市活动",
    tagColor: "var(--accent)",
    tagBg: "oklch(var(--accent-lch) / 14%)",
    title: "第一次参加城市夜跑，认识了固定搭子",
    meta: "3人助力 · 6天完成",
    loc: "上海 · 上周",
    excerpt: "我只说了一句想重新把运动捡起来，AI就帮我匹配了附近跑团、合适的集合时间和同频搭子，现在每周三都有人等我一起出发。",
    likes: 132,
  },
  {
    id: 2, type: "mumble",
    tag: "碎碎念",
    tagColor: "#a78bfa",
    tagBg: "oklch(0.65 0.18 295 / 12%)",
    title: "为什么下班以后，还是觉得这一天不像自己的",
    meta: "社区动态 · 63条共鸣",
    loc: "匿名 · 今天",
    excerpt: "白天一直在回消息、开会、补需求，忙到晚上却说不上自己真正推进了什么。想给生活留一点属于自己的力气，怎么这么难。",
    likes: 286,
  },
  {
    id: 3, type: "news",
    tag: "🎉 好消息",
    tagColor: "#facc15",
    tagBg: "oklch(0.82 0.18 85 / 14%)",
    title: "第一次自己组织周末露营，报名和物资都搞定了！",
    meta: "AI直出 · 4天完成",
    loc: "杭州 · 本月",
    excerpt: "从营地筛选、天气确认到食材和天幕清单，AI把准备工作一次性列清楚了，朋友们直接按分工认领，这周终于能成行。",
    likes: 198,
  },
  {
    id: 4, type: "rec",
    tag: "🍜 本地推荐",
    tagColor: "#fb923c",
    tagBg: "oklch(0.72 0.18 50 / 12%)",
    title: "找到一家适合一个人安静吃饭的小馆子",
    meta: "AI直出 · 独处友好",
    loc: "广州 · 本周",
    excerpt: "我想找那种不催人、灯光舒服、一个人坐着也不尴尬的小店，AI最后给了这家藏在居民区里的汤粉馆，老板还会主动少放香菜。",
    likes: 94,
  },
  {
    id: 5, type: "goodnews",
    tag: "🌍 全球好消息",
    tagColor: "#4ade80",
    tagBg: "oklch(0.75 0.15 145 / 12%)",
    title: "养老院里的猫咪成了老人们的治愈伙伴",
    meta: "BBC · 3天前",
    loc: "英国 · 全球好消息",
    excerpt: "一只原本被救助的猫咪住进养老院后，成了老人们每天最期待见到的朋友。护士说，自从它来了，大家聊天和出门的次数都明显变多了。",
    link: "bbc.com/news/uk",
    likes: 1847,
  },
  {
    id: 6, type: "poem",
    tag: "✨ 小诗一首",
    tagColor: "#c084fc",
    tagBg: "oklch(0.65 0.18 295 / 20%)",
    title: "小诗一首",
    meta: "",
    loc: "",
    excerpt: "我许了个愿\n风把它吹走了\n后来我才知道\n它是去替我找路",
    likes: 522,
  },
  {
    id: 7, type: "story",
    tag: "家庭时光",
    tagColor: "#34d399",
    tagBg: "oklch(0.75 0.15 165 / 12%)",
    title: "第一次带爸妈短途旅行，终于成行",
    meta: "AI直出 · 10天完成",
    loc: "苏州 · 上月",
    excerpt: "以前总说等有空再带爸妈出去走走，这次AI帮我把高铁、酒店和轻松路线都排好了，还考虑了他们的步行强度，终于不再只是说说。",
    likes: 367,
  },
  {
    id: 8, type: "quote",
    tag: "💬 今日金句",
    tagColor: "#fbbf24",
    tagBg: "oklch(0.82 0.18 85 / 18%)",
    title: "今日金句",
    meta: "",
    loc: "",
    excerpt: "愿望先被说出口\n生活才知道\n该往哪里\n轻轻推你一把。",
    likes: 941,
  },
];

// ── 内容类型标签颜色映射 ───────────────────────────────────────────
export const TYPE_LABEL: Record<string, string> = {
  story: "愿望故事",
  mumble: "碎碎念",
  news: "好消息",
  rec: "探店推荐",
  goodnews: "全球好消息",
  poem: "小诗",
  quote: "金句",
};

export type HomeActionConfig = {
  primaryLabel: string;
  primaryKind: "task" | "wish" | "react";
  secondaryLabel?: string;
  secondaryKind?: "wish";
};

export type ToastState = {
  text: string;
  visible: boolean;
};

export const COMMENT_TRANSCRIPTS = [
  "我也想要这种有人一起推进的周末感。",
  "这个方案好具体，看完真的会想出发。",
  "如果有类似城市版本，我也愿意报名。",
  "这种体验如果有人带着走，会安心很多。",
];


export type WishScenario = {
  id: number;
  wishText: string;
  durationText: string;
  decisionTitle: string;
  decisionOptions: { key: string; label: string }[];
  planSteps: { num: string; title: string; type: string; typeColor: string; desc: string }[];
  roundProgress: string;
  roundEta: string;
  roundCompleted: { icon: string; title: string; src: string }[];
  roundNext: { icon: string; title: string; src: string; urgent?: boolean }[];
  resources: { name: string; status: string; ok: boolean }[];
  candidate: { emoji: string; title: string; subtitle: string; match: string };
  behaviorStats: { label: string; value: string }[];
  reviews: { text: string; sub: string }[];
  risks: { icon: string; text: string; ok: boolean | null }[];
  collabTitle: string;
  timeOptions: { key: string; label: string }[];
  placeOptions: { key: string; label: string }[];
  costs: { label: string; amount: string; sub?: string }[];
  totalCost: string;
  splitNote: string;
  itinerary: { time: string; title: string; done?: boolean; active?: boolean }[];
  participants: { name: string; emoji: string; status: string }[];
  exceptionTitle: string;
  exceptionDesc: string;
  exceptionEta: string;
  exceptionActions: [string, string];
  feedbackTitle: string;
  feedbackMeta: string;
  supportDetails: { icon: string; label: string; desc: string }[];
  partnerLabel: string;
  storyCardTitle: string;
  storyCardMeta: string;
};

export const WISH_SCENARIOS: Record<number, WishScenario> = {
  1: {
    id: 1, wishText: "我想开始参加城市夜跑，找到固定搭子一起坚持", durationText: "预计 6 天完成", decisionTitle: "AI 需要你决定：你更偏好的夜跑节奏？",
    decisionOptions: [{ key: "easy", label: "轻松 5 公里" }, { key: "steady", label: "稳定配速 8 公里" }, { key: "social", label: "边跑边聊型" }],
    planSteps: [
      { num: "①", title: "筛选附近夜跑团 + 锁定合适线路", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动完成" },
      { num: "②", title: "同步集合时间 + 装备建议", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
      { num: "③", title: "匹配稳定出勤的跑步搭子", type: "人群助力", typeColor: "#c084fc", desc: "AI发邀约·按节奏画像" },
      { num: "④", title: "首跑打卡 + 反馈跑后感受", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" },
    ],
    roundProgress: "45%", roundEta: "还需约 3 天完成",
    roundCompleted: [{ icon: "✓", title: "已筛出 3 条适合下班后的夜跑路线", src: "AI 直出 · 线上完成" }, { icon: "✓", title: "跑团集合时间已锁定（周三 19:30）", src: "资源助力 · 平台协调" }],
    roundNext: [{ icon: "◎", title: "确认你的配速偏好（影响搭子匹配）", src: "待你操作", urgent: true }, { icon: "○", title: "向 2 位高匹配跑友发出邀约", src: "人群助力 · AI发邀约中" }],
    resources: [{ name: "夜跑路线", status: "已就绪", ok: true }, { name: "同频搭子", status: "匹配中", ok: false }],
    candidate: { emoji: "🏃", title: "夜跑爱好者 · 住得近 · 下班可约", subtitle: "配速稳定 · 徐汇", match: "89% 匹配" },
    behaviorStats: [{ label: "完成活动次数", value: "11 次" }, { label: "被好评率", value: "96%" }, { label: "平均响应时长", value: "1.4h" }, { label: "最近活跃", value: "今天" }],
    reviews: [{ text: "“节奏很稳，不会硬拉速度”", sub: "夜跑搭子 · 2026.02" }, { text: "“会提前到，沟通很顺”", sub: "城市运动 · 2026.01" }],
    risks: [{ icon: "✓", text: "站内配速记录稳定", ok: true }, { icon: "✓", text: "守约率高", ok: true }, { icon: "△", text: "首次与你同城组队", ok: null }],
    collabTitle: "夜跑协同确认", timeOptions: [{ key: "wed", label: "周三 19:30 首跑" }, { key: "fri", label: "周五 20:00 首跑" }], placeOptions: [{ key: "xuhui", label: "徐汇滨江跑步入口" }, { key: "westbund", label: "西岸美术馆门口" }],
    costs: [{ label: "运动保险（平台）", amount: "20 元" }, { label: "能量补给（平台）", amount: "18 元" }, { label: "跑团报名", amount: "0 元", sub: "首跑免报名费" }], totalCost: "38 元", splitNote: "你仅承担基础费用，搭子不参与分摊",
    itinerary: [{ time: "19:20", title: "徐汇滨江集合", done: true }, { time: "19:30", title: "热身 + 破冰配对", done: true }, { time: "19:45", title: "开始首跑 5 公里", active: true }, { time: "20:30", title: "拉伸 + 跑后反馈" }],
    participants: [{ name: "你", emoji: "🧑", status: "已确认" }, { name: "跑友 A", emoji: "🏃", status: "已确认" }],
    exceptionTitle: "跑友临时晚到", exceptionDesc: "跑友 A 提前发来消息，预计晚到 15 分钟", exceptionEta: "AI 已重排热身顺序 · 预计不影响首跑", exceptionActions: ["等待对方", "改为先独自热身"],
    feedbackTitle: "你的夜跑心愿已启动！", feedbackMeta: "上海 · 徐汇滨江 · 今天", supportDetails: [{ icon: "🤖", label: "AI 直出", desc: "路线筛选 + 首跑节奏安排" }, { icon: "🤝", label: "人群助力", desc: "稳定跑友匹配 + 集合协调" }], partnerLabel: "评价跑友 A", storyCardTitle: "「第一次参加城市夜跑，认识了固定搭子」", storyCardMeta: "3人助力 · 6天完成 · 上海徐汇",
  },
  2: {
    id: 2, wishText: "我想去崇礼滑雪，找个有车的搭子一起出发", durationText: "预计 5 天完成", decisionTitle: "AI 需要你决定：这次滑雪你更偏哪种体验？",
    decisionOptions: [{ key: "newbie", label: "新手友好" }, { key: "cruise", label: "轻松刷道" }, { key: "photo", label: "拍照氛围感" }],
    planSteps: [
      { num: "①", title: "筛选崇礼雪场 + 锁定新手友好线路", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动完成" },
      { num: "②", title: "整理拼车时间 + 雪具租赁建议", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
      { num: "③", title: "匹配有车且节奏合适的滑雪搭子", type: "人群助力", typeColor: "#c084fc", desc: "AI发邀约·按滑雪画像" },
      { num: "④", title: "按约定出发滑雪 + 回填体验反馈", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" },
    ],
    roundProgress: "50%", roundEta: "还需约 2 天完成",
    roundCompleted: [{ icon: "✓", title: "已筛出 2 个适合周末出发的崇礼雪场", src: "AI 直出 · 线上完成" }, { icon: "✓", title: "拼车出发时间与雪具租赁方案已整理完成", src: "资源助力 · 已同步" }],
    roundNext: [{ icon: "◎", title: "确认你更想练初级道还是拍照休闲", src: "待你操作", urgent: true }, { icon: "○", title: "向 2 位高匹配滑雪搭子发出同行邀约", src: "人群助力 · AI发邀约中" }],
    resources: [{ name: "雪场方案", status: "已就绪", ok: true }, { name: "滑雪搭子", status: "匹配中", ok: false }],
    candidate: { emoji: "🎿", title: "周末滑雪常客 · 可拼车 · 熟悉崇礼", subtitle: "有车接驳 · 北京出发", match: "91% 匹配" },
    behaviorStats: [{ label: "完成活动次数", value: "8 次" }, { label: "被好评率", value: "97%" }, { label: "平均响应时长", value: "1.6h" }, { label: "最近活跃", value: "今天" }],
    reviews: [{ text: "“会提前讲清楚雪场节奏，对新手很友好”", sub: "滑雪同行 · 2026.02" }, { text: "“车上沟通顺畅，现场也很照顾人”", sub: "周末出行 · 2026.01" }],
    risks: [{ icon: "✓", text: "过往滑雪出行记录稳定", ok: true }, { icon: "✓", text: "有真实拼车评价", ok: true }, { icon: "△", text: "周末高速可能拥堵", ok: null }],
    collabTitle: "滑雪出发确认", timeOptions: [{ key: "sat-early", label: "周六早 6:30 出发" }, { key: "fri-night", label: "周五晚出发住一晚" }], placeOptions: [{ key: "wangjing", label: "望京地铁口集合" }, { key: "haidian", label: "海淀北部停车点" }],
    costs: [{ label: "雪票", amount: "320 元" }, { label: "雪具租赁", amount: "180 元" }, { label: "拼车油费", amount: "90 元", sub: "多人分摊后" }], totalCost: "590 元", splitNote: "交通按同行人数均摊，雪票和雪具各自支付",
    itinerary: [{ time: "06:30", title: "北京集合出发", done: true }, { time: "09:40", title: "到达雪场并领取雪具", done: true }, { time: "10:20", title: "初级道热身滑行", active: true }, { time: "15:30", title: "返程前回填体验反馈" }],
    participants: [{ name: "你", emoji: "🧑", status: "已确认" }, { name: "滑雪搭子 A", emoji: "🎿", status: "已确认" }],
    exceptionTitle: "高速比预期更堵", exceptionDesc: "AI 已把上午雪道安排压缩，并同步延后返程提醒", exceptionEta: "最新到达雪场时间预计 10:10", exceptionActions: ["接受调整", "改约下次出发"],
    feedbackTitle: "你的滑雪心愿已成行！", feedbackMeta: "崇礼 · 周末滑雪 · 今天", supportDetails: [{ icon: "🤖", label: "AI 直出", desc: "雪场筛选 + 出发方案整理" }, { icon: "🤝", label: "人群助力", desc: "拼车搭子匹配 + 同行协调" }], partnerLabel: "评价滑雪搭子 A", storyCardTitle: "「第一次去崇礼滑雪，终于有人一起出发」", storyCardMeta: "AI直出 · 5天完成 · 崇礼",
  },
  3: {
    id: 3, wishText: "我想组织一次周末露营，把报名和物资都安排明白", durationText: "预计 4 天完成", decisionTitle: "AI 需要你决定：这次露营更偏哪种风格？",
    decisionOptions: [{ key: "easy", label: "轻装休闲型" }, { key: "cook", label: "认真做饭型" }, { key: "photo", label: "拍照出片型" }],
    planSteps: [{ num: "①", title: "筛选营地 + 核对天气窗口", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动完成" }, { num: "②", title: "整理报名名单 + 分配物资", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" }, { num: "③", title: "匹配有经验露营伙伴协助带队", type: "人群助力", typeColor: "#c084fc", desc: "AI发邀约·按经验画像" }, { num: "④", title: "现场搭建 + 完成回收反馈", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" }],
    roundProgress: "52%", roundEta: "还需约 2 天完成", roundCompleted: [{ icon: "✓", title: "营地已锁定，天气窗口适合过夜", src: "AI 直出 · 线上完成" }, { icon: "✓", title: "露营物资清单已分配给 4 位朋友", src: "资源助力 · 已同步" }], roundNext: [{ icon: "◎", title: "确认你更看重做饭还是轻装", src: "待你操作", urgent: true }, { icon: "○", title: "补位一位有过夜经验的同伴", src: "人群助力 · AI发邀约中" }], resources: [{ name: "营地资源", status: "已就绪", ok: true }, { name: "经验同伴", status: "匹配中", ok: false }], candidate: { emoji: "⛺", title: "露营老手 · 有天幕 · 会生火", subtitle: "自带基础装备 · 杭州", match: "86% 匹配" }, behaviorStats: [{ label: "完成活动次数", value: "9 次" }, { label: "被好评率", value: "97%" }, { label: "平均响应时长", value: "1.8h" }, { label: "最近活跃", value: "昨天" }], reviews: [{ text: "“分工很清楚，现场特别稳”", sub: "露营搭子 · 2026.03" }, { text: "“带新手也很有耐心”", sub: "户外活动 · 2025.12" }], risks: [{ icon: "✓", text: "户外活动记录稳定", ok: true }, { icon: "✓", text: "多人协作评价高", ok: true }, { icon: "△", text: "本次距离市区较远", ok: null }], collabTitle: "露营筹备确认", timeOptions: [{ key: "sat", label: "周六上午出发" }, { key: "satnoon", label: "周六中午集合" }], placeOptions: [{ key: "westlake", label: "西湖西侧停车点" }, { key: "linan", label: "临安营地入口" }], costs: [{ label: "营地费（平台代订）", amount: "260 元" }, { label: "公共物资采购", amount: "180 元" }, { label: "拼车", amount: "60 元", sub: "多人分摊后" }], totalCost: "500 元", splitNote: "按参与人数均摊公共物资和交通", itinerary: [{ time: "09:00", title: "停车点集合", done: true }, { time: "10:20", title: "抵达营地并搭建天幕", done: true }, { time: "11:30", title: "分组准备午餐", active: true }, { time: "15:00", title: "自由活动 + 收集反馈" }], participants: [{ name: "你", emoji: "🧑", status: "已确认" }, { name: "露营伙伴 A", emoji: "⛺", status: "已确认" }], exceptionTitle: "天气有小幅变化", exceptionDesc: "下午风力略增，AI 建议提前固定天幕边角", exceptionEta: "平台已推送加固清单 · 预计 10 分钟完成", exceptionActions: ["按建议加固", "缩短停留时间"], feedbackTitle: "你的露营心愿已成行！", feedbackMeta: "杭州 · 山野营地 · 今天", supportDetails: [{ icon: "🤖", label: "AI 直出", desc: "营地筛选 + 物资清单" }, { icon: "🤝", label: "人群助力", desc: "经验同伴协作 + 拼车协调" }], partnerLabel: "评价露营伙伴 A", storyCardTitle: "「第一次自己组织周末露营，报名和物资都搞定了！」", storyCardMeta: "AI直出 · 4天完成 · 杭州",
  },
  4: {
    id: 4, wishText: "我想找到一家适合一个人安静吃饭的小馆子", durationText: "预计 2 天完成", decisionTitle: "AI 需要你决定：你更想要哪种一人食氛围？", decisionOptions: [{ key: "quiet", label: "安静治愈" }, { key: "window", label: "靠窗发呆" }, { key: "warm", label: "老板友好" }], planSteps: [{ num: "①", title: "筛选独处友好餐馆 + 营业时段", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动完成" }, { num: "②", title: "核对高峰时段与候位情况", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" }, { num: "③", title: "补充真实一人食体验反馈", type: "人群助力", typeColor: "#c084fc", desc: "AI汇总用户评价" }, { num: "④", title: "到店体验 + 回填感受", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" }], roundProgress: "60%", roundEta: "还需约 1 天完成", roundCompleted: [{ icon: "✓", title: "已筛出 5 家独处友好小馆子", src: "AI 直出 · 线上完成" }, { icon: "✓", title: "高峰排队情况已更新", src: "资源助力 · 实时确认" }], roundNext: [{ icon: "◎", title: "确认你更想吃汤面还是简餐", src: "待你操作", urgent: true }, { icon: "○", title: "补充最近一周到店体验评价", src: "人群助力 · AI汇总中" }], resources: [{ name: "餐馆推荐", status: "已就绪", ok: true }, { name: "到店反馈", status: "更新中", ok: false }], candidate: { emoji: "🍜", title: "店主反馈好 · 一人食友好", subtitle: "安静角落位 · 广州", match: "91% 匹配" }, behaviorStats: [{ label: "被收藏次数", value: "126 次" }, { label: "一人食好评率", value: "95%" }, { label: "最近更新", value: "今天" }, { label: "平均候位", value: "12 分钟" }], reviews: [{ text: "“一个人坐着完全不尴尬”", sub: "独处用餐 · 2026.03" }, { text: "“灯光柔和，适合慢慢吃”", sub: "本地推荐 · 2026.02" }], risks: [{ icon: "✓", text: "近期评价稳定", ok: true }, { icon: "✓", text: "高峰时段可控", ok: true }, { icon: "△", text: "周末晚餐仍需少量等待", ok: null }], collabTitle: "到店体验确认", timeOptions: [{ key: "weekday", label: "工作日晚 7 点" }, { key: "weekend", label: "周末午间 1 点" }], placeOptions: [{ key: "shop", label: "居民区汤粉馆" }, { key: "backup", label: "备选简餐店" }], costs: [{ label: "本次用餐预算", amount: "58 元" }, { label: "平台到店提醒", amount: "0 元", sub: "体验提醒服务" }], totalCost: "58 元", splitNote: "本次为单人体验，无需分摊", itinerary: [{ time: "18:50", title: "到店取号", done: true }, { time: "19:05", title: "落座靠窗位", done: true }, { time: "19:15", title: "开始用餐记录感受", active: true }, { time: "19:50", title: "回填体验评价" }], participants: [{ name: "你", emoji: "🧑", status: "已确认" }], exceptionTitle: "候位时间变长", exceptionDesc: "晚高峰排队略久，AI 建议切换到备选店", exceptionEta: "已同步两家门店实时排队情况", exceptionActions: ["继续等待", "改去备选店"], feedbackTitle: "你的独处小馆子心愿已实现！", feedbackMeta: "广州 · 居民区汤粉馆 · 今天", supportDetails: [{ icon: "🤖", label: "AI 直出", desc: "筛店 + 到店时段建议" }, { icon: "🤝", label: "体验汇总", desc: "真实一人食反馈整合" }], partnerLabel: "评价这次推荐", storyCardTitle: "「找到一家适合一个人安静吃饭的小馆子」", storyCardMeta: "AI直出 · 独处友好 · 广州",
  },
  7: {
    id: 7, wishText: "我想带爸妈来一次轻松的短途旅行，别再只停留在嘴上", durationText: "预计 10 天完成", decisionTitle: "AI 需要你决定：这次更偏哪种旅行节奏？", decisionOptions: [{ key: "slow", label: "慢悠悠逛吃" }, { key: "view", label: "看风景为主" }, { key: "rest", label: "少走路更舒服" }], planSteps: [{ num: "①", title: "筛选适合爸妈的短途城市和酒店", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动完成" }, { num: "②", title: "整理高铁时间 + 无障碍动线", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" }, { num: "③", title: "补充当地真实踩点建议", type: "人群助力", typeColor: "#c084fc", desc: "AI汇总真实经验" }, { num: "④", title: "按轻松路线出行 + 完成反馈", type: "需你到场", typeColor: "#f97316", desc: "你本人参与" }], roundProgress: "48%", roundEta: "还需约 5 天完成", roundCompleted: [{ icon: "✓", title: "高铁与酒店组合已筛出 2 套最优方案", src: "AI 直出 · 线上完成" }, { icon: "✓", title: "步行强度与休息点已标注完成", src: "资源助力 · 已整理" }], roundNext: [{ icon: "◎", title: "确认爸妈更想逛园林还是古镇", src: "待你操作", urgent: true }, { icon: "○", title: "补充一家适合长辈口味的餐馆", src: "人群助力 · AI汇总中" }], resources: [{ name: "行程方案", status: "已就绪", ok: true }, { name: "当地经验", status: "更新中", ok: false }], candidate: { emoji: "🚄", title: "本地向导型用户 · 熟悉长辈路线", subtitle: "步行友好 · 苏州", match: "84% 匹配" }, behaviorStats: [{ label: "完成活动次数", value: "7 次" }, { label: "被好评率", value: "95%" }, { label: "平均响应时长", value: "2.3h" }, { label: "最近活跃", value: "昨天" }], reviews: [{ text: "“给长辈选路线很细心”", sub: "家庭旅行 · 2026.01" }, { text: "“安排松弛，不赶路”", sub: "短途出行 · 2025.10" }], risks: [{ icon: "✓", text: "路线以休息友好为主", ok: true }, { icon: "✓", text: "酒店与交通衔接清晰", ok: true }, { icon: "△", text: "节假日需提早预订", ok: null }], collabTitle: "家庭旅行确认", timeOptions: [{ key: "fri", label: "周五下午出发" }, { key: "sat", label: "周六上午出发" }], placeOptions: [{ key: "station", label: "苏州站北广场" }, { key: "hotel", label: "酒店大堂会合" }], costs: [{ label: "高铁票（往返）", amount: "420 元" }, { label: "酒店（1晚）", amount: "560 元" }, { label: "园林门票", amount: "180 元", sub: "长辈优惠后" }], totalCost: "1160 元", splitNote: "由你统一支付，爸妈不参与线上操作", itinerary: [{ time: "14:00", title: "高铁出发", done: true }, { time: "15:20", title: "到达酒店办理入住", done: true }, { time: "16:30", title: "园林慢逛", active: true }, { time: "18:30", title: "早点晚餐 + 回酒店休息" }], participants: [{ name: "你", emoji: "🧑", status: "已确认" }, { name: "妈妈", emoji: "👩", status: "已确认" }, { name: "爸爸", emoji: "👨", status: "已确认" }], exceptionTitle: "天气转阴有小雨", exceptionDesc: "AI 已把户外时段缩短，并替换为室内休息点", exceptionEta: "更新后的轻松路线已同步到行程", exceptionActions: ["按新路线走", "改为酒店休息"], feedbackTitle: "你的家庭旅行心愿已实现！", feedbackMeta: "苏州 · 园林慢游 · 今天", supportDetails: [{ icon: "🤖", label: "AI 直出", desc: "交通酒店组合 + 轻松路线" }, { icon: "🤝", label: "经验汇总", desc: "长辈友好踩点建议" }], partnerLabel: "评价这次行程", storyCardTitle: "「第一次带爸妈短途旅行，终于成行」", storyCardMeta: "AI直出 · 10天完成 · 苏州",
  },
};

export const DEFAULT_SCENARIO = WISH_SCENARIOS[1];

// ── US-03A：首页（漂流瓶左右滑动）──────────────────────────────
