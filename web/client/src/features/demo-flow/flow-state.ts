import { DEFAULT_SCENARIO } from "./data";
import { getNextDemoScreen, getPreviousDemoScreen } from "./navigation";
import type { DemoScreen } from "./types";
import type { UserState } from "../../domains/user/types";

export type DemoFlowDirection = "forward" | "back";

export type DemoFlowState = {
  currentScreen: DemoScreen;
  direction: DemoFlowDirection;
  scenarioId: number;
  wishInput: string;
  userState: UserState;
};

export function createDemoFlowState(
  initialScreen: DemoScreen = "splash",
  initialScenarioId: number = DEFAULT_SCENARIO.id,
): DemoFlowState {
  return {
    currentScreen: initialScreen,
    direction: "forward",
    scenarioId: initialScenarioId,
    wishInput: "",
    userState: { accountStatus: "authenticated", memberStatus: "free" },
  };
}

export function navigateDemoFlow(
  state: DemoFlowState,
  screen: DemoScreen,
  direction: DemoFlowDirection = "forward",
): DemoFlowState {
  return {
    ...state,
    currentScreen: screen,
    direction,
  };
}

export function advanceDemoFlow(state: DemoFlowState): DemoFlowState {
  return navigateDemoFlow(state, getNextDemoScreen(state.currentScreen), "forward");
}

export function retreatDemoFlow(state: DemoFlowState): DemoFlowState {
  return navigateDemoFlow(state, getPreviousDemoScreen(state.currentScreen), "back");
}

export function startScenarioDemoFlow(
  state: DemoFlowState,
  scenarioId: number,
  screen: DemoScreen = "ai-plan",
): DemoFlowState {
  return {
    ...state,
    currentScreen: screen,
    direction: "forward",
    scenarioId,
  };
}

export function updateWishInput(state: DemoFlowState, wishInput: string): DemoFlowState {
  return {
    ...state,
    wishInput,
  };
}

export function resolveScenarioDemoFlow(
  state: DemoFlowState,
  scenarioId: number,
  screen: DemoScreen = "ai-plan",
): DemoFlowState {
  return {
    ...state,
    currentScreen: screen,
    direction: "forward",
    scenarioId,
  };
}

export function upgradeMember(state: DemoFlowState): DemoFlowState {
  return { ...state, userState: { ...state.userState, memberStatus: "active" } };
}
export function cancelMember(state: DemoFlowState): DemoFlowState {
  return { ...state, userState: { ...state.userState, memberStatus: "canceled" } };
}
