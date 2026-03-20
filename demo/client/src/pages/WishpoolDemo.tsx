/**
 * Wishpool V2.0 — 许愿池产品演示
 * 设计方向：「许愿漂流瓶 · AI执行搭子」
 *
 * 演示流程 (V2 PRD)：
 * splash → home（漂流瓶 Tinder 滑动）→ paywall（非会员付费墙）
 * → chat（AI对话发愿 US-03B）→ ai-plan（AI直出方案 US-01）
 * → round-update（轮次进展 US-02）→ deep-research（深度调研 US-04）
 * → collab-prep（协同筹备+支付 US-05）→ fulfillment（活动履约 US-06）
 * → feedback（反馈+评价+故事卡）→ home（回首页闭环）
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

// ── 图片资源 ───────────────────────────────────────────────────────
const MOON_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663446385442/Gt8Avh7w6EDiKWST7NBhrP/wishpool-moon-bg_623c5457.png";
const MOON_AVATAR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663446385442/Gt8Avh7w6EDiKWST7NBhrP/wishpool-avatar-moon_a2b9ec66.png";

// ── 角色上下文（保持V1设计系统） ──────────────────────────────────
type CharacterType = "moon" | "star" | "cloud";
const CharacterContext = React.createContext<{ character: CharacterType; setCharacter: (c: CharacterType) => void }>({
  character: "moon",
  setCharacter: () => {},
});

// ── 屏幕类型 ──────────────────────────────────────────────────────
type Screen =
  | "splash"
  | "home"
  | "paywall"
  | "chat"
  | "ai-plan"
  | "round-update"
  | "deep-research"
  | "collab-prep"
  | "fulfillment"
  | "feedback";

const SCREEN_ORDER: Screen[] = [
  "splash",
  "home",
  "paywall",
  "chat",
  "ai-plan",
  "round-update",
  "deep-research",
  "collab-prep",
  "fulfillment",
  "feedback",
];

// ── 系统状态栏 ─────────────────────────────────────────────────────
function StatusBar() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
    }, 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs" style={{ color: "var(--foreground)" }}>
      <span className="font-medium tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="4" width="3" height="8" rx="0.5" opacity="0.4" />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5" opacity="0.6" />
          <rect x="9" y="1" width="3" height="11" rx="0.5" opacity="0.8" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 24 12" fill="currentColor">
          <path d="M1 4h18a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1V5a1 1 0 011-1z" opacity="0.3" />
          <rect x="0" y="3" width="14" height="6" rx="1" />
          <path d="M20 5.5a2 2 0 010 3" strokeWidth="1.5" stroke="currentColor" fill="none" />
        </svg>
      </div>
    </div>
  );
}

// ── 导航栏 ─────────────────────────────────────────────────────────
function NavBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-3 relative">
      {onBack && (
        <button onClick={onBack} className="absolute left-4 p-1 rounded-full" style={{ color: "var(--primary)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <span className="font-heading mx-auto text-base font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
      {right && <div className="absolute right-4">{right}</div>}
    </div>
  );
}

// ── 星空背景 ──────────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 65, size: Math.random() * 1.8 + 0.8, delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div key={s.id} className="absolute rounded-full" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          background: "var(--foreground)",
          animation: `starTwinkle ${2 + s.delay}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

// ── 0. 启动页 ──────────────────────────────────────────────────────
function SplashScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => { const t = setTimeout(onNext, 2600); return () => clearTimeout(t); }, [onNext]);
  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${MOON_BG})`, opacity: 0.55 }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.11 0.025 265 / 30%), oklch(0.11 0.025 265 / 85%))" }} />
      <StarField />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="moon-pulse float-anim w-28 h-28 rounded-full overflow-hidden mb-6">
          <img src={MOON_AVATAR} alt="许愿池" className="w-full h-full object-cover" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-heading text-3xl font-bold gold-text mb-2"
        >
          许愿池
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          AI 帮你实现心愿，不只是建议
        </motion.p>
      </motion.div>
    </div>
  );
}

// ── 漂流瓶数据 ────────────────────────────────────────────────────
type BottleType = "story" | "mumble" | "news" | "rec" | "goodnews" | "poem" | "quote";
const DRIFT_BOTTLES: {
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
const TYPE_LABEL: Record<string, string> = {
  story: "愿望故事",
  mumble: "碎碎念",
  news: "好消息",
  rec: "探店推荐",
  goodnews: "全球好消息",
  poem: "小诗",
  quote: "金句",
};

type HomeActionConfig = {
  primaryLabel: string;
  primaryKind: "task" | "wish" | "react";
  secondaryLabel?: string;
  secondaryKind?: "wish";
};

type ToastState = {
  text: string;
  visible: boolean;
};

const COMMENT_TRANSCRIPTS = [
  "这个也太戳我了，我也想认真把这件事做成。",
  "看完好有行动力，想先从这个周末开始试试看。",
  "我也有类似经历，蹲一个后续更新。",
];


type WishScenario = {
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

const WISH_SCENARIOS: Record<number, WishScenario> = {
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

const DEFAULT_SCENARIO = WISH_SCENARIOS[1];

// ── US-03A：首页（漂流瓶左右滑动）──────────────────────────────
function HomeScreen({ onWishClick, onDoSameClick, isMember }: { onWishClick: () => void; onDoSameClick: (bottleId: number) => void; isMember: boolean }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [likeAnim, setLikeAnim] = useState<number | null>(null);
  const [activeCommentBottleId, setActiveCommentBottleId] = useState<number | null>(null);
  const [commentDraftById, setCommentDraftById] = useState<Record<number, string>>({});
  const [commentCountBoostById, setCommentCountBoostById] = useState<Record<number, number>>({});
  const [isCommentRecording, setIsCommentRecording] = useState(false);
  const [recordingBottleId, setRecordingBottleId] = useState<number | null>(null);
  const [taskSheetBottleId, setTaskSheetBottleId] = useState<number | null>(null);
  const [taskSheetMode, setTaskSheetMode] = useState<"help" | "join" | null>(null);
  const [toast, setToast] = useState<ToastState>({ text: "", visible: false });
  const total = DRIFT_BOTTLES.length;

  const goNext = () => { setDirection(1); setCurrent(c => (c + 1) % total); };
  const goPrev = () => { setDirection(-1); setCurrent(c => (c - 1 + total) % total); };

  const handleLike = (id: number) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setLikeAnim(id);
    setTimeout(() => setLikeAnim(null), 600);
  };

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    window.setTimeout(() => {
      setToast(currentToast => currentToast.text === text ? { text: "", visible: false } : currentToast);
    }, 1800);
  };

  const openCommentSheet = (id: number) => {
    setActiveCommentBottleId(id);
    setIsCommentRecording(false);
    setRecordingBottleId(null);
  };

  const closeCommentSheet = () => {
    setActiveCommentBottleId(null);
    setIsCommentRecording(false);
    setRecordingBottleId(null);
  };

  const closeTaskSheet = () => {
    setTaskSheetBottleId(null);
    setTaskSheetMode(null);
  };

  const updateCommentDraft = (id: number, value: string) => {
    setCommentDraftById(prev => ({ ...prev, [id]: value }));
  };

  const handleCommentMic = (id: number) => {
    setActiveCommentBottleId(id);
    setIsCommentRecording(true);
    setRecordingBottleId(id);
    window.setTimeout(() => {
      setIsCommentRecording(false);
      setRecordingBottleId(null);
      setCommentDraftById(prev => ({
        ...prev,
        [id]: prev[id] || COMMENT_TRANSCRIPTS[id % COMMENT_TRANSCRIPTS.length],
      }));
    }, 1800);
  };

  const handleSendComment = (id: number) => {
    const draft = commentDraftById[id]?.trim();
    if (!draft) return;
    setCommentCountBoostById(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setCommentDraftById(prev => ({ ...prev, [id]: "" }));
    closeCommentSheet();
    showToast("评论已发送");
  };

  const getWishLabel = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const participationIds = new Set([1, 3]);
    return participationIds.has(bottle.id) ? "我要参加" : "我也想做";
  };

  const getCardActions = (bottle: typeof DRIFT_BOTTLES[number]): HomeActionConfig => {
    if (bottle.type === "story") {
      return bottle.meta.includes("助力")
        ? { primaryLabel: "参与其中 →", primaryKind: "task", secondaryLabel: getWishLabel(bottle), secondaryKind: "wish" }
        : { primaryLabel: "帮Ta实现 →", primaryKind: "task", secondaryLabel: getWishLabel(bottle), secondaryKind: "wish" };
    }
    if (bottle.type === "mumble") return { primaryLabel: "深有同感", primaryKind: "react" };
    if (bottle.type === "goodnews" || bottle.type === "poem" || bottle.type === "quote") return { primaryLabel: "真好", primaryKind: "react" };
    return { primaryLabel: `${getWishLabel(bottle)} →`, primaryKind: "wish" };
  };

  const runPrimaryAction = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const action = getCardActions(bottle);
    if (action.primaryKind === "wish") {
      onDoSameClick(bottle.id);
      return;
    }
    if (action.primaryKind === "task") {
      setTaskSheetBottleId(bottle.id);
      setTaskSheetMode(bottle.meta.includes("助力") ? "join" : "help");
      return;
    }
    handleLike(bottle.id);
    showToast(action.primaryLabel === "真好" ? "已收到你的真好" : "已收到你的共鸣");
    window.setTimeout(() => {
      setDirection(1);
      setCurrent(value => (value + 1) % total);
    }, 220);
  };

  const activeCommentCard = activeCommentBottleId ? DRIFT_BOTTLES.find(item => item.id === activeCommentBottleId) ?? null : null;
  const taskCard = taskSheetBottleId ? DRIFT_BOTTLES.find(item => item.id === taskSheetBottleId) ?? null : null;

  const card = DRIFT_BOTTLES[current];
  const commentCount = (id: number) => (commentCountBoostById[id] || 0);

  const renderCommentButton = (id: number) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => openCommentSheet(id)}
      className="flex items-center gap-1.5 py-2.5 px-3 rounded-2xl text-sm"
      style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span>评论</span>
      <span className="text-xs tabular-nums">{commentCount(id)}</span>
    </motion.button>
  );

  const renderPrimaryActions = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const action = getCardActions(bottle);
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runPrimaryAction(bottle)}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${bottle.tagColor}, ${bottle.tagColor}cc)`, color: "oklch(0.1 0.02 265)" }}
        >
          {action.primaryKind === "react" && likedIds.has(bottle.id) ? `❤️ ${action.primaryLabel}` : action.primaryLabel}
        </motion.button>
        {action.secondaryLabel && action.secondaryKind === "wish" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onDoSameClick(bottle.id)}
            className="py-2.5 px-3 rounded-2xl text-sm"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            {action.secondaryLabel}
          </motion.button>
        )}
      </>
    );
  };

  const renderCommentSheet = () => {
    if (!activeCommentCard) return null;
    const draft = commentDraftById[activeCommentCard.id] || "";
    const isRecordingCurrent = isCommentRecording && recordingBottleId === activeCommentCard.id;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end"
          style={{ background: "oklch(0 0 0 / 45%)" }}
          onClick={closeCommentSheet}
        >
          <motion.div
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-full rounded-t-[28px] px-5 pt-4 pb-5"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--border)" }} />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs mb-1" style={{ color: activeCommentCard.tagColor }}>{activeCommentCard.tag}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{activeCommentCard.title}</p>
              </div>
              <button onClick={closeCommentSheet} className="p-1 rounded-full" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            <div className="glass-card rounded-2xl px-4 py-3 mb-3">
              <textarea
                value={draft}
                onChange={e => updateCommentDraft(activeCommentCard.id, e.target.value)}
                placeholder="说说你的想法…"
                rows={4}
                className="w-full bg-transparent text-sm outline-none resize-none"
                style={{ color: "var(--foreground)" }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: isRecordingCurrent ? "#f87171" : "var(--muted-foreground)" }}>
                  {isRecordingCurrent ? "正在转写你的语音…" : "支持文字评论 / 语音评论"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{draft.length}/80</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCommentMic(activeCommentCard.id)}
                className="w-12 h-12 rounded-full flex items-center justify-center recording-pulse"
                style={{
                  background: isRecordingCurrent ? "linear-gradient(135deg, #f87171, #ef4444)" : "var(--primary)",
                  color: "var(--background)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSendComment(activeCommentCard.id)}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{
                  background: draft.trim() ? "linear-gradient(135deg, var(--accent), var(--primary))" : "var(--secondary)",
                  color: draft.trim() ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                发送评论
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderTaskSheet = () => {
    if (!taskCard || !taskSheetMode) return null;
    const isJoin = taskSheetMode === "join";
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end"
          style={{ background: "oklch(0 0 0 / 45%)" }}
          onClick={closeTaskSheet}
        >
          <motion.div
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-full rounded-t-[28px] px-5 pt-4 pb-5"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--border)" }} />
            <div className="mb-4">
              <p className="text-xs mb-1" style={{ color: taskCard.tagColor }}>{isJoin ? "多人助力任务" : "帮 Ta 实现"}</p>
              <p className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>{taskCard.title}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{taskCard.meta} · {taskCard.loc}</p>
            </div>

            {isJoin ? (
              <div className="flex flex-col gap-3 mb-4">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>参与说明</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>发起人正在找同频伙伴一起完成这件事，你可以先加入意向名单，后续由平台继续撮合时间、地点和分工。</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>当前进度</span>
                    <span style={{ color: "var(--foreground)" }}>已确认 3 / 5 人</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {[
                  { title: "内容核验", desc: "AI 先问你 2 个问题，判断这条需求是否真实可执行。" },
                  { title: "帮忙转帖", desc: "把这条愿望扩散到更可能帮助到的人群里。" },
                ].map(task => (
                  <div key={task.title} className="glass-card rounded-2xl p-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{task.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{task.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={closeTaskSheet}
                className="flex-1 py-3 rounded-2xl text-sm"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                {isJoin ? "先不了" : "稍后再说"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  closeTaskSheet();
                  showToast(isJoin ? "已加入参与名单" : "任务已接收");
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "var(--background)" }}
              >
                {isJoin ? "确定参与" : "接受任务"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      <StatusBar />
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden moon-pulse">
            <img src={MOON_AVATAR} alt="许愿池" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>许愿池</span>
        </div>
        <button className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      {/* 进度点 */}
      <div className="flex items-center justify-center gap-1.5 pb-2">
        {DRIFT_BOTTLES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{
            width: i === current ? 18 : 6, height: 6,
            background: i === current ? "var(--primary)" : "oklch(0.3 0.01 265)",
          }} />
        ))}
      </div>

      {/* 卡片区 */}
      <div className="flex-1 px-4 relative" style={{ minHeight: 0 }}>
        {/* 背景叠影 */}
        <div className="absolute inset-x-10 top-3 bottom-2 rounded-3xl" style={{ background: "oklch(0.18 0.02 265)", zIndex: 1 }} />
        <div className="absolute inset-x-6 top-1.5 bottom-1 rounded-3xl" style={{ background: "oklch(0.22 0.025 265)", zIndex: 2 }} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 6 : -6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0, rotate: direction > 0 ? -6 : 6 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="absolute inset-x-4 top-0 bottom-0 rounded-3xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ background: "var(--card)", border: `1px solid ${card.tagColor}28`, boxShadow: `0 12px 40px oklch(0 0 0 / 40%), 0 0 0 1px ${card.tagColor}15`, zIndex: 3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -55) goNext();
              else if (info.offset.x > 55) goPrev();
            }}
          >
            {(card.type === "poem" || card.type === "quote") ? (
              /* 小诗 / 金句：全卡大字居中排版 */
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-7 pt-8 pb-4 text-center"
                  style={{ background: `linear-gradient(160deg, ${card.tagBg}, oklch(0.15 0.03 265))` }}>
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium mb-6"
                    style={{ background: card.tagBg, color: card.tagColor, border: `1px solid ${card.tagColor}40` }}>
                    {card.tag}
                  </span>
                  <p className="font-heading font-bold text-xl leading-loose whitespace-pre-line"
                    style={{ color: "var(--foreground)" }}>
                    {card.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => runPrimaryAction(card)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ background: likedIds.has(card.id) ? `linear-gradient(135deg, #f87171, #ef4444)` : `linear-gradient(135deg, ${card.tagColor}, ${card.tagColor}cc)`, color: "oklch(0.1 0.02 265)" }}>
                    {likedIds.has(card.id) ? "❤️ 真好" : "真好"}
                  </motion.button>
                  {renderCommentButton(card.id)}
                  <span className="text-xs tabular-nums px-2" style={{ color: "var(--muted-foreground)" }}>
                    {card.likes + (likedIds.has(card.id) ? 1 : 0)}
                  </span>
                </div>
              </>
            ) : (
              /* 普通卡片：封面图 + 内容区 */
              <>
                <div className="relative h-44 overflow-hidden" style={{ background: card.tagBg }}>
                  <StarField />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: card.tagBg, color: card.tagColor, border: `1px solid ${card.tagColor}40` }}>
                      {card.tag}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.1 0.02 265 / 50%)", color: "var(--muted-foreground)", backdropFilter: "blur(4px)" }}>
                      {TYPE_LABEL[card.type]}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="font-heading font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>{card.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{card.excerpt}</p>
                  </div>
                  {card.type === "goodnews" && card.link && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: card.tagColor }}>
                      <span>🔗</span>
                      <span style={{ opacity: 0.8 }}>来源：{card.link}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "oklch(var(--accent-lch) / 10%)", color: "var(--accent)" }}>{card.meta}</span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{card.loc}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderPrimaryActions(card)}
                    {renderCommentButton(card.id)}
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleLike(card.id)}
                      className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl gap-0.5"
                      style={{ background: likedIds.has(card.id) ? "oklch(0.6 0.2 20 / 18%)" : "var(--secondary)" }}>
                      <motion.span key={`${card.id}-${likedIds.has(card.id)}`} initial={{ scale: 1 }}
                        animate={likeAnim === card.id ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.35 }}
                        className="text-base leading-none">
                        {likedIds.has(card.id) ? "❤️" : "🤍"}
                      </motion.span>
                      <span className="text-xs tabular-nums leading-none" style={{ color: likedIds.has(card.id) ? "#f87171" : "var(--muted-foreground)" }}>
                        {card.likes + (likedIds.has(card.id) ? 1 : 0)}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {renderCommentSheet()}
        {renderTaskSheet()}
      </div>

      {/* 滑动提示 */}
      <p className="text-center text-xs py-2" style={{ color: "var(--muted-foreground)" }}>← 左右滑动浏览 →</p>

      {/* CTA 底部 */}
      <div className="px-5 pb-5 pt-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onWishClick}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: "var(--background)",
            boxShadow: "0 8px 24px var(--ring)",
          }}
        >
          <span className="text-lg">+</span>
          <span>说出你的心愿</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-24 px-4 py-2 rounded-full text-sm z-40"
            style={{ background: "oklch(0.18 0.02 265 / 92%)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── US-07：付费墙（会员）────────────────────────────────────────
function PaywallScreen({ onJoin, onBack }: { onJoin: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onJoin(); }, 1600);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col overflow-y-auto px-5">
        {/* 顶部关闭 */}
        <div className="flex justify-end pt-2 pb-4">
          <button onClick={onBack} className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 许愿池封面区 */}
        <div className="relative rounded-3xl overflow-hidden mb-6" style={{ height: 160, background: "var(--secondary)" }}>
          <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${MOON_BG})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, oklch(0.11 0.025 265 / 70%))" }} />
          <StarField />
          <div className="absolute bottom-4 left-5">
            <div className="w-12 h-12 rounded-full overflow-hidden mb-2 moon-pulse">
              <img src={MOON_AVATAR} alt="许愿池" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-4 right-5 text-right">
            <p className="font-heading text-2xl font-bold gold-text">¥10</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ 月 · 随时取消</p>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>开通会员，解锁许愿能力</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>AI 帮你规划、执行、跟进，直到心愿实现</p>
        </div>

        {/* 权益列表 */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: "🎯", title: "发布心愿", desc: "AI 直出完整执行方案，你只需确认关键决策" },
            { icon: "🎟️", title: "资源助力", desc: "买票、预约、核验，平台全程协助" },
            { icon: "🤝", title: "人群助力", desc: "AI按人群画像发邀约，匹配同频搭子" },
            { icon: "📍", title: "每2天跟进", desc: "轮次更新心愿进度，卡点主动通知" },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 glass-card rounded-2xl p-4">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
              </div>
              <span className="ml-auto mt-0.5 text-lg">✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部按钮区 */}
      <div className="px-5 pb-6 pt-2 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: loading ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: loading ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: loading ? "none" : "0 8px 24px var(--ring)",
          }}
        >
          {loading ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>开通中...</span></>
          ) : (
            <span>立即开通 · ¥10/月</span>
          )}
        </motion.button>
        <button onClick={onBack} className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          先逛逛，暂不开通
        </button>
      </div>
    </div>
  );
}

// ── US-03B：对话式发愿 ─────────────────────────────────────────
type Message = { role: "ai" | "user"; text: string };

const CHAT_FLOW: { aiMsg: string; userReply: string }[] = [
  { aiMsg: "你好！说说你想实现什么心愿？随便说，我来帮你想清楚。", userReply: "我想在年底前体验一次滑雪" },
  { aiMsg: "好的！我需要再了解两件事：\n\n1. 大概预算？\n2. 一个人还是找搭子？", userReply: "预算 1000 以内，想找有车的搭子一起" },
  { aiMsg: "完美，我已经有足够信息了！马上帮你制定完整方案 ✨", userReply: "" },
];

function ChatScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [autoProgress, setAutoProgress] = useState(true);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleMic = () => {
    setRecording(r => !r);
    if (!recording) {
      setTimeout(() => {
        setRecording(false);
        setInputVal("我想去崇礼滑雪，找个有车的搭子");
      }, 2000);
    }
  };

  // 自动演示流程
  useEffect(() => {
    if (!autoProgress) return;
    if (step >= CHAT_FLOW.length) { setTimeout(onNext, 600); return; }
    setTyping(true);
    const t1 = setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: CHAT_FLOW[step].aiMsg }]);
      if (CHAT_FLOW[step].userReply) {
        const t2 = setTimeout(() => {
          setMessages(m => [...m, { role: "user", text: CHAT_FLOW[step].userReply }]);
          setStep(s => s + 1);
        }, 1200);
        return () => clearTimeout(t2);
      } else {
        setStep(s => s + 1);
      }
    }, 900);
    return () => clearTimeout(t1);
  }, [step, autoProgress, onNext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="说出你的心愿" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                  <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
                </div>
              )}
              <div
                className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === "ai" ? "var(--card)" : "var(--primary)",
                  color: msg.role === "ai" ? "var(--foreground)" : "var(--primary-foreground)",
                  borderRadius: msg.role === "ai" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                  whiteSpace: "pre-line",
                }}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={MOON_AVATAR} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ borderRadius: "4px 18px 18px 18px" }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }}
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="px-4 pb-5 pt-2 flex items-center gap-2">
        <div className="flex-1 glass-card rounded-2xl px-4 py-3 flex items-center gap-2">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="回复..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {recording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#f87171" }}
            />
          )}
        </div>
        <motion.button
          onClick={handleMic}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center recording-pulse"
          style={{
            background: recording
              ? "linear-gradient(135deg, #f87171, #ef4444)"
              : "var(--primary)",
            color: "var(--background)",
            boxShadow: recording ? "0 0 16px oklch(0.55 0.22 25 / 60%)" : undefined,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </motion.button>
        <button
          onClick={onNext}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── US-01：AI直出方案 + 用户确认 ─────────────────────────────────
function AiPlanScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [headcount, setHeadcount] = useState<string>(scenario.decisionOptions[0]?.key || "solo");
  const [confirmed, setConfirmed] = useState(false);

  const steps = scenario.planSteps;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onNext, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar
        title="AI 为你制定方案"
        onBack={onBack}
        right={
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(var(--accent-lch) / 15%)", color: "var(--accent)" }}>
            已规划
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 心愿卡 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>你的心愿</p>
          <p className="font-heading font-semibold" style={{ color: "var(--foreground)" }}>
            {scenario.wishText}
          </p>
        </motion.div>

        {/* 方案卡 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              完整执行方案 · 共 {steps.length} 步
            </p>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.durationText}</span>
          </div>
          {steps.map((s, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3" style={{
              borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span className="text-sm font-semibold w-5 mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.num}</span>
              <div className="flex-1">
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{s.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.desc}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: `${s.typeColor}18`, color: s.typeColor,
                  }}>{s.type}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* AI 决策问题 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{scenario.decisionTitle}</p>
          </div>
          <div className="flex flex-col gap-2">
            {scenario.decisionOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setHeadcount(opt.key as typeof headcount)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{
                  background: headcount === opt.key ? "oklch(var(--primary-lch) / 12%)" : "var(--secondary)",
                  border: headcount === opt.key ? "1.5px solid oklch(var(--primary-lch) / 50%)" : "1.5px solid transparent",
                  color: "var(--foreground)",
                }}
              >
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: headcount === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {headcount === opt.key && (
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                  )}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 确认按钮 */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: confirmed ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: confirmed ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: confirmed ? "none" : "0 8px 24px var(--ring)",
          }}
        >
          {confirmed ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>启动执行中...</span></>
          ) : "确认，开始执行 →"}
        </motion.button>
      </div>
    </div>
  );
}

// ── US-02：执行轮次更新 ────────────────────────────────────────
function RoundUpdateScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [action, setAction] = useState<"none" | "continue" | "adjust">("none");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar
        title="第 2 轮进展"
        onBack={onBack}
        right={
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 15%)", color: "var(--accent)" }}>
            进行中
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 总进度 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>总进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{scenario.roundProgress}</span>
          </div>
          <div className="h-2 rounded-full mb-1" style={{ background: "var(--border)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: scenario.roundProgress }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.roundEta}</p>
        </motion.div>

        {/* 已完成 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>已完成</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(var(--accent-lch) / 12%)", color: "var(--accent)" }}>本轮 2 项</span>
          </div>
          {scenario.roundCompleted.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 1 ? "1px solid var(--border)" : "none" }}>
              <span className="text-base mt-0.5" style={{ color: "var(--accent)" }}>{item.icon}</span>
              <div>
                <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.src}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 下一步 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>下一步</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(var(--primary-lch) / 12%)", color: "var(--primary)" }}>需你确认</span>
          </div>
          {scenario.roundNext.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 1 ? "1px solid var(--border)" : "none" }}>
              <span className="text-base mt-0.5" style={{ color: item.urgent ? "var(--primary)" : "var(--muted-foreground)" }}>{item.icon}</span>
              <div>
                <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.src}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 资源状态 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>资源状态</p>
          {scenario.resources.map(r => (
            <div key={r.name} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.name}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{
                background: r.ok ? "oklch(0.72 0.12 185 / 12%)" : "oklch(var(--primary-lch) / 10%)",
                color: r.ok ? "var(--accent)" : "var(--primary)",
              }}>{r.status}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <div className="px-5 pb-5 pt-2 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setAction("continue"); setTimeout(onNext, 400); }}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: action === "continue" ? "var(--primary)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 6px 20px var(--ring)" }}
        >
          确认继续
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setAction("adjust")}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: "var(--secondary)", color: "var(--foreground)" }}
        >
          调整条件
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="px-3 py-3.5 rounded-2xl text-sm"
          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
        >
          暂停
        </motion.button>
      </div>
    </div>
  );
}

// ── US-04：深度调研候选搭子 ────────────────────────────────────
function DeepResearchScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [decided, setDecided] = useState(false);

  const handleEnter = () => { setDecided(true); setTimeout(onNext, 600); };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="深度调研" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 候选人摘要 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>候选人摘要</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "var(--secondary)" }}>
              {scenario.candidate.emoji}
            </div>
            <div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{scenario.candidate.title}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.candidate.subtitle}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: "82%", background: "linear-gradient(90deg, var(--accent), var(--primary))" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{scenario.candidate.match}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 站内行为 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>站内行为</p>
          {scenario.behaviorStats.map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{r.value}</span>
            </div>
          ))}
        </motion.div>

        {/* 被评价记录 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs font-semibold px-4 pt-4 pb-2" style={{ color: "var(--muted-foreground)" }}>被评价记录</p>
          {[
            { text: "\"准时靠谱，沟通顺畅\"", sub: "户外搭子 · 2025.11" },
            { text: "\"有自己节奏，不强迫他人\"", sub: "旅行搭子 · 2025.09" },
          ].map((r, i) => (
            <div key={i} className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{r.text}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* AI风险摘要 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>AI 风险摘要</p>
          {scenario.risks.map(r => (
            <div key={r.text} className="flex items-center gap-2 py-1">
              <span className="text-sm" style={{ color: r.ok === true ? "var(--accent)" : r.ok === false ? "#f87171" : "var(--primary)" }}>{r.icon}</span>
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 决策按钮 */}
      <div className="px-5 pb-5 pt-2 flex gap-3">
        <motion.button whileTap={{ scale: 0.96 }} className="flex-1 py-3.5 rounded-2xl text-sm" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
          更换候选人
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleEnter} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: decided ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: decided ? "var(--muted-foreground)" : "var(--background)", boxShadow: decided ? "none" : "0 6px 20px var(--ring)" }}>
          {decided ? "进入中..." : "进入协同 →"}
        </motion.button>
      </div>
    </div>
  );
}

// ── US-05：协同筹备 + 支付锁定 ────────────────────────────────
function CollabPrepScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [timeChoice, setTimeChoice] = useState(scenario.timeOptions[0]?.key || "default-time");
  const [placeChoice, setPlaceChoice] = useState(scenario.placeOptions[0]?.key || "default-place");
  const [rules, setRules] = useState({ r1: false, r2: false, r3: false });
  const [paying, setPaying] = useState(false);

  const allRules = rules.r1 && rules.r2 && rules.r3;

  const handlePay = () => {
    if (!allRules) return;
    setPaying(true);
    setTimeout(() => { setPaying(false); onNext(); }, 1800);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title={scenario.collabTitle} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 进度 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>心愿进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>65%</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "var(--border)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>搭子已确认 · 进入筹备阶段</p>
        </motion.div>

        {/* 参与人 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>参与人</p>
          {scenario.participants.map((p, index) => (
            <div key={p.name} className="flex items-center gap-3 py-1.5">
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>{index === 0 ? "发起人" : p.status}</span>
            </div>
          ))}
        </motion.div>

        {/* 待确认 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>待确认事项</p>
          <p className="text-xs mb-2" style={{ color: "var(--foreground)" }}>出发时间</p>
          {[
            { key: "dec28", label: "12月28日（周六）早8点" },
            { key: "dec29", label: "12月29日（周日）早9点" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setTimeChoice(opt.key)}
              className="flex items-center gap-2.5 w-full py-2 text-sm"
              style={{ color: timeChoice === opt.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: timeChoice === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                {timeChoice === opt.key && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
              </div>
              {opt.label}
              {timeChoice === opt.key && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓ 多数</span>}
            </button>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
          <p className="text-xs mb-2" style={{ color: "var(--foreground)" }}>集合地点</p>
          {scenario.placeOptions.map(opt => (
            <button key={opt.key} onClick={() => setPlaceChoice(opt.key)}
              className="flex items-center gap-2.5 w-full py-2 text-sm"
              style={{ color: placeChoice === opt.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: placeChoice === opt.key ? "var(--primary)" : "var(--muted-foreground)" }}>
                {placeChoice === opt.key && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
              </div>
              {opt.label}
              {placeChoice === opt.key && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓ 多数</span>}
            </button>
          ))}
        </motion.div>

        {/* 费用明细 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>费用明细</p>
          {scenario.costs.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{r.label}</p>
                {r.sub && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</p>}
              </div>
              <span className="text-sm font-semibold" style={{ color: r.amount === "0 元" ? "var(--accent)" : "var(--foreground)" }}>{r.amount}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>合计</span>
            <span className="font-heading font-bold text-lg gold-text">{scenario.totalCost}</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{scenario.splitNote}</p>
        </motion.div>

        {/* 规则确认 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>规则确认（必须全部勾选）</p>
          {[
            { key: "r1" as const, label: "临时退出需提前24h通知" },
            { key: "r2" as const, label: "平台担保支付，活动后释放" },
            { key: "r3" as const, label: "如遇变更AI自动启动补位" },
          ].map(r => (
            <button key={r.key} onClick={() => setRules(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
              className="flex items-center gap-3 w-full py-2">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: rules[r.key] ? "var(--primary)" : "transparent",
                  border: `2px solid ${rules[r.key] ? "var(--primary)" : "var(--muted-foreground)"}`,
                }}>
                {rules[r.key] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--background)" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>}
              </div>
              <span className="text-sm text-left" style={{ color: "var(--foreground)" }}>{r.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* 支付按钮 */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          whileTap={allRules ? { scale: 0.97 } : {}}
          onClick={handlePay}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
          style={{
            background: !allRules ? "oklch(0.25 0.02 265)" : paying ? "oklch(0.35 0.02 265)" : "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
            color: !allRules ? "var(--muted-foreground)" : paying ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: allRules && !paying ? "0 8px 24px var(--ring)" : "none",
          }}
        >
          {paying ? (
            <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>支付中...</span></>
          ) : !allRules ? "请先确认全部规则" : "确认并支付锁定 →"}
        </motion.button>
        {allRules && <p className="text-center text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>支付后可随时查看履约进度</p>}
      </div>
    </div>
  );
}

// ── US-06：活动履约 + 异常处理 + 反馈 ─────────────────────────
function FulfillmentScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [tab, setTab] = useState<"itinerary" | "exception">("itinerary");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="活动履约" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 进度 */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>心愿进度</p>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>85%</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "var(--border)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--accent)" }}>活动进行中 · 今天出发</p>
        </div>

        {/* Tab */}
        <div className="flex gap-2">
          {[
            { key: "itinerary", label: "今日行程" },
            { key: "exception", label: "异常处理" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.key ? "var(--primary)" : "var(--secondary)",
                color: tab === t.key ? "var(--background)" : "var(--muted-foreground)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "itinerary" ? (
            <motion.div key="it" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-3">
              {/* 行程时间轴 */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>今日行程</p>
                {scenario.itinerary.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="flex flex-col items-center" style={{ minWidth: 16 }}>
                      <div className="w-3 h-3 rounded-full mt-1" style={{
                        background: item.done ? "var(--accent)" : item.active ? "var(--primary)" : "var(--border)",
                      }} />
                      {i < 3 && <div className="w-0.5 h-5 mt-1" style={{ background: item.done ? "var(--accent)" : "var(--border)" }} />}
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.time}</p>
                      <p className="text-sm" style={{ color: item.active ? "var(--primary)" : "var(--foreground)", fontWeight: item.active ? 600 : 400 }}>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* 参与人状态 */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>参与人状态</p>
                {scenario.participants.map(p => (
                  <div key={p.name} className="flex items-center gap-3 py-1.5">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>{p.name}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 12%)", color: "var(--accent)" }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="ex" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
              {/* 搭子退出 */}
              <div className="rounded-2xl p-4" style={{ background: "oklch(var(--primary-lch) / 8%)", border: "1px solid oklch(var(--primary-lch) / 25%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "var(--primary)" }}>!</span>
                  <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{scenario.exceptionTitle}</p>
                </div>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{scenario.exceptionDesc}</p>
                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{scenario.exceptionEta}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl text-xs" style={{ background: "var(--primary)", color: "var(--background)" }}>{scenario.exceptionActions[0]}</button>
                  <button className="flex-1 py-2 rounded-xl text-xs" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>{scenario.exceptionActions[1]}</button>
                </div>
              </div>
              {/* 核验失败 */}
              <div className="rounded-2xl p-4" style={{ background: "oklch(0.55 0.18 25 / 8%)", border: "1px solid oklch(0.55 0.18 25 / 25%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "#f87171" }}>!</span>
                  <p className="text-sm font-semibold" style={{ color: "#f87171" }}>票务核验失败</p>
                </div>
                <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>入场核验未通过</p>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>原因：订单信息不匹配</p>
                <p className="text-xs mb-3" style={{ color: "var(--accent)" }}>AI 已联系平台处理 · 预计 15 分钟内解决</p>
                <button className="px-4 py-2 rounded-xl text-xs" style={{ background: "oklch(0.55 0.18 25 / 15%)", color: "#f87171" }}>联系客服</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-5 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 8px 24px var(--ring)" }}>
          活动完成，提交反馈 →
        </motion.button>
      </div>
    </div>
  );
}

// ── 反馈 + 故事卡（活动结束）─────────────────────────────────
function FeedbackScreen({ onNext, onBack, scenario }: { onNext: () => void; onBack: () => void; scenario: WishScenario }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    setTimeout(onNext, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="活动反馈" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4">
        {/* 完成横幅 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, oklch(var(--primary-lch) / 12%), oklch(var(--accent-lch) / 10%))", border: "1px solid oklch(var(--primary-lch) / 20%)" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none"><StarField /></div>
          <div className="relative z-10 p-5 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-heading font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>{scenario.feedbackTitle}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.feedbackMeta}</p>
          </div>
        </motion.div>

        {/* 助力明细 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>助力方式</p>
          {scenario.supportDetails.map(r => (
            <div key={r.label} className="flex items-center gap-3 py-1.5">
              <span className="text-lg">{r.icon}</span>
              <div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full mr-2" style={{ background: "oklch(var(--primary-lch) / 10%)", color: "var(--primary)" }}>{r.label}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 评价搭子 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>{scenario.partnerLabel}</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="text-2xl transition-transform"
                  style={{ transform: (hoverRating || rating) >= i ? "scale(1.2)" : "scale(1)" }}
                >
                  <span style={{ color: (hoverRating || rating) >= i ? "var(--primary)" : "var(--border)" }}>★</span>
                </button>
              ))}
            </div>
            {rating > 0 && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{["", "很差", "一般", "还不错", "挺好的", "非常棒"][rating]}</span>}
          </div>
          <textarea
            placeholder="写几句评价，帮助下一个人做决定…"
            rows={3}
            className="w-full bg-transparent text-sm outline-none resize-none"
            style={{ color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}
          />
        </motion.div>

        {/* 故事卡 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid oklch(var(--primary-lch) / 20%)" }}>
          <div className="absolute inset-0 pointer-events-none"><StarField /></div>
          <div className="relative z-10">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>生成心愿故事卡</p>
            <div className="rounded-xl p-3 mb-3" style={{ background: "oklch(var(--primary-lch) / 6%)" }}>
              <p className="font-heading font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{scenario.storyCardTitle}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{scenario.storyCardMeta}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: shared ? "var(--accent)" : "var(--primary)", color: "var(--background)" }}
              >
                {shared ? "✓ 已分享漂流瓶" : "分享漂流瓶"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
                留作纪念
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))", color: "var(--background)", boxShadow: "0 8px 24px var(--ring)" }}>
          完成，回到首页
        </motion.button>
      </div>
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────
export default function WishpoolDemo() {
  const [character, setCharacter] = useState<CharacterType>("moon");
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isMember, setIsMember] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(DEFAULT_SCENARIO.id);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", character);
  }, [character]);

  const navigate = (screen: Screen, dir: "forward" | "back" = "forward") => {
    setDirection(dir);
    setCurrentScreen(screen);
  };

  const goNext = (current: Screen) => {
    const idx = SCREEN_ORDER.indexOf(current);
    if (idx < SCREEN_ORDER.length - 1) navigate(SCREEN_ORDER[idx + 1], "forward");
  };

  const goBack = (current: Screen) => {
    const idx = SCREEN_ORDER.indexOf(current);
    if (idx > 0) navigate(SCREEN_ORDER[idx - 1], "back");
  };

  const pageVariants = {
    initial: (dir: "forward" | "back") => ({
      x: dir === "forward" ? "100%" : "-30%",
      opacity: dir === "forward" ? 0.6 : 0.8,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: "forward" | "back") => ({
      x: dir === "forward" ? "-30%" : "100%",
      opacity: 0.5,
    }),
  };

  const renderScreen = () => {
    const activeScenario = WISH_SCENARIOS[selectedScenarioId] || DEFAULT_SCENARIO;
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onNext={() => goNext("splash")} />;
      case "home":
        return (
          <HomeScreen
            isMember={isMember}
            onWishClick={() => {
              if (!isMember) navigate("paywall", "forward");
              else navigate("chat", "forward");
            }}
            onDoSameClick={(bottleId) => { setSelectedScenarioId(bottleId in WISH_SCENARIOS ? bottleId : DEFAULT_SCENARIO.id); navigate("ai-plan", "forward"); }}
          />
        );
      case "paywall":
        return (
          <PaywallScreen
            onJoin={() => { setIsMember(true); navigate("chat", "forward"); }}
            onBack={() => navigate("home", "back")}
          />
        );
      case "chat":
        return <ChatScreen onNext={() => goNext("chat")} onBack={() => goBack("chat")} />;
      case "ai-plan":
        return <AiPlanScreen scenario={activeScenario} onNext={() => goNext("ai-plan")} onBack={() => goBack("ai-plan")} />;
      case "round-update":
        return <RoundUpdateScreen scenario={activeScenario} onNext={() => goNext("round-update")} onBack={() => goBack("round-update")} />;
      case "deep-research":
        return <DeepResearchScreen scenario={activeScenario} onNext={() => goNext("deep-research")} onBack={() => goBack("deep-research")} />;
      case "collab-prep":
        return <CollabPrepScreen scenario={activeScenario} onNext={() => goNext("collab-prep")} onBack={() => goBack("collab-prep")} />;
      case "fulfillment":
        return <FulfillmentScreen scenario={activeScenario} onNext={() => goNext("fulfillment")} onBack={() => goBack("fulfillment")} />;
      case "feedback":
        return <FeedbackScreen scenario={activeScenario} onNext={() => navigate("home", "back")} onBack={() => goBack("feedback")} />;
    }
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-500"
        style={{ background: "var(--background)", padding: "20px" }}
      >
        {/* 外层光晕 */}
        <div className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(var(--primary-lch) / 8%), transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        />

        {/* 手机壳 */}
        <div className="phone-shell relative flex flex-col overflow-hidden" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif" }}>
          {/* 刘海 */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full z-50 pointer-events-none"
            style={{ background: "oklch(0.08 0.02 265)" }} />

          {/* 屏幕内容 */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute inset-0 flex flex-col"
              style={{ background: "var(--background)" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 屏幕下方导航提示 */}
        <div className="absolute bottom-8 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {SCREEN_ORDER.filter(s => s !== "splash").map(s => (
              <button
                key={s}
                onClick={() => navigate(s)}
                title={s}
                className="transition-all rounded-full"
                style={{
                  width: currentScreen === s ? 20 : 6,
                  height: 6,
                  background: currentScreen === s ? "var(--primary)" : "oklch(0.3 0.02 265)",
                }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: "oklch(0.4 0.01 265)" }}>
            {currentScreen === "home" ? "许愿池 V2.0 Demo" :
             currentScreen === "paywall" ? "付费墙 US-07" :
             currentScreen === "chat" ? "发愿对话 US-03B" :
             currentScreen === "ai-plan" ? "AI出方案 US-01" :
             currentScreen === "round-update" ? "轮次更新 US-02" :
             currentScreen === "deep-research" ? "深度调研 US-04" :
             currentScreen === "collab-prep" ? "协同筹备 US-05" :
             currentScreen === "fulfillment" ? "活动履约 US-06" :
             currentScreen === "feedback" ? "反馈故事卡" : ""}
          </p>
        </div>
      </div>
    </CharacterContext.Provider>
  );
}
