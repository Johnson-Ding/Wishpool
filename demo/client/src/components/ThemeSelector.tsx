import { useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CharacterContext } from "@/features/demo-flow/shared";
import type { CharacterType } from "@/features/demo-flow/types";

const CHARACTERS: {
  id: CharacterType;
  emoji: string;
  name: string;
  desc: string;
  colors: [string, string, string]; // bg, primary, accent
  disabled?: boolean;
}[] = [
  {
    id: "moon",
    emoji: "🌙",
    name: "眠眠月",
    desc: "深夜水墨 · 月光容器",
    colors: ["#0A0E1A", "#F5C842", "#4AADA0"],
  },
  {
    id: "cloud",
    emoji: "☁️",
    name: "朵朵云",
    desc: "晨曦白昼 · 植绒呼吸",
    colors: ["#F0F9FF", "#F97066", "#60A5FA"],
  },
  {
    id: "star",
    emoji: "🌱",
    name: "芽芽星",
    desc: "深空极光 · 荧光果冻",
    colors: ["#1A0F2E", "#4ADE80", "#22D3EE"],
    disabled: true,
  },
];

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeSelector({ open, onClose }: ThemeSelectorProps) {
  const { character, setCharacter } = useContext(CharacterContext);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: "var(--modal-overlay)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-full rounded-t-[28px] px-5 pt-4 pb-8"
            style={{
              background: "var(--card)",
              borderTop: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div
              className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: "var(--border)" }}
            />

            <h3
              className="font-heading text-base font-semibold text-center mb-4"
              style={{ color: "var(--foreground)" }}
            >
              选择你的陪伴搭子
            </h3>

            <div className="flex flex-col gap-3">
              {CHARACTERS.map((c) => {
                const isActive = character === c.id;
                return (
                  <motion.button
                    key={c.id}
                    whileTap={c.disabled ? undefined : { scale: 0.97 }}
                    onClick={() => {
                      if (c.disabled) return;
                      setCharacter(c.id);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${c.colors[1]}15, ${c.colors[2]}10)`
                        : "var(--secondary)",
                      border: isActive
                        ? `2px solid ${c.colors[1]}60`
                        : "2px solid transparent",
                      opacity: c.disabled ? 0.5 : 1,
                      cursor: c.disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {/* Color preview */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: c.colors[0],
                        boxShadow: isActive
                          ? `0 0 12px ${c.colors[1]}40`
                          : "none",
                      }}
                    >
                      {c.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-heading text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {c.name}
                        </span>
                        {isActive && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `${c.colors[1]}20`,
                              color: c.colors[1],
                            }}
                          >
                            当前
                          </span>
                        )}
                        {c.disabled && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "var(--muted)",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            即将上线
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs mt-0.5 block"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {c.desc}
                      </span>
                    </div>

                    {/* Color dots */}
                    <div className="flex gap-1 shrink-0">
                      {c.colors.slice(1).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
