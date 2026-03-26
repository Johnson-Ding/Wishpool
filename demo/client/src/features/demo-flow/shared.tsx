import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import type { CharacterType } from "@/features/demo-flow/types";

// ── 图片资源 ───────────────────────────────────────────────────────
export const MOON_BG = "/moon-bg.png";
export const MOON_AVATAR = "/moon-avatar.png";

// ── 角色上下文（保持V1设计系统） ──────────────────────────────────
export const CharacterContext = React.createContext<{ character: CharacterType; setCharacter: (c: CharacterType) => void }>({
  character: "moon",
  setCharacter: () => {},
});

// ── 系统状态栏 ─────────────────────────────────────────────────────
export function StatusBar() {
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
export function NavBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
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
export function StarField() {
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

export function SplashScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onNext, 2600);
    return () => clearTimeout(timeout);
  }, [onNext]);

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
