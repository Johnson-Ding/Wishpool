/**
 * Wishpool Buddy — 产品动态演示 Demo
 * 设计方向：「深夜水墨·月光容器」
 * 主题：深靛蓝黑背景 + 月光金强调 + 水波青辅助
 * 字体：Noto Serif SC (标题) + Noto Sans SC (正文)
 * 
 * 演示流程：
 * 0. 启动页（眠眠月 + 品牌介绍）
 * 1. 首页（无额度状态，购买引导）
 * 2. 购买页（SKU 选择 + 支付）
 * 3. 支付成功（额度到账动画）
 * 4. 首页（有额度状态，语音入口）
 * 5. 语音录制中（声波动画）
 * 6. 意图识别中（AI 思考）
 * 7. 追问表单（心愿模糊时）
 * 8. 方案生成中（进度动画）
 * 9. 方案详情（完整路书）
 * 10. 日历导入成功
 * 11. 历史与反馈
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

// AVATARS
const STAR_AVATAR = "https://img.icons8.com/fluency/96/star.png";
const CLOUD_AVATAR = "https://img.icons8.com/fluency/96/cloud.png";

type CharacterType = "moon" | "star" | "cloud";
const CharacterContext = React.createContext<{ character: CharacterType, setCharacter: (c: CharacterType) => void }>({
  character: "moon", setCharacter: () => {}
});

const CharacterSwitcher = () => {
  const { character, setCharacter } = React.useContext(CharacterContext);
  const name = character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云";
  const avatar = character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="outline-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden moon-pulse">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <p className="font-heading font-heading text-sm font-semibold" style={{ color: "var(--foreground)" }}>{name}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>更换搭子 ▾</p>
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="glass-card rounded-xl p-2 z-50 text-sm mt-2 shadow-2xl flex flex-col gap-1" style={{ backgroundColor: "var(--popover)" }}>
        <DropdownMenu.Item className="px-3 py-2 outline-none rounded-lg cursor-pointer hover:bg-white/10 transition-colors" style={{ color: "var(--popover-foreground)" }} onClick={() => setCharacter("moon")}>🌙 眠眠月 | 深夜治愈</DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 outline-none rounded-lg cursor-pointer hover:bg-white/10 transition-colors" style={{ color: "var(--popover-foreground)" }} onClick={() => setCharacter("star")}>🌱 芽芽星 | 探索极光</DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 outline-none rounded-lg cursor-pointer hover:bg-white/10 transition-colors" style={{ color: "var(--popover-foreground)" }} onClick={() => setCharacter("cloud")}>☁️ 软软云 | 日光发呆</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};


const MOON_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663446385442/Gt8Avh7w6EDiKWST7NBhrP/wishpool-moon-bg_623c5457.png";
const MOON_AVATAR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663446385442/Gt8Avh7w6EDiKWST7NBhrP/wishpool-avatar-moon_a2b9ec66.png";
const STAR_BG = "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1080&q=80";
const CLOUD_BG = "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1080&q=80";

type Screen =
  | "splash"
  | "home-no-quota"
  | "purchase"
  | "pay-success"
  | "home-with-quota"
  | "recording"
  | "intent-detecting"
  | "form"
  | "generating"
  | "plan-detail"
  | "calendar-success"
  | "history";

const SCREEN_ORDER: Screen[] = [
  "splash",
  "home-no-quota",
  "purchase",
  "pay-success",
  "home-with-quota",
  "recording",
  "intent-detecting",
  "form",
  "generating",
  "plan-detail",
  "calendar-success",
  "history",
];

// ── 状态栏 ──────────────────────────────────────────────────
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
          <rect x="0" y="4" width="3" height="8" rx="0.5" opacity="0.4"/>
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5" opacity="0.6"/>
          <rect x="9" y="1" width="3" height="11" rx="0.5" opacity="0.8"/>
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 24 12" fill="currentColor">
          <path d="M1 4h18a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1V5a1 1 0 011-1z" opacity="0.3"/>
          <rect x="0" y="3" width="14" height="6" rx="1"/>
          <path d="M20 5.5a2 2 0 010 3" strokeWidth="1.5" stroke="currentColor" fill="none"/>
        </svg>
      </div>
    </div>
  );
}

// ── 导航栏 ──────────────────────────────────────────────────
function NavBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center px-4 py-3 relative">
      {onBack && (
        <button onClick={onBack} className="absolute left-4 p-1 rounded-full" style={{ color: "var(--primary)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      )}
      <span className="font-heading font-heading mx-auto text-base font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
    </div>
  );
}

// ── 底部导航 ──────────────────────────────────────────────────
function BottomNav({ active }: { active: "home" | "history" | "profile" }) {
  const items = [
    { key: "home", icon: "🌙", label: "许愿" },
    { key: "history", icon: "📜", label: "记录" },
    { key: "profile", icon: "👤", label: "我的" },
  ];
  return (
    <div className="glass-card flex items-center justify-around py-2 px-4 border-t" style={{ borderColor: "oklch(1 0 0 / 6%)" }}>
      {items.map((item) => (
        <button key={item.key} className="flex flex-col items-center gap-0.5 py-1 px-4">
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs" style={{ color: active === item.key ? "var(--primary)" : "var(--muted-foreground)" }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── 动态背景系统 ──────────────────────────────────────────────────
function StarField() {
  const { character } = React.useContext(CharacterContext);
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 60, size: Math.random() * 2 + 1, delay: Math.random() * 4,
  }));
  
  if (character === "cloud") {
    // Cloud daytime background
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-orange-100 opacity-60 mix-blend-overlay" />
        <motion.div className="absolute top-10 left-10 w-24 h-12 bg-white/40 rounded-full blur-xl" animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute top-32 right-10 w-32 h-16 bg-white/30 rounded-full blur-xl" animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>
    );
  }
  
  if (character === "star") {
    // Aurora background
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-purple-500/20 via-green-400/20 to-transparent blur-[80px]"
          animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  // Moon background
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "var(--foreground)",
            animation: `starTwinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── 0. 启动页 ──────────────────────────────────────────────────
function SplashScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  useEffect(() => {
    const t = setTimeout(onNext, 2800);
    return () => clearTimeout(t);
  }, [onNext]);
  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${MOON_BG})`, opacity: 0.6 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.11 0.025 265 / 20%), oklch(0.11 0.025 265 / 80%))" }} />
      <StarField />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="moon-pulse float-anim w-28 h-28 rounded-full overflow-hidden mb-6">
          <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt={character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"} className="w-full h-full object-cover" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-heading font-heading text-3xl font-bold gold-text mb-2"
        >
          {character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          你的心愿执行搭子
        </motion.p>
      </motion.div>
    </div>
  );
}

// ── 漂流瓶卡片数据 ──────────────────────────────────────────
const DRIFT_BOTTLES = [
  { type: "心愿", emoji: "🌊", color: "var(--accent)", bg: "oklch(var(--accent-lch) / 12%)", content: "想在下雨天的傍晚，找一家有落地窗的咖啡馆，什么都不想，就发呆两小时。", action: "帮 TA 实现这个心愿" },
  { type: "美句", emoji: "✨", color: "var(--primary)", bg: "oklch(var(--primary-lch) / 12%)", content: "你不必成为任何人期待的样子，月亮也只在夜晚发光，但它从不为此道歉。", action: "收藏这句话" },
  { type: "烦恼", emoji: "🌧", color: "var(--muted-foreground)", bg: "var(--muted)", content: "最近总觉得在公司很孤独，不知道怎么跟同事建立真实的连接……", action: "我也有这个烦恼" },
  { type: "好消息", emoji: "🌿", color: "var(--primary)", bg: "oklch(var(--primary-lch) / 10%)", content: "科学家发现一种新型珊瑚礁，正在以惊人的速度在太平洋自我修复，海洋正在慢慢愈合。", action: "真的太好了" },
  { type: "祝福", emoji: "🌸", color: "var(--accent)", bg: "oklch(var(--accent-lch) / 10%)", content: "希望每一个周五下班的你，都能找到一件让自己开心的小事，哪怕只是一杯好喝的奶茶。", action: "谢谢你" },
];

// ── 漂流瓶滑动卡片组件 ──────────────────────────────────────────
function DriftBottleCards({ onPurchase }: { onPurchase?: () => void }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  const goNext = () => {
    setDirection(1);
    setCurrent(c => (c + 1) % DRIFT_BOTTLES.length);
  };
  const goPrev = () => {
    setDirection(-1);
    setCurrent(c => (c - 1 + DRIFT_BOTTLES.length) % DRIFT_BOTTLES.length);
  };

  const card = DRIFT_BOTTLES[current];
  const prevIdx = (current - 1 + DRIFT_BOTTLES.length) % DRIFT_BOTTLES.length;
  const nextIdx = (current + 1) % DRIFT_BOTTLES.length;

  return (
    <div className="flex-1 flex flex-col px-5 py-3 gap-3">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>从许愿池打捞到</p>
        <div className="flex gap-1">
          {DRIFT_BOTTLES.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === current ? 16 : 6,
              height: 6,
              background: i === current ? "var(--primary)" : "oklch(0.3 0.01 265)",
            }} />
          ))}
        </div>
      </div>

      {/* 卡片叠层 */}
      <div className="relative flex-1" style={{ minHeight: 240 }}>
        {/* 背景叠影 -2 */}
        <div className="absolute inset-x-6 top-4 bottom-0 rounded-2xl" style={{ background: "var(--secondary)", transform: "scale(0.92)", zIndex: 1 }} />
        {/* 背景叠影 -1 */}
        <div className="absolute inset-x-3 top-2 bottom-0 rounded-2xl" style={{ background: "oklch(0.2 0.025 265)", transform: "scale(0.96)", zIndex: 2 }} />

        {/* 主卡片 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: direction > 0 ? 280 : -280, opacity: 0, rotate: direction > 0 ? 8 : -8 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: direction > 0 ? -280 : 280, opacity: 0, rotate: direction > 0 ? -8 : 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute inset-0 rounded-2xl p-5 flex flex-col cursor-grab active:cursor-grabbing"
            style={{ background: "var(--card)", border: `1px solid ${card.color}30`, zIndex: 3, boxShadow: `0 8px 32px ${card.color}20` }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragStart={() => setDragging(true)}
            onDragEnd={(_, info) => {
              setDragging(false);
              if (info.offset.x < -60) goNext();
              else if (info.offset.x > 60) goPrev();
            }}
          >
            {/* 类型标签 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{card.emoji}</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: card.bg, color: card.color }}>
                {card.type}
              </span>
            </div>

            {/* 正文 */}
            <p className="font-heading font-heading text-base leading-relaxed flex-1" style={{ color: "oklch(0.88 0.008 65)" }}>
              {card.content}
            </p>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={card.type === "心愿" && onPurchase ? onPurchase : goNext}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: card.bg, color: card.color }}
              >
                {card.action}
              </button>
              <button
                onClick={goNext}
                className="py-2.5 px-4 rounded-xl text-sm"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                下一个
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 滑动提示 */}
      <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>← 左右滑动打捞漂流瓶 →</p>
    </div>
  );
}

// ── 1. 首页（无额度）──────────────────────────────────────────
function HomeNoQuota({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <CharacterSwitcher />
          <div className="glass rounded-xl px-3 py-1.5">
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>0 次额度</span>
          </div>
        </div>

        {/* 漂流瓶卡片 */}
        <DriftBottleCards onPurchase={onNext} />

        {/* CTA */}
        <div className="px-5 pb-3">
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-semibold text-base serif"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary))",
              color: "var(--background)",
              boxShadow: "0 8px 24px var(--ring)",
            }}
          >
            购买心愿额度，开始许愿
          </motion.button>
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}

// ── 2. 购买页 ──────────────────────────────────────────────────
function PurchasePage({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<"single" | "bundle">("bundle");
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onNext();
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="购买心愿额度" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
        {/* 说明 */}
        <div className="text-center py-2">
          <p className="font-heading font-heading text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>选择适合你的套餐</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>每次心愿包含：1个专属方案 · 无限修改 · 聊天权益</p>
        </div>

        {/* 单次 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("single")}
          className="glass-card rounded-2xl p-5 cursor-pointer transition-all"
          style={{
            border: selected === "single" ? "1.5px solid var(--primary)" : "1px solid var(--border)",
            boxShadow: selected === "single" ? "0 0 20px var(--ring)" : "none",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🌙</span>
                <span className="font-heading font-heading font-semibold" style={{ color: "var(--foreground)" }}>单次体验</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>1次心愿额度，按需使用</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-heading text-2xl font-bold gold-text">¥59.9</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ 次</p>
            </div>
          </div>
          {selected === "single" && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-wrap gap-2">
                {["1个专属方案", "无限修改", "AI陪聊权益", "一键日历导出"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--ring)", color: "var(--primary)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* 四次套餐 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("bundle")}
          className="glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all"
          style={{
            border: selected === "bundle" ? "1.5px solid var(--primary)" : "1px solid var(--border)",
            boxShadow: selected === "bundle" ? "0 0 20px var(--ring)" : "none",
          }}
        >
          <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "oklch(var(--accent-lch) / 20%)", color: "var(--accent)" }}>
            省 ¥39.7
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✨</span>
                <span className="font-heading font-heading font-semibold" style={{ color: "var(--foreground)" }}>超值四次</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>4次心愿额度，按需使用，永不过期</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-heading text-2xl font-bold gold-text">¥199.9</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>¥50/次</p>
            </div>
          </div>
          {selected === "bundle" && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-wrap gap-2">
                {["4次心愿额度", "无限修改", "AI陪聊权益", "一键日历导出", "永不过期"].map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--ring)", color: "var(--primary)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* 权益说明 */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-medium mb-2" style={{ color: "oklch(0.7 0.01 265)" }}>每次额度包含</p>
          {[
            ["🗺️", "1个完全定制的专属执行方案"],
            ["✏️", "无限次修改，直到你满意为止"],
            ["💬", "付费后解锁AI陪聊，积累你的偏好记忆"],
            ["📅", "一键导入手机日历，直接出发"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2 py-1">
              <span className="text-base">{icon}</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 支付按钮 */}
      <div className="px-5 py-4">
        <motion.button
          onClick={handlePay}
          disabled={paying}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-semibold text-base serif flex items-center justify-center gap-2"
          style={{
            background: paying ? "oklch(0.4 0.02 265)" : "linear-gradient(135deg, var(--primary), var(--primary))",
            color: paying ? "var(--muted-foreground)" : "var(--background)",
            boxShadow: paying ? "none" : "0 8px 24px var(--ring)",
            transition: "all 0.3s",
          }}
        >
          {paying ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>微信支付中...</span>
            </>
          ) : (
            <>
              <span>微信支付</span>
              <span>{selected === "single" ? "¥59.9" : "¥199.9"}</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ── 3. 支付成功 ──────────────────────────────────────────────────
function PaySuccessScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  useEffect(() => {
    const t = setTimeout(onNext, 2500);
    return () => clearTimeout(t);
  }, [onNext]);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <StarField />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
        style={{ background: "linear-gradient(135deg, var(--ring), oklch(var(--primary-lch) / 10%))", border: "2px solid oklch(var(--primary-lch) / 40%)" }}
      >
        ✨
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="font-heading font-heading text-xl font-bold mb-2 gold-text">支付成功</p>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>已获得 4 次心愿额度</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="w-48 h-1 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))", transformOrigin: "left" }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        正在跳转...
      </motion.p>
    </div>
  );
}

// ── 4. 首页（有额度）──────────────────────────────────────────
function HomeWithQuota({ onNext, quota }: { onNext: () => void; quota: number }) {
  const { character } = React.useContext(CharacterContext);
  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero */}
        <div className="relative h-44 overflow-hidden">
          <img src={character === "moon" ? MOON_BG : character === "star" ? STAR_BG : CLOUD_BG} alt="" className="w-full h-full object-cover" style={{ opacity: 0.7 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, var(--background))" }} />
          <div className="absolute top-4 left-4">
            <CharacterSwitcher />
          </div>
          <div className="absolute top-4 right-4">
            <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-sm">✨</span>
              <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>剩余 {quota} 次额度</span>
            </div>
          </div>
        </div>

        {/* 主内容 */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-4">
          {/* 角色问候 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 moon-pulse">
              <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt={character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"} className="w-full h-full object-cover" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                今天想做什么？告诉我你的心愿，哪怕只是一个模糊的感觉 🌙
              </p>
            </div>
          </motion.div>

          {/* 漂流瓶卡片 */}
          <DriftBottleCards />

          {/* 语音按钮 */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>按住说话，告诉眠眠月你的心愿</p>
            <motion.button
              onTapStart={onNext}
              whileTap={{ scale: 0.93 }}
              className="w-20 h-20 rounded-full flex items-center justify-center recording-pulse"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary))",
                boxShadow: "0 0 30px oklch(var(--primary-lch) / 40%), 0 8px 24px oklch(0 0 0 / 30%)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--background)">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeWidth="2" stroke="var(--background)" fill="none" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" stroke="var(--background)" strokeLinecap="round"/>
                <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" stroke="var(--background)" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}

// ── 5. 录音中 ──────────────────────────────────────────────────
function RecordingScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  const [seconds, setSeconds] = useState(0);
  const [bars] = useState(() => Array.from({ length: 30 }, () => Math.random() * 0.7 + 0.3));

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(onNext, 3000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="正在聆听..." />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* 声波可视化 */}
        <div className="flex items-center gap-1 h-16">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full"
              style={{ background: "linear-gradient(to top, var(--primary), var(--accent))" }}
              animate={{ height: [`${h * 16}px`, `${h * 48}px`, `${h * 16}px`] }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                repeat: Infinity,
                delay: i * 0.04,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 识别文字 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl px-6 py-4 text-center max-w-xs"
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            "这周末想出去放松一下，最近工作太累了，想去个安静的地方..."
          </p>
        </motion.div>

        {/* 计时 */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="tabular-nums text-sm" style={{ color: "var(--muted-foreground)" }}>
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </span>
        </div>

        {/* 松开提示 */}
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>松开即发送</p>
      </div>
    </div>
  );
}

// ── 6. 意图识别中 ──────────────────────────────────────────────
function IntentDetectingScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  useEffect(() => {
    const t = setTimeout(onNext, 2200);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        <div className="w-20 h-20 rounded-full overflow-hidden float-anim moon-pulse flex-shrink-0 relative">
          <CharacterContext.Consumer>
            {({ character }) => (
               <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt="Avatar" className="w-full h-full object-cover absolute inset-0 z-10" />
            )}
          </CharacterContext.Consumer>
        </div>
        <div className="text-center">
          <p className="font-heading font-heading text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            {character === "moon" ? "眠眠月正在理解你的心愿" : character === "star" ? "芽芽星正在捕捉星光灵感" : "软软云正在为你拨云见日"}
          </p>
          <div className="flex items-center justify-center gap-2.5">
            {character === "moon" ? (
              [0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--primary)", boxShadow: "0 0 12px var(--primary)" }}
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))
            ) : character === "star" ? (
              <motion.div
                className="w-10 h-10 rounded-full border-2 border-dashed relative"
                style={{ borderColor: "var(--primary)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2 h-2 rounded-full absolute -top-1 left-1/2 bg-white" />
              </motion.div>
            ) : (
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 bg-white/60 rounded-full blur-sm"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="glass-card rounded-2xl px-5 py-3 w-full">
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>我听到你说</p>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            "这周末想出去放松一下，最近工作太累了，想去个安静的地方..."
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 7. 追问表单 ──────────────────────────────────────────────────
function FormScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { character } = React.useContext(CharacterContext);
  const [time, setTime] = useState("周六全天");
  const [budget, setBudget] = useState("200-500元");
  const [city, setCity] = useState("上海");
  const [avoid, setAvoid] = useState("人太多的地方");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="补充一点信息" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3">
        {/* 陪伴者说 */}
        <div className="flex items-start gap-3 mb-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt={character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"} className="w-full h-full object-cover" />
          </div>
          <div className="glass-card rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
            <p className="text-xs leading-relaxed" style={{ color: "oklch(0.78 0.008 65)" }}>
              我帮你想了一下，需要再了解几个细节，才能给你最准确的方案 ✨
            </p>
          </div>
        </div>

        {/* 表单字段 */}
        {[
          { label: "什么时候？", value: time, setter: setTime, options: ["周六全天", "周日全天", "周六下午", "周日下午", "工作日晚上"] },
          { label: "预算大概多少？", value: budget, setter: setBudget, options: ["100元以内", "100-200元", "200-500元", "500元以上"] },
          { label: "在哪个城市？", value: city, setter: setCity, options: ["上海", "北京", "深圳", "广州", "杭州"] },
          { label: "有什么不想要的？", value: avoid, setter: setAvoid, options: ["人太多的地方", "太贵的地方", "需要提前预约", "户外活动", "无所谓"] },
        ].map((field) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-4"
          >
            <p className="text-xs font-medium mb-2.5" style={{ color: "oklch(0.7 0.01 265)" }}>{field.label}</p>
            <div className="flex flex-wrap gap-2">
              {field.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => field.setter(opt)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: field.value === opt ? "var(--ring)" : "var(--border)",
                    color: field.value === opt ? "var(--primary)" : "var(--muted-foreground)",
                    border: field.value === opt ? "1px solid oklch(var(--primary-lch) / 50%)" : "1px solid var(--border)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-5 py-4">
        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-semibold text-base serif"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary))",
            color: "var(--background)",
            boxShadow: "0 8px 24px var(--ring)",
          }}
        >
          帮我生成方案 ✨
        </motion.button>
      </div>
    </div>
  );
}

// ── 8. 生成中 ──────────────────────────────────────────────────
function GeneratingScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  const [progress, setProgress] = useState(0);
  const steps = ["理解你的心愿...", "搜索上海周末活动...", "筛选安静的好去处...", "规划最优路线...", "生成执行路书..."];
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, steps.length - 1));
    }, 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(onNext, 500);
      return () => clearTimeout(t);
    }
  }, [progress, onNext]);

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden float-anim">
            <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt={character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"} className="w-full h-full object-cover" />
          </div>
          {/* 涟漪 */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid var(--ring)",
                animation: `waveRipple 2s ease-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center w-full">
          <p className="font-heading font-heading text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>正在为你定制专属方案</p>
          {/* 进度条 */}
          <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "var(--border)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))", width: `${progress}%` }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              {steps[stepIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── 9. 方案详情 ──────────────────────────────────────────────────
function PlanDetailScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { character } = React.useContext(CharacterContext);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="你的专属方案" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3">
        {/* 方案头 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
          style={{ animation: "cardReveal 0.5s ease-out forwards" }}
        >
          <div className="relative h-28 overflow-hidden">
            <img src={MOON_BG} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, var(--card))" }} />
            <div className="absolute bottom-3 left-4">
              <p className="font-heading font-heading text-base font-bold" style={{ color: "var(--foreground)" }}>西岸美术馆 · 龙美术馆一日</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>周六 · 上海徐汇 · 约¥280</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-2 flex-wrap mb-3">
              {["安静", "艺术", "适合独自", "无需预约"].map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 15%)", color: "var(--accent)" }}>{t}</span>
              ))}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              眠眠月推荐：西岸美术馆人少、展览质量高，非常适合你说的"安静放松"。龙美术馆步行可达，两馆合计约4小时，不会太累。
            </p>
          </div>
        </motion.div>

        {/* 执行步骤 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <p className="font-heading font-heading text-sm font-semibold mb-3" style={{ color: "var(--primary)" }}>傻瓜执行路书</p>
          {[
            { time: "10:00", action: "出发", detail: "地铁11号线 → 龙华中路站，步行8分钟" },
            { time: "10:30", action: "西岸美术馆", detail: "门票¥100，建议游览1.5-2小时" },
            { time: "12:30", action: "午餐", detail: "馆内咖啡厅或周边西餐，预算¥80-120" },
            { time: "14:00", action: "龙美术馆", detail: "步行10分钟，门票¥50，游览1.5小时" },
            { time: "16:00", action: "滨江散步", detail: "沿黄浦江漫步，看夕阳，自由活动" },
          ].map((step, i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: "var(--primary)" }} />
                {i < 4 && <div className="w-px flex-1 mt-1" style={{ background: "var(--ring)" }} />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs tabular-nums" style={{ color: "var(--primary)" }}>{step.time}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{step.action}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{step.detail}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 日历按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onNext}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, oklch(var(--accent-lch) / 20%), oklch(var(--accent-lch) / 10%))",
            border: "1px solid oklch(var(--accent-lch) / 40%)",
            color: "var(--accent)",
          }}
        >
          <span>📅</span>
          <span>一键导入手机日历</span>
        </motion.button>

        {/* 聊天区域 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4"
        >
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>对方案有想法？直接告诉眠眠月</p>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="例：预算再低一点..."
              className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
              style={{
                background: "var(--border)",
                border: "1px solid var(--input)",
                color: "var(--foreground)",
              }}
            />
            <button
              className="px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: "var(--ring)", color: "var(--primary)" }}
            >
              发送
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── 10. 日历导入成功 ──────────────────────────────────────────
function CalendarSuccessScreen({ onNext }: { onNext: () => void }) {
  const { character } = React.useContext(CharacterContext);
  useEffect(() => {
    const t = setTimeout(onNext, 2500);
    return () => clearTimeout(t);
  }, [onNext]);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-6xl"
      >
        📅
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="font-heading font-heading text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>已加入日历</p>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>周六的行程已添加到你的手机日历</p>
        <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>出发前眠眠月会提醒你 🌙</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-xl px-5 py-3 text-center"
      >
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>周六 10:00 · 西岸美术馆 · 龙美术馆一日</p>
      </motion.div>
    </div>
  );
}

// ── 11. 历史与反馈 ──────────────────────────────────────────
function HistoryScreen({ onBack }: { onBack: () => void }) {
  const { character } = React.useContext(CharacterContext);
  const [showFeedback, setShowFeedback] = useState(true);
  return (
    <div className="flex flex-col h-full">
      <StatusBar />
      <NavBar title="我的心愿记录" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
        {/* 反馈拦截 */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl p-4"
              style={{ background: "linear-gradient(135deg, var(--ring), oklch(var(--primary-lch) / 8%))", border: "1px solid var(--ring)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <img src={character === "moon" ? MOON_AVATAR : character === "star" ? STAR_AVATAR : CLOUD_AVATAR} alt={character === "moon" ? "眠眠月" : character === "star" ? "芽芽星" : "软软云"} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>眠眠月想知道</p>
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--foreground)" }}>上次的「西岸美术馆一日」感觉怎么样？</p>
              <div className="flex gap-2">
                {["很棒！", "还不错", "一般般", "没去成"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setShowFeedback(false)}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "var(--ring)", color: "var(--primary)", border: "1px solid var(--ring)" }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 历史列表 */}
        <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>历史心愿</p>
        {[
          { date: "3月22日", title: "西岸美术馆 · 龙美术馆一日", tags: ["安静", "艺术"], status: "已完成", emoji: "🎨" },
          { date: "3月15日", title: "职场汇报思路梳理", tags: ["职场", "决策"], status: "已完成", emoji: "💼" },
          { date: "3月8日", title: "闵行区骑行路线", tags: ["户外", "运动"], status: "已完成", emoji: "🚴" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "oklch(var(--primary-lch) / 10%)" }}>
              {item.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.72 0.12 185 / 15%)", color: "var(--accent)" }}>{item.status}</span>
              </div>
              <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{item.date}</p>
              <div className="flex gap-1.5">
                {item.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--border)", color: "var(--muted-foreground)" }}>{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* 剩余额度 */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>剩余心愿额度</p>
            <p className="font-heading font-heading text-2xl font-bold gold-text">3 次</p>
          </div>
          <button className="text-xs px-4 py-2 rounded-xl" style={{ background: "var(--ring)", color: "var(--primary)" }}>
            继续许愿
          </button>
        </div>
      </div>
      <BottomNav active="history" />
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────
export default function WishpoolDemo() {
  const [character, setCharacter] = useState<CharacterType>("moon");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', character);
  }, [character]);

  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [quota, setQuota] = useState(0);

  const navigate = (screen: Screen, dir: "forward" | "back" = "forward") => {
    setDirection(dir);
    setCurrentScreen(screen);
  };

  const goNext = (current: Screen) => {
    const idx = SCREEN_ORDER.indexOf(current);
    if (idx < SCREEN_ORDER.length - 1) {
      navigate(SCREEN_ORDER[idx + 1], "forward");
    }
  };

  const goBack = (current: Screen) => {
    const idx = SCREEN_ORDER.indexOf(current);
    if (idx > 0) {
      navigate(SCREEN_ORDER[idx - 1], "back");
    }
  };

  const pageVariants = {
    initial: (dir: "forward" | "back") => ({
      x: dir === "forward" ? "100%" : "-30%",
      opacity: dir === "forward" ? 0.5 : 0.8,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: "forward" | "back") => ({
      x: dir === "forward" ? "-30%" : "100%",
      opacity: 0.5,
    }),
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onNext={() => goNext("splash")} />;
      case "home-no-quota":
        return <HomeNoQuota onNext={() => goNext("home-no-quota")} />;
      case "purchase":
        return <PurchasePage onNext={() => { setQuota(4); goNext("purchase"); }} onBack={() => goBack("purchase")} />;
      case "pay-success":
        return <PaySuccessScreen onNext={() => goNext("pay-success")} />;
      case "home-with-quota":
        return <HomeWithQuota onNext={() => goNext("home-with-quota")} quota={quota} />;
      case "recording":
        return <RecordingScreen onNext={() => goNext("recording")} />;
      case "intent-detecting":
        return <IntentDetectingScreen onNext={() => goNext("intent-detecting")} />;
      case "form":
        return <FormScreen onNext={() => goNext("form")} onBack={() => goBack("form")} />;
      case "generating":
        return <GeneratingScreen onNext={() => goNext("generating")} />;
      case "plan-detail":
        return <PlanDetailScreen onNext={() => goNext("plan-detail")} onBack={() => goBack("plan-detail")} />;
      case "calendar-success":
        return <CalendarSuccessScreen onNext={() => goNext("calendar-success")} />;
      case "history":
        return <HistoryScreen onBack={() => navigate("home-with-quota", "back")} />;
    }
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
    <div
      className="min-h-screen flex items-center justify-center transition-colors duration-500"
      style={{ background: "var(--background)", padding: "20px" }}
    >
      {/* 外层装饰光晕 */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(var(--primary-lch) / 8%), transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* 手机壳 */}
      <div className="phone-shell relative">
        {/* 刘海 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-28 h-6 rounded-b-2xl"
          style={{ background: "var(--background)" }}
        />

        {/* 屏幕内容 */}
        <div className="w-full h-full overflow-hidden relative" style={{ background: "var(--background)" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full"
          style={{ background: "oklch(1 0 0 / 25%)" }}
        />
      </div>

      {/* 进度指示器 */}
    
      <div className="absolute bottom-6 flex gap-1.5">
        {SCREEN_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => navigate(s, SCREEN_ORDER.indexOf(s) > SCREEN_ORDER.indexOf(currentScreen) ? "forward" : "back")}
            className="rounded-full transition-all"
            style={{
              width: s === currentScreen ? "20px" : "6px",
              height: "6px",
              background: s === currentScreen ? "var(--primary)" : "oklch(1 0 0 / 20%)",
            }}
          />
        ))}
      </div>
    </div>
    </CharacterContext.Provider>
  );
}
