/**
 * Wishpool V2.0 — 许愿池产品演示
 * 设计方向：「许愿漂流瓶 · AI执行搭子」
 *
 * 演示流程 (V2 PRD)：
 * splash → home（漂流瓶 Tinder 滑动）→ paywall（非会员付费墙）
 * → 语音输入 → 场景匹配分支：
 *   ├─ 关键词命中 → ai-plan（AI直出方案 US-01）
 *   └─ 未命中（分享类）→ 半屏聊天澄清 → ai-plan
 * → round-update（轮次进展 US-02）→ deep-research（深度调研 US-04）
 * → collab-prep（协同筹备+支付 US-05）→ fulfillment（活动履约 US-06）
 * → feedback（反馈+评价+故事卡）→ home（回首页闭环）
 */

import { useEffect, useMemo, useState } from "react";
import { PhoneDemoShell } from "@/components/demo/PhoneDemoShell";
import { demoPageVariants } from "@/features/demo-flow/motion";
import { type CharacterType } from "@/features/demo-flow/types";
import { useDemoFlow } from "@/features/demo-flow/useDemoFlow";
import {
  AiPlanScreen,
  CollabPrepScreen,
  DeepResearchScreen,
  FeedbackScreen,
  FulfillmentScreen,
  MainTabScreen,
  PaywallScreen,
  RoundUpdateScreen,
  WishDetailScreen,
} from "@/features/demo-flow/screens";
import type { WishDetailData } from "@/features/demo-flow/screens";
import { CharacterContext, SplashScreen } from "@/features/demo-flow/shared";
import { DEFAULT_SCENARIO, WISH_SCENARIOS } from "@/features/demo-flow/data";
import type { GeneratedPlan } from "@/lib/agent-api";

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
    wishInput,
    userState,
    navigate,
    goNext,
    goBack,
    startScenarioFlow,
    setWishInput,
    resolveScenarioFlow,
    joinMember,
    cancelMember,
  } = useDemoFlow("splash", DEFAULT_SCENARIO.id);
  const [selectedWish, setSelectedWish] = useState<WishDetailData | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", character);
  }, [character]);

  const activeScenario = useMemo(() => WISH_SCENARIOS[scenarioId] || DEFAULT_SCENARIO, [scenarioId]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onNext={() => goNext()} />;
      case "home":
        return (
          <MainTabScreen
            isMember={userState.memberStatus === "active"}
            wishInput={wishInput}
            scenario={activeScenario}
            onWishInputChange={setWishInput}
            onDirectWish={(nextScenarioId, plan) => {
              if (userState.memberStatus !== "active") {
                navigate("paywall", "forward");
                return;
              }
              setGeneratedPlan(plan || null);
              resolveScenarioFlow(nextScenarioId, "ai-plan");
            }}
            onClarifyComplete={(nextScenarioId, plan) => {
              if (userState.memberStatus !== "active") {
                navigate("paywall", "forward");
                return;
              }
              setGeneratedPlan(plan || null);
              resolveScenarioFlow(nextScenarioId, "ai-plan");
            }}
            onDoSameClick={(bottleId) => {
              if (userState.memberStatus !== "active") {
                navigate("paywall", "forward");
                return;
              }
              startScenarioFlow(bottleId in WISH_SCENARIOS ? bottleId : DEFAULT_SCENARIO.id, "ai-plan");
            }}
            onNeedPaywall={() => navigate("paywall", "forward")}
            onOpenWish={(wish) => {
              setSelectedWish(wish);
              navigate("wish-detail", "forward");
            }}
          />
        );
      case "wish-detail":
        return selectedWish ? (
          <WishDetailScreen
            wish={selectedWish}
            scenario={WISH_SCENARIOS[selectedWish.scenarioId] || DEFAULT_SCENARIO}
            onBack={() => {
              setSelectedWish(null);
              navigate("home", "back");
            }}
            onGoToPlan={(nextScenarioId) => {
              if (userState.memberStatus !== "active") {
                navigate("paywall", "forward");
                return;
              }
              resolveScenarioFlow(nextScenarioId, "ai-plan");
            }}
          />
        ) : null;
      case "paywall":
        return (
          <PaywallScreen
            onJoin={() => {
              joinMember();
              navigate("home", "back");
            }}
            onBack={() => navigate("home", "back")}
          />
        );
      case "ai-plan":
        return (
          <AiPlanScreen
            scenario={activeScenario}
            generatedPlan={generatedPlan}
            onNext={() => goNext()}
            onBack={() => goBack()}
          />
        );
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
        pageVariants={demoPageVariants}
      >
        {renderScreen()}
      </PhoneDemoShell>
    </CharacterContext.Provider>
  );
}
