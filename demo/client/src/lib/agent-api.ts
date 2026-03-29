import {
  createWishpoolAgentApi,
  generateAIPlan,
  mapIntentToScenario,
} from "../../../../shared/wishpool-access/agent-api";
import { supabase } from "./supabase";

const wishpoolAgentApi = createWishpoolAgentApi(supabase);

export const {
  analyzeWish,
  generateExecutionPlan,
  executeStep,
  intelligentScenarioMatch,
  getUserAgentHistory,
} = wishpoolAgentApi;

export { generateAIPlan, mapIntentToScenario };
export type {
  AgentResponse,
  ExecutionPlan,
  GeneratedPlan,
  WishAnalysis,
} from "../../../../shared/wishpool-access/agent-api";
