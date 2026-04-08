import { motion, AnimatePresence } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MembershipStatus } from "./components/MembershipStatus";
import { LogFeedback } from "./components/LogFeedback";
import { UpdateChecker } from "./components/UpdateChecker";
import { CharacterContext, getCharacterAvatar } from "@/features/demo-flow/shared";
import type { CharacterType } from "@/features/demo-flow/types";

const CHARACTERS: {
  id: CharacterType;
  name: string;
  desc: string;
  colors: [string, string, string];
}[] = [
  { id: "moon", name: "眠眠月", desc: "深夜水墨 · 月光容器", colors: ["#0A0E1A", "#F5C842", "#4AADA0"] },
  { id: "cloud", name: "朵朵云", desc: "晨曦白昼 · 植绒呼吸", colors: ["#F0F9FF", "#F97066", "#60A5FA"] },
  { id: "star", name: "芽芽星", desc: "深空极光 · 荧光果冻", colors: ["#1A0F2E", "#4ADE80", "#22D3EE"] },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { character, setCharacter } = useContext(CharacterContext);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setOverlayRoot(document.getElementById("phone-demo-overlays"));
  }, []);

  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[60] pointer-events-auto"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-[61] rounded-t-2xl overflow-hidden pointer-events-auto"
            style={{
              background: "var(--background)",
              maxHeight: "80%",
              width: "100%"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                设置
              </h2>
              <button
                onClick={onClose}
                className="text-2xl leading-none"
                style={{ color: "var(--muted-foreground)" }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 60px)" }}>
              {/* 角色选择 */}
              <div className="mb-2">
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>角色选择</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CHARACTERS.map((c) => {
                    const isActive = character === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCharacter(c.id)}
                        className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all"
                        style={{
                          background: isActive ? `linear-gradient(135deg, ${c.colors[1]}15, ${c.colors[2]}10)` : "var(--secondary)",
                          border: isActive ? `2px solid ${c.colors[1]}60` : "2px solid transparent",
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ boxShadow: isActive ? `0 0 12px ${c.colors[1]}40` : "none" }}>
                          <img src={getCharacterAvatar(c.id)} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <MembershipStatus />
              <LogFeedback />
              <UpdateChecker />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    overlayRoot,
  );
}
