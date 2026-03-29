import { useRef, useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StatusBar, CharacterContext, getCharacterAvatar } from "../shared";
import { HomeScreen } from "./HomeScreen";
import { MyWishesTab } from "./MyWishesTab";
import { ChatSheet } from "./ChatScreen";
import { matchScenarioByWishInput } from "../scenario-matcher";
import { useFeedData } from "../useFeedData";
import { createWish } from "@/lib/api";
import { ThemeSelector } from "@/components/ThemeSelector";
import type { WishScenario } from "../data";
import type { WishDetailData } from "./WishDetailScreen";
import type { GeneratedPlan } from "@/lib/agent-api";

type TabId = "wishes" | "square" | "hot" | "follow";

interface MainTabScreenProps {
  isMember: boolean;
  wishInput: string;
  scenario: WishScenario;
  onWishInputChange: (value: string) => void;
  onDirectWish: (scenarioId: number, plan?: GeneratedPlan) => void;
  onClarifyComplete: (scenarioId: number, plan?: GeneratedPlan) => void;
  onDoSameClick: (bottleId: number) => void;
  onNeedPaywall: () => void;
  onOpenWish?: (wish: WishDetailData) => void;
}

export function MainTabScreen({ isMember, wishInput, scenario, onWishInputChange, onDirectWish, onClarifyComplete, onDoSameClick, onNeedPaywall, onOpenWish }: MainTabScreenProps) {
  const { bottles, doLike, doComment } = useFeedData();
  const { character } = useContext(CharacterContext);
  const [activeTab, setActiveTab] = useState<TabId>("wishes");
  const [showPublisher, setShowPublisher] = useState(false);
  const [publisherInput, setPublisherInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showChatSheet, setShowChatSheet] = useState(false);
  const [pendingScenarioId, setPendingScenarioId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [bottomWishInput, setBottomWishInput] = useState("");

  const pendingCount = 2; // mock badge count

  // 模拟逐字转写
  const MOCK_TRANSCRIPT = "我想去海边放松一下";
  const transcriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTranscribing = () => {
    setIsRecording(true);
    setPublisherInput("");
    let charIndex = 0;
    const tick = () => {
      if (charIndex < MOCK_TRANSCRIPT.length) {
        charIndex++;
        setPublisherInput(MOCK_TRANSCRIPT.slice(0, charIndex));
        transcriptTimer.current = setTimeout(tick, 120 + Math.random() * 80);
      } else {
        setIsRecording(false);
      }
    };
    transcriptTimer.current = setTimeout(tick, 600);
  };

  const openPublisher = () => {
    if (!isMember) {
      onNeedPaywall();
      return;
    }
    setShowPublisher(true);
    startTranscribing();
  };

  const handleBottomWishSubmit = async (input: string) => {
    if (!input.trim()) return;

    if (!isMember) {
      onNeedPaywall();
      return;
    }

    onWishInputChange(input.trim());
    setBottomWishInput("");

    // 写入 Supabase（fire-and-forget，不阻塞 Demo 流程）
    createWish({ intent: input.trim(), rawInput: input.trim() }).catch(() => {});

    // AI智能场景匹配
    setIsAnalyzing(true);

    try {
      const { scenarioId, needsClarification, analysis, confidence, generatedPlan } = await matchScenarioByWishInput(input.trim());

      console.log('🤖 AI分析结果:', { scenarioId, needsClarification, analysis, confidence, generatedPlan });

      if (needsClarification) {
        // AI分析需要澄清 → 弹半屏聊天澄清
        setPendingScenarioId(scenarioId);
        setShowChatSheet(true);
      } else {
        // AI分析成功 → 直接进 ai-plan
        if (generatedPlan) {
          // 有动态生成方案，直接使用
          onDirectWish(scenarioId, generatedPlan);
        } else {
          // 没有动态方案，使用传统静态方案
          onDirectWish(scenarioId);
        }
      }
    } catch (error) {
      console.error('AI场景匹配失败:', error);
      // 降级处理：使用默认场景
      setPendingScenarioId(2);
      setShowChatSheet(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublisherSubmit = async () => {
    if (transcriptTimer.current) {
      clearTimeout(transcriptTimer.current);
      transcriptTimer.current = null;
    }
    setIsRecording(false);
    setShowPublisher(false);

    const input = publisherInput.trim();
    onWishInputChange(input);
    setPublisherInput("");

    // 写入 Supabase（fire-and-forget，不阻塞 Demo 流程）
    createWish({ intent: input, rawInput: input }).catch(() => {});

    // AI智能场景匹配
    setIsAnalyzing(true);

    try {
      const { scenarioId, needsClarification, analysis, confidence, generatedPlan } = await matchScenarioByWishInput(input);

      console.log('🤖 AI分析结果:', { scenarioId, needsClarification, analysis, confidence, generatedPlan });

      if (needsClarification) {
        // AI分析需要澄清 → 弹半屏聊天澄清
        setPendingScenarioId(scenarioId);
        setShowChatSheet(true);
      } else {
        // AI分析成功 → 直接进 ai-plan
        if (generatedPlan) {
          // 有动态生成方案，直接使用
          onDirectWish(scenarioId, generatedPlan);
        } else {
          // 没有动态方案，使用传统静态方案
          onDirectWish(scenarioId);
        }
      }
    } catch (error) {
      console.error('AI场景匹配失败:', error);
      // 降级处理：使用默认场景
      setPendingScenarioId(2);
      setShowChatSheet(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClosePublisher = () => {
    if (transcriptTimer.current) {
      clearTimeout(transcriptTimer.current);
      transcriptTimer.current = null;
    }
    setIsRecording(false);
    setShowPublisher(false);
    setPublisherInput("");
  };

  const handleChatSheetComplete = () => {
    setShowChatSheet(false);
    onClarifyComplete(pendingScenarioId!); // 澄清后暂时用静态方案
    setPendingScenarioId(null);
  };

  const handleChatSheetClose = () => {
    setShowChatSheet(false);
    setPendingScenarioId(null);
  };

  return (
    <div className="flex flex-col h-full relative">
      <StatusBar />

      {/* ── Header with avatar and theme selector ── */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Character avatar */}
        <div className="flex items-center gap-3">
          <img
            src={getCharacterAvatar(character)}
            alt="Character avatar"
            className="w-10 h-10 rounded-full"
            style={{
              filter: "drop-shadow(0 2px 8px var(--ring))",
            }}
          />
        </div>

        {/* Right: Theme selector button */}
        <button
          onClick={() => setShowThemeSelector(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: "var(--secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>

      {/* ── Top Tab bar ── */}
      <div className="flex items-center px-6 py-2">
        {/* Left: 我的 */}
        <button
          onClick={() => setActiveTab("wishes")}
          className="flex items-center px-4 py-2 rounded-lg mr-6"
          style={{
            background: activeTab === "wishes" ? "var(--primary)" : "transparent",
            color: activeTab === "wishes" ? "var(--background)" : "var(--foreground)",
          }}
        >
          <span className="text-sm font-medium">我的</span>
          {pendingCount > 0 && (
            <span
              className="ml-2 w-5 h-5 rounded-full flex items-center justify-center font-bold"
              style={{
                background: activeTab === "wishes" ? "var(--background)" : "var(--destructive)",
                color: activeTab === "wishes" ? "var(--primary)" : "var(--destructive-foreground)",
                fontSize: "10px",
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        {/* Right: Tab group */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("square")}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              background: activeTab === "square" ? "var(--secondary)" : "transparent",
              color: activeTab === "square" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            广场
          </button>
          <button
            onClick={() => setActiveTab("hot")}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              background: activeTab === "hot" ? "var(--secondary)" : "transparent",
              color: activeTab === "hot" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            热门
          </button>
          <button
            onClick={() => setActiveTab("follow")}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              background: activeTab === "follow" ? "var(--secondary)" : "transparent",
              color: activeTab === "follow" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            关注
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "wishes" && <MyWishesTab onOpenWish={onOpenWish} />}
        {activeTab === "square" && (
          <HomeScreen
            isMember={isMember}
            onWishClick={() => setBottomWishInput("")} // 不再弹出录音，而是聚焦底部输入框
            onDoSameClick={onDoSameClick}
            bottles={bottles}
            onApiLike={doLike}
            onApiComment={doComment}
            tabMode
          />
        )}
        {activeTab === "hot" && (
          <HomeScreen
            isMember={isMember}
            onWishClick={() => setBottomWishInput("")}
            onDoSameClick={onDoSameClick}
            bottles={bottles}
            onApiLike={doLike}
            onApiComment={doComment}
            tabMode
          />
        )}
        {activeTab === "follow" && (
          <HomeScreen
            isMember={isMember}
            onWishClick={() => setBottomWishInput("")}
            onDoSameClick={onDoSameClick}
            bottles={bottles}
            onApiLike={doLike}
            onApiComment={doComment}
            tabMode
          />
        )}
      </div>

      {/* ── Bottom wish input ── */}
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{
          background: "var(--background)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={bottomWishInput}
            onChange={(e) => setBottomWishInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && bottomWishInput.trim()) {
                handleBottomWishSubmit(bottomWishInput);
              }
            }}
            placeholder="输入你的心愿..."
            disabled={isAnalyzing}
            className="w-full px-4 py-3 rounded-full text-sm outline-none"
            style={{
              background: "var(--secondary)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          />
          {isAnalyzing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="animate-spin text-lg">🤖</span>
            </div>
          )}
        </div>
        <button
          onClick={() => handleBottomWishSubmit(bottomWishInput)}
          disabled={!bottomWishInput.trim() || isAnalyzing}
          className="flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: (bottomWishInput.trim() && !isAnalyzing)
              ? "linear-gradient(135deg, var(--primary), var(--accent))"
              : "var(--secondary)",
            opacity: (bottomWishInput.trim() && !isAnalyzing) ? 1 : 0.5,
            cursor: (bottomWishInput.trim() && !isAnalyzing) ? "pointer" : "not-allowed",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={(bottomWishInput.trim() && !isAnalyzing) ? "var(--background)" : "var(--muted-foreground)"}
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22,2 15,22 11,13 2,9"/>
          </svg>
        </button>
      </div>

      {/* ── Publisher panel overlay ── */}
      <AnimatePresence>
        {showPublisher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end"
            style={{ background: "oklch(0 0 0 / 45%)" }}
            onClick={handleClosePublisher}
          >
            <motion.div
              initial={{ y: 280 }}
              animate={{ y: 0 }}
              exit={{ y: 280 }}
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
                className="w-10 h-1 rounded-full mx-auto mb-4"
                style={{ background: "var(--border)" }}
              />

              {/* 录音状态指示 */}
              {isRecording && (
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full recording-pulse"
                    style={{ background: "var(--destructive)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--destructive)" }}
                  >
                    正在聆听...
                  </span>
                </div>
              )}

              {/* 转写内容区 */}
              <div className="glass-card rounded-2xl px-4 py-3 mb-4 min-h-[72px]">
                <textarea
                  value={publisherInput}
                  onChange={(e) => setPublisherInput(e.target.value)}
                  placeholder={isRecording ? "说出你的心愿…" : "我想要…"}
                  rows={2}
                  className="w-full bg-transparent text-sm outline-none resize-none"
                  style={{ color: "var(--foreground)" }}
                />
              </div>

              {/* 提交 */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePublisherSubmit}
                disabled={isAnalyzing || !publisherInput.trim()}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm"
                style={{
                  background: (publisherInput.trim() && !isAnalyzing)
                    ? "linear-gradient(135deg, var(--primary), var(--accent))"
                    : "var(--secondary)",
                  color: (publisherInput.trim() && !isAnalyzing)
                    ? "var(--background)"
                    : "var(--muted-foreground)",
                  opacity: isAnalyzing ? 0.7 : 1
                }}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🤖</span>
                    AI分析中...
                  </span>
                ) : (
                  "开始许愿"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat clarification sheet ── */}
      <AnimatePresence>
        {showChatSheet && (
          <ChatSheet
            scenario={scenario}
            wishInput={wishInput}
            onWishInputChange={onWishInputChange}
            onComplete={handleChatSheetComplete}
            onClose={handleChatSheetClose}
          />
        )}
      </AnimatePresence>

      {/* ── Theme selector ── */}
      <ThemeSelector
        open={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </div>
  );
}
