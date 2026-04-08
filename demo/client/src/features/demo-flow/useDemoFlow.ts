import { useMemo, useState } from "react";
import type { WishExecutionStatus } from "@/domains/wishflow/types";
import { DEFAULT_SCENARIO } from "./data";
import {
  advanceDemoFlow,
  createDemoFlowState,
  navigateDemoFlow,
  resolveScenarioDemoFlow,
  retreatDemoFlow,
  startScenarioDemoFlow,
  updateWishInput,
  upgradeMember,
  cancelMember,
  setGlowCircleMode,
} from "./flow-state";
import { getDemoScreenLabel, getWishExecutionStatusFromScreen } from "./navigation";
import type { DemoScreen } from "./types";

export function useDemoFlow(
  initialScreen: DemoScreen = "splash",
  initialScenarioId: number = DEFAULT_SCENARIO.id,
) {
  const [state, setState] = useState(() => createDemoFlowState(initialScreen, initialScenarioId));
  const { currentScreen, direction, scenarioId, wishInput, userState } = state;

  const businessStatus = useMemo<WishExecutionStatus | null>(() => {
    return getWishExecutionStatusFromScreen(currentScreen);
  }, [currentScreen]);

  const screenLabel = useMemo(() => getDemoScreenLabel(currentScreen), [currentScreen]);

  function navigate(screen: DemoScreen, nextDirection: "forward" | "back" = "forward") {
    setState((currentState) => navigateDemoFlow(currentState, screen, nextDirection));
  }

  function goNext() {
    setState((currentState) => advanceDemoFlow(currentState));
  }

  function goBack() {
    setState((currentState) => retreatDemoFlow(currentState));
  }

  function startScenarioFlow(nextScenarioId: number, screen: DemoScreen = "ai-plan") {
    setState((currentState) => startScenarioDemoFlow(currentState, nextScenarioId, screen));
  }

  function setWishInput(nextWishInput: string) {
    setState((currentState) => updateWishInput(currentState, nextWishInput));
  }

  function resolveScenarioFlow(nextScenarioId: number, screen: DemoScreen = "ai-plan") {
    setState((currentState) => resolveScenarioDemoFlow(currentState, nextScenarioId, screen));
  }

  function joinMember() {
    setState((s) => upgradeMember(s));
  }

  function leaveMember() {
    setState((s) => cancelMember(s));
  }

  function updateGlowCircleMode(mode: "flow" | "wish" | "murmur") {
    setState((currentState) => setGlowCircleMode(currentState, mode));
  }

  return {
    businessStatus,
    currentScreen,
    direction,
    scenarioId,
    wishInput,
    userState,
    glowCircleMode: state.glowCircleMode,
    navigate,
    goNext,
    goBack,
    startScenarioFlow,
    setWishInput,
    resolveScenarioFlow,
    joinMember,
    leaveMember,
    screenLabel,
    setGlowCircleMode: updateGlowCircleMode,
  };
}
