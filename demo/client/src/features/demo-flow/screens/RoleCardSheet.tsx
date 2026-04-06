import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCharacterAvatar } from "../shared";
import type { CharacterType } from "../types";

const ROLE_CONTENT: Record<CharacterType, { name: string; tagline: string; intro: string; tags: string[] }> = {
  moon: {
    name: "眠眠月",
    tagline: "温柔陪伴 · 情绪接住",
    intro: "擅长把你没说清的感觉轻轻接住，陪你把模糊的愿望慢慢说完整。",
    tags: ["情绪安抚", "陪聊", "睡前时刻"],
  },
  cloud: {
    name: "朵朵云",
    tagline: "轻快推进 · 行动建议",
    intro: "会很快帮你把愿望变成可执行的小步骤，适合需要一点推动力的时候。",
    tags: ["行动建议", "周末安排", "执行拆解"],
  },
  star: {
    name: "芽芽星",
    tagline: "灵感回流 · 好奇追问",
    intro: "喜欢从碎碎念里捞出那些微小但真实的渴望，让愿望慢慢发芽。",
    tags: ["灵感捕捉", "碎碎念", "轻提醒"],
  },
};

const ROLE_ORDER: CharacterType[] = ["moon", "cloud", "star"];

interface RoleCardSheetProps {
  open: boolean;
  initialRole?: CharacterType;
  onClose: () => void;
}

export function RoleCardSheet({ open, initialRole = "moon", onClose }: RoleCardSheetProps) {
  const [role, setRole] = useState<CharacterType>(initialRole);

  const roleIndex = useMemo(() => ROLE_ORDER.indexOf(role), [role]);
  const content = ROLE_CONTENT[role];

  const stepRole = (delta: number) => {
    const nextIndex = (roleIndex + delta + ROLE_ORDER.length) % ROLE_ORDER.length;
    setRole(ROLE_ORDER[nextIndex]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[70] flex items-center justify-center px-5"
          style={{ background: "var(--modal-overlay)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-[90%] max-w-[340px] rounded-[28px] p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 20px 48px rgba(0,0,0,.18)" }}
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 60) stepRole(-1);
              if (info.offset.x < -60) stepRole(1);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => stepRole(-1)} className="w-8 h-8 rounded-full text-sm" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>‹</button>
              <div className="flex gap-1.5">
                {ROLE_ORDER.map((item) => (
                  <span key={item} className="w-2 h-2 rounded-full" style={{ background: item === role ? "var(--primary)" : "var(--border)" }} />
                ))}
              </div>
              <button onClick={() => stepRole(1)} className="w-8 h-8 rounded-full text-sm" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>›</button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden mb-4">
                <img src={getCharacterAvatar(role)} alt={content.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>{content.name}</h3>
              <p className="text-xs mb-3" style={{ color: "var(--primary)" }}>{content.tagline}</p>
              <p className="text-sm leading-6 mb-4" style={{ color: "var(--muted-foreground)" }}>{content.intro}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {content.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
