/**
 * Wishpool V4 Demo
 *
 * 演示流程：
 * splash → home（广场）→ chat（默认三角色群聊）
 * 群聊内支持：角色卡片 / 发愿气泡 / 语音输入 / 愿望与碎碎念卡片
 * 底部导航保留：广场 / 许愿 / 我的愿望
 */

import { useEffect, useMemo, useState } from "react";
import { PhoneDemoShell } from "@/components/demo/PhoneDemoShell";
import { demoPageVariants } from "@/features/demo-flow/motion";
import { type CharacterType } from "@/features/demo-flow/types";
import { useDemoFlow } from "@/features/demo-flow/useDemoFlow";
import { MainTabScreen } from "@/features/demo-flow/screens";
import { CharacterContext, SplashScreen } from "@/features/demo-flow/shared";
import { DEFAULT_SCENARIO, WISH_SCENARIOS } from "@/features/demo-flow/data";

export default function WishpoolDemo() {
  const [character, setCharacter] = useState<CharacterType>(() => {
    const stored = localStorage.getItem("wishpool_character");
    return (stored === "moon" || stored === "cloud" || stored === "star") ? stored : "moon";
  });

  // Persist character choice
  useEffect(() => {
    localStorage.setItem("wishpool_character", character);
  }, [character]);
  const {
    currentScreen,
    direction,
    scenarioId,
    glowCircleMode,
    navigate,
    resolveScenarioFlow,
    setGlowCircleMode,
  } = useDemoFlow("splash", DEFAULT_SCENARIO.id);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", character);
  }, [character]);

  const activeScenario = useMemo(() => WISH_SCENARIOS[scenarioId] || DEFAULT_SCENARIO, [scenarioId]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onNext={() => navigate("home", "forward")} />;
      case "home":
      case "chat":
      case "wishes":
        return (
          <MainTabScreen
            currentScreen={currentScreen}
            scenario={activeScenario}
            onNavigate={navigate}
            onScenarioChange={(nextScenarioId) => resolveScenarioFlow(nextScenarioId, "chat")}
            glowCircleMode={glowCircleMode}
            onGlowCircleModeChange={setGlowCircleMode}
          />
        );
      case "paywall":
      case "ai-plan":
      case "round-update":
      case "deep-research":
      case "collab-prep":
      case "fulfillment":
      case "feedback":
      default:
        return (
          <MainTabScreen
            currentScreen="home"
            scenario={activeScenario}
            onNavigate={navigate}
            onScenarioChange={(nextScenarioId) => resolveScenarioFlow(nextScenarioId, "chat")}
          />
        );
    }
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      <PhoneDemoShell
        currentScreen={currentScreen}
        direction={direction}
        pageVariants={demoPageVariants}
      >
        {renderScreen()}
      </PhoneDemoShell>
    </CharacterContext.Provider>
  );
}
