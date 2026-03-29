import React from "react";

export type CharacterType = "moon" | "cloud" | "star";

// ── 图片资源 ───────────────────────────────────────────────────────
export const MOON_BG = "/moon-bg.png";
export const MOON_AVATAR = "/moon-avatar.png";
export const CLOUD_BG = "/cloud-bg.png";
export const CLOUD_AVATAR = "/cloud-avatar.png";

export function getCharacterAvatar(character: CharacterType): string {
  switch (character) {
    case "cloud": return CLOUD_AVATAR;
    case "star": return MOON_AVATAR; // fallback until star assets exist
    default: return MOON_AVATAR;
  }
}

export function getCharacterBg(character: CharacterType): string {
  switch (character) {
    case "cloud": return CLOUD_BG;
    case "star": return MOON_BG; // fallback
    default: return MOON_BG;
  }
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

// ── 云朵背景 ──────────────────────────────────────────────────────
export function CloudField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { x: 15, y: 12, w: 120, h: 60, opacity: 0.15, dur: 8 },
        { x: 65, y: 25, w: 100, h: 50, opacity: 0.1, dur: 10 },
        { x: 35, y: 45, w: 140, h: 65, opacity: 0.12, dur: 12 },
        { x: 80, y: 55, w: 90, h: 45, opacity: 0.08, dur: 9 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.w,
            height: c.h,
            background: i % 2 === 0
              ? "oklch(var(--primary-lch) / 25%)"
              : "oklch(var(--accent-lch) / 20%)",
            opacity: c.opacity,
            filter: "blur(30px)",
            animation: `float ${c.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── 状态栏 ─────────────────────────────────────────────────────────
export function StatusBar() {
  const [time, setTime] = React.useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });
  React.useEffect(() => {
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
