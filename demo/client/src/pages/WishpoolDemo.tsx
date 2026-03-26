/**
 * Wishpool V2.0 — 许愿池产品演示
 * 设计方向：「许愿漂流瓶 · AI执行搭子」
 *
 * 演示流程 (V2 PRD)：
 * splash → home（漂流瓶 Tinder 滑动）→ paywall（非会员付费墙）
 * → chat（AI对话发愿 US-03B）→ ai-plan（AI直出方案 US-01）
 * → round-update（轮次进展 US-02）→ deep-research（深度调研 US-04）
 * → collab-prep（协同筹备+支付 US-05）→ fulfillment（活动履约 US-06）
 * → feedback（反馈+评价+故事卡）→ home（回首页闭环）
 */

import { useEffect, useMemo, useState } from "react";
import { PhoneDemoShell } from "@/components/demo/PhoneDemoShell";
import { demoPageVariants } from "@/features/demo-flow/motion";
import { type CharacterType, type DemoScreen } from "@/features/demo-flow/types";
import { useDemoFlow } from "@/features/demo-flow/useDemoFlow";
import { matchScenarioByWishInput } from "@/features/demo-flow/scenario-matcher";
import {
  AiPlanScreen,
  ChatScreen,
  CollabPrepScreen,
  DeepResearchScreen,
  FeedbackScreen,
  FulfillmentScreen,
  MainTabScreen,
  PaywallScreen,
  RoundUpdateScreen,
} from "@/features/demo-flow/screens";
import { CharacterContext, SplashScreen } from "@/features/demo-flow/shared";
import { DEFAULT_SCENARIO, WISH_SCENARIOS } from "@/features/demo-flow/data";

export default function WishpoolDemo() {
  const [character, setCharacter] = useState<CharacterType>("moon");
  const {
    currentScreen,
    direction,
    scenarioId,
    wishInput,
    navigate,
    goNext,
    goBack,
    startScenarioFlow,
    setWishInput,
    resolveScenarioFlow,
    screenLabel,
  } = useDemoFlow("splash", DEFAULT_SCENARIO.id);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", character);
  }, [character]);

  const activeScenario = useMemo(() => WISH_SCENARIOS[scenarioId] || DEFAULT_SCENARIO, [scenarioId]);

  const handleWishSubmit = () => {
    const nextScenarioId = matchScenarioByWishInput(wishInput);
    resolveScenarioFlow(nextScenarioId, "ai-plan");
  };

  const renderScreen = () => {
    switch (currentScreen as DemoScreen) {
      case "splash":
        return <SplashScreen onNext={() => goNext()} />;
      case "home":
        return (
          <MainTabScreen
            isMember={isMember}
            onWishClick={() => {
              setWishInput("");
              if (!isMember) navigate("paywall", "forward");
              else navigate("chat", "forward");
            }}
            onDoSameClick={(bottleId) => {
              startScenarioFlow(bottleId in WISH_SCENARIOS ? bottleId : DEFAULT_SCENARIO.id, "ai-plan");
            }}
          />
        );
      case "paywall":
        return (
          <PaywallScreen
            onJoin={() => {
              setIsMember(true);
              navigate("chat", "forward");
            }}
            onBack={() => navigate("home", "back")}
          />
        );
      case "chat":
        return (
          <ChatScreen
            scenario={activeScenario}
            wishInput={wishInput}
            onWishInputChange={setWishInput}
            onSubmitWish={handleWishSubmit}
            onBack={() => goBack()}
          />
        );
      case "ai-plan":
        return <AiPlanScreen scenario={activeScenario} onNext={() => goNext()} onBack={() => goBack()} />;
      case "round-update":
        return <RoundUpdateScreen scenario={activeScenario} onNext={() => goNext()} onBack={() => goBack()} />;
      case "deep-research":
        return <DeepResearchScreen scenario={activeScenario} onNext={() => goNext()} onBack={() => goBack()} />;
      case "collab-prep":
        return <CollabPrepScreen scenario={activeScenario} onNext={() => goNext()} onBack={() => goBack()} />;
      case "fulfillment":
        return <FulfillmentScreen scenario={activeScenario} onNext={() => goNext()} onBack={() => goBack()} />;
      case "feedback":
        return <FeedbackScreen scenario={activeScenario} onNext={() => navigate("home", "back")} onBack={() => goBack()} />;
    }
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      <PhoneDemoShell
        currentScreen={currentScreen}
        direction={direction}
        onNavigate={navigate}
        pageVariants={demoPageVariants}
        screenLabel={screenLabel}
      >
        {renderScreen()}
      </PhoneDemoShell>
    </CharacterContext.Provider>
  );
}
