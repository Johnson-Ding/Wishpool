import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar } from "../shared";
import { HomeScreen } from "./HomeScreen";
import { MyWishesTab } from "./MyWishesTab";
import type { WishScenario } from "../data";
import type { DemoScreen } from "../types";
import { GlowCircle } from "@/components/product/GlowCircle";
import { DEFAULT_WISH_OPTIONS, DEFAULT_MURMUR_OPTIONS } from "@/features/wish-bubble/wish-bubble-data";
import { useWishBubble } from "@/features/wish-bubble/WishBubbleContext";
import { WishBubble } from "@/features/wish-bubble/WishBubble";
import { ChatDetailScreen } from "./ChatDetailScreen";

interface MainTabScreenProps {
  currentScreen: DemoScreen;
  scenario: WishScenario;
  onNavigate: (screen: DemoScreen, nextDirection?: "forward" | "back") => void;
  onScenarioChange: (scenarioId: number) => void;
  glowCircleMode: "flow" | "wish" | "murmur";
  onGlowCircleModeChange: (mode: "flow" | "wish" | "murmur") => void;
}

export function MainTabScreen({ currentScreen, scenario, onNavigate, onScenarioChange, glowCircleMode, onGlowCircleModeChange }: MainTabScreenProps) {
  const { showBubble, hideBubble, isVisible } = useWishBubble();
  const [openVoiceAfterEnter, setOpenVoiceAfterEnter] = useState(false);
  const [chatDraft, setChatDraft] = useState("");

  const activeTab = useMemo<"square" | "chat" | "wishes">(() => {
    if (currentScreen === "chat") return "chat";
    if (currentScreen === "wishes") return "wishes";
    return "square";
  }, [currentScreen]);

  const goHome = () => {
    hideBubble();
    setOpenVoiceAfterEnter(false);
    onNavigate("home", "back");
  };

  const goChat = (withVoice = false) => {
    setOpenVoiceAfterEnter(withVoice);
    onNavigate("chat", "forward");
  };

  const goWishes = () => {
    hideBubble();
    setOpenVoiceAfterEnter(false);
    onNavigate("wishes", "forward");
  };

  const handleGlowClick = () => {
    if (activeTab === "chat") {
      if (glowCircleMode === "flow") {
        // 状态 A: 显示双列气泡
        showBubble(DEFAULT_WISH_OPTIONS, DEFAULT_MURMUR_OPTIONS, "dual");
      } else if (glowCircleMode === "wish") {
        // 状态 B: 直接生成愿望卡片
        const wishText = DEFAULT_WISH_OPTIONS[0]; // 使用第一个推荐
        window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "wish", text: wishText } }));
        onGlowCircleModeChange("flow"); // 立即恢复状态 A
        hideBubble();
      } else if (glowCircleMode === "murmur") {
        // 状态 C: 直接生成碎碎念卡片
        const murmurText = DEFAULT_MURMUR_OPTIONS[0]; // 使用第一个推荐
        window.dispatchEvent(new CustomEvent("glow-mode-action", { detail: { type: "murmur", text: murmurText } }));
        onGlowCircleModeChange("flow"); // 立即恢复状态 A
        hideBubble();
      }
      return;
    }
    goChat(false);
  };

  const handleGlowLongPress = () => {
    if (activeTab === "chat") {
      // 聊天页长按：直接打开语音输入
      window.dispatchEvent(new CustomEvent("open-voice-input"));
      return;
    }
    // 首页长按：先进入聊天页，然后打开语音输入
    goChat(true);
  };

  return (
    <div className="flex h-full flex-col relative" style={{ background: "var(--background)" }}>
      <StatusBar />

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "square" && (
          <HomeScreen
            isMember
            onWishClick={() => goChat(false)}
            onDoSameClick={(bottleId) => {
              onScenarioChange(bottleId);
              goChat(false);
            }}
            tabMode
          />
        )}

        {activeTab === "chat" && (
          <ChatDetailScreen
            scenario={scenario}
            draft={chatDraft}
            onDraftChange={setChatDraft}
            onScenarioChange={onScenarioChange}
            openVoiceAfterEnter={openVoiceAfterEnter}
            onVoiceHandled={() => setOpenVoiceAfterEnter(false)}
            glowCircleMode={glowCircleMode}
            onGlowCircleModeChange={onGlowCircleModeChange}
          />
        )}

        {activeTab === "wishes" && (
          <MyWishesTab
            onResumeWish={(scenarioId) => {
              onScenarioChange(scenarioId);
              onNavigate("chat", "back");
            }}
          />
        )}
      </div>

      {activeTab === "chat" && (
        <div className="px-4 pb-3 pt-2" style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
          <div
            className="flex items-center gap-2 rounded-[22px] px-3 py-2.5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h4l2-2h4l2 2h4v12H4z" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </button>
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="写下此刻的小愿望或碎碎念..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.63 2.65a2 2 0 0 1-.45 2.11L8 9.99a16 16 0 0 0 6 6l1.51-1.29a2 2 0 0 1 2.11-.45c.86.3 1.75.51 2.65.63A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className="relative flex items-end justify-around px-4 pb-5 pt-2"
        style={{ background: "var(--background)", borderTop: activeTab === "chat" ? "none" : "1px solid var(--border)" }}
      >
        <button onClick={goHome} className="flex flex-col items-center gap-1 py-1 px-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-xs" style={{ color: activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)", fontWeight: activeTab === "square" ? 600 : 400 }}>广场</span>
        </button>

        <div className="relative flex flex-col items-center">
          <GlowCircle
            variant={activeTab === "chat" ? "bar" : "circle"}
            mode={glowCircleMode}
            onClick={handleGlowClick}
            onLongPress={handleGlowLongPress}
          />
          {activeTab === "chat" && isVisible && (
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50">
              <WishBubble />
            </div>
          )}
        </div>

        <button onClick={goWishes} className="flex flex-col items-center gap-1 py-1 px-4 relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-xs" style={{ color: activeTab === "wishes" ? "var(--primary)" : "var(--muted-foreground)", fontWeight: activeTab === "wishes" ? 600 : 400 }}>我的</span>
        </button>
      </div>
    </div>
  );
}
