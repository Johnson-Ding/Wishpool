import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WishScenario } from "../data";
import type { CharacterType } from "../types";
import { getCharacterAvatar } from "../shared";
import { RoleCardSheet } from "./RoleCardSheet";

type ChatItem =
  | { id: string; type: "user"; text: string }
  | { id: string; type: "ai"; role: CharacterType; name: string; text: string }
  | { id: string; type: "wish"; title: string; summary: string; todos: { id: string; text: string; completed: boolean }[] }
  | { id: string; type: "moment"; title: string; text: string; shared?: boolean; editable?: boolean };

const ROLE_BAR: { role: CharacterType; name: string }[] = [
  { role: "moon", name: "眠眠月" },
  { role: "cloud", name: "朵朵云" },
  { role: "star", name: "芽芽星" },
];

const MOCK_TRANSCRIPTS = [
  "这周想留一个晚上给自己去散散步。",
  "我想带爸妈找个周末出去走走。",
  "忽然很想去海边吹吹风。",
];

interface ChatDetailScreenProps {
  scenario: WishScenario;
  draft: string;
  onDraftChange: (value: string) => void;
  onScenarioChange: (scenarioId: number) => void;
  openVoiceAfterEnter: boolean;
  onVoiceHandled: () => void;
}

export function ChatDetailScreen({ scenario, draft, onDraftChange, onScenarioChange, openVoiceAfterEnter, onVoiceHandled }: ChatDetailScreenProps) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [roleCardRole, setRoleCardRole] = useState<CharacterType>("moon");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  useEffect(() => {
    setItems([
      { id: "ai-1", type: "ai", role: "moon", name: "眠眠月", text: "今晚想先说说心里冒出来的愿望，还是只想安静地碎碎念一下？" },
      { id: "user-1", type: "user", text: "先随便聊聊也可以。" },
      { id: "moment-1", type: "moment", title: "碎碎念", text: "今天也想把生活过得更像自己一点。", shared: true, editable: true },
      { id: `wish-${scenario.id}`, type: "wish", title: scenario.wishText, summary: "AI 先帮你整理出一个可开始的小方案。", todos: scenario.planSteps.slice(0, 3).map((step, index) => ({ id: `${scenario.id}-${index}`, text: step.title, completed: index === 0 })) },
    ]);
  }, [scenario]);

  useEffect(() => {
    if (openVoiceAfterEnter) {
      setVoiceOpen(true);
      onVoiceHandled();
    }
  }, [openVoiceAfterEnter, onVoiceHandled]);

  const progressText = useMemo(() => `${scenario.durationText} · ${scenario.roundProgress}`, [scenario]);

  const openRoleCard = (role: CharacterType) => {
    setRoleCardRole(role);
    setShowRoleCard(true);
  };

  const appendWishCard = (text: string) => {
    setItems((current) => [
      ...current,
      { id: `user-${Date.now()}`, type: "user", text },
      { id: `ai-${Date.now() + 1}`, type: "ai", role: "cloud", name: "朵朵云", text: "我先帮你收成一个愿望卡，接下来就能一步步往前推。" },
      { id: `wish-${Date.now() + 2}`, type: "wish", title: text, summary: "这是一个新生成的 mock 愿望卡。", todos: [
        { id: `todo-${Date.now()}-1`, text: "确认你真正想开始的版本", completed: false },
        { id: `todo-${Date.now()}-2`, text: "定下第一个可执行动作", completed: false },
        { id: `todo-${Date.now()}-3`, text: "给自己一个开始时间", completed: false },
      ] },
    ]);
  };

  const appendMomentCard = (text: string) => {
    setItems((current) => [
      ...current,
      { id: `user-${Date.now()}`, type: "user", text },
      { id: `ai-${Date.now() + 1}`, type: "ai", role: "star", name: "芽芽星", text: "这句更像一个被你轻轻说出来的念头，我先把它放进碎碎念卡里。" },
      { id: `moment-${Date.now() + 2}`, type: "moment", title: "碎碎念", text, editable: true, shared: false },
    ]);
  };

  const handleWishBubbleSelect = (text: string) => {
    onDraftChange(text);
    appendWishCard(text);
  };

  const finishVoiceInput = () => {
    const transcript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
    setVoiceText(transcript);
    window.setTimeout(() => {
      setVoiceOpen(false);
      setVoiceText("");
      if (transcript.includes("想")) {
        appendWishCard(transcript);
      } else {
        appendMomentCard(transcript);
      }
    }, 1200);
  };

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string }>).detail;
      if (detail?.text) handleWishBubbleSelect(detail.text);
    };
    window.addEventListener("wish-bubble-select", listener as EventListener);
    return () => window.removeEventListener("wish-bubble-select", listener as EventListener);
  }, []);

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--background)" }}>
      <div className="px-4 pb-3 pt-1">
        <button
          onClick={() => openRoleCard("moon")}
          className="w-full rounded-full px-3 py-2 flex items-center justify-center gap-2"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {ROLE_BAR.map(({ role, name }) => (
            <div key={role} className="flex items-center gap-1.5 rounded-full px-2 py-1" style={{ background: "var(--secondary)" }}>
              <img src={getCharacterAvatar(role)} alt={name} className="w-7 h-7 rounded-full object-cover" />
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{name}</span>
            </div>
          ))}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => {
          if (item.type === "user") {
            return (
              <div key={item.id} className="flex justify-end">
                <div className="max-w-[78%] rounded-[20px] rounded-tr-[8px] px-4 py-3 text-sm" style={{ background: "var(--primary)", color: "var(--background)" }}>
                  {item.text}
                </div>
              </div>
            );
          }

          if (item.type === "ai") {
            return (
              <div key={item.id} className="flex gap-2.5">
                <img src={getCharacterAvatar(item.role)} alt={item.name} className="w-9 h-9 rounded-full object-cover mt-1" />
                <div className="max-w-[78%] rounded-[20px] rounded-tl-[8px] px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--primary)" }}>{item.name}</div>
                  <div className="text-sm leading-6" style={{ color: "var(--foreground)" }}>{item.text}</div>
                </div>
              </div>
            );
          }

          if (item.type === "wish") {
            const completedCount = item.todos.filter((todo) => todo.completed).length;
            return (
              <div key={item.id} className="rounded-[24px] p-4" style={{ background: "linear-gradient(135deg, oklch(var(--primary-lch) / 12%), oklch(var(--accent-lch) / 10%))", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-xs mb-1" style={{ color: "var(--primary)" }}>愿望卡片</div>
                    <div className="text-sm font-semibold leading-6" style={{ color: "var(--foreground)" }}>{item.title}</div>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "var(--card)", color: "var(--muted-foreground)" }}>{progressText}</span>
                </div>
                <p className="text-xs leading-5 mb-3" style={{ color: "var(--muted-foreground)" }}>{item.summary}</p>
                <div className="space-y-2.5">
                  {item.todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-2.5 text-sm" style={{ color: todo.completed ? "var(--muted-foreground)" : "var(--foreground)" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" style={{ background: todo.completed ? "var(--primary)" : "var(--card)", border: todo.completed ? "none" : "1px solid var(--border)", color: todo.completed ? "var(--background)" : "var(--muted-foreground)" }}>{todo.completed ? "✓" : ""}</span>
                      <span>{todo.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{completedCount}/{item.todos.length} 已准备</div>
              </div>
            );
          }

          return (
            <div key={item.id} className="rounded-[24px] p-4" style={{ background: "linear-gradient(135deg, rgba(167,139,250,.14), rgba(244,114,182,.08))", border: "1px solid rgba(167,139,250,.25)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs" style={{ color: "#8b5cf6" }}>{item.title}</div>
                {item.shared ? <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,.6)", color: "#8b5cf6" }}>已分享</span> : item.editable ? <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,.6)", color: "#8b5cf6" }}>可编辑</span> : null}
              </div>
              <p className="text-sm leading-6" style={{ color: "var(--foreground)" }}>{item.text}</p>
            </div>
          );
        })}
      </div>

      <RoleCardSheet open={showRoleCard} initialRole={roleCardRole} onClose={() => setShowRoleCard(false)} />

      <AnimatePresence>
        {voiceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[65] flex items-end"
            style={{ background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,.26) 45%, rgba(10,10,10,.45) 100%)" }}
            onClick={() => setVoiceOpen(false)}
          >
            <motion.div
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              exit={{ y: 220 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="w-full rounded-t-[36px] px-6 pt-6 pb-8"
              style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-5 h-1.5 w-14 rounded-full" style={{ background: "var(--border)" }} />
              <div className="text-center mb-5">
                <div className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>把这一刻说给许愿池听</div>
                <div className="text-xs leading-5" style={{ color: "var(--muted-foreground)" }}>{voiceText || "你可以说一个想开始的小愿望，或者只是随口的碎碎念。"}</div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-6">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <motion.div key={bar} className="w-2 rounded-full" style={{ background: "var(--primary)" }} animate={{ height: [18, 34, 20, 42, 18] }} transition={{ duration: 1.1, repeat: Infinity, delay: bar * 0.08 }} />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setVoiceOpen(false)} className="flex-1 rounded-2xl py-3 text-sm" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>取消</button>
                <button onClick={finishVoiceInput} className="flex-1 rounded-2xl py-3 text-sm font-semibold" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "var(--background)" }}>完成输入</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
