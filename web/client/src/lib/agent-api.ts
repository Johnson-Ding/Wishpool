import {
  createWishpoolAgentApi,
  generateAIPlan,
  mapIntentToScenario,
  chatWithAI,
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

export { generateAIPlan, mapIntentToScenario, chatWithAI };
export type {
  AgentResponse,
  ExecutionPlan,
  GeneratedPlan,
  WishAnalysis,
  ChatMessage,
  ChatAPIResponse,
} from "../../../../shared/wishpool-access/agent-api";
