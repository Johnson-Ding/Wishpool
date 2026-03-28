import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../lib/http";
import type {
  ValidationRoundRecord,
  WishTaskRecord,
  WishesRepository,
} from "./service";

type AnonymousUserRow = {
  id: string;
  device_id: string;
  created_at: string;
};

type WishTaskRow = {
  id: string;
  anonymous_user_id: string;
  title: string;
  intent: string;
  status: WishTaskRecord["status"];
  city: string | null;
  budget: string | null;
  time_window: string | null;
  raw_input: string | null;
  ai_plan: Record<string, unknown>;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ValidationRoundRow = {
  id: string;
  wish_task_id: string;
  round_number: number;
  summary: string;
  human_check_passed: boolean | null;
  created_at: string;
};

function mapWishTask(row: WishTaskRow): WishTaskRecord {
  return {
    id: row.id,
    anonymousUserId: row.anonymous_user_id,
    title: row.title,
    intent: row.intent,
    status: row.status,
    city: row.city ?? undefined,
    budget: row.budget ?? undefined,
    timeWindow: row.time_window ?? undefined,
    rawInput: row.raw_input ?? undefined,
    aiPlan: row.ai_plan ?? {},
    confirmedAt: row.confirmed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapValidationRound(row: ValidationRoundRow): ValidationRoundRecord {
  return {
    id: row.id,
    wishTaskId: row.wish_task_id,
    roundNumber: row.round_number,
    summary: row.summary,
    humanCheckPassed: row.human_check_passed,
    createdAt: row.created_at,
  };
}

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new HttpError(500, "supabase_error", error.message);
  }
}

function requireData<T>(data: T | null, message: string): T {
  if (!data) {
    throw new HttpError(500, "supabase_empty_response", message);
  }

  return data;
}

export function createSupabaseWishesRepository(client: SupabaseClient): WishesRepository {
  return {
    async getOrCreateAnonymousUser(deviceId) {
      const existing = await client
        .from("anonymous_users")
        .select("id, device_id, created_at")
        .eq("device_id", deviceId)
        .maybeSingle<AnonymousUserRow>();

      assertNoError(existing.error);

      if (existing.data) {
        return { id: existing.data.id };
      }

      const inserted = await client
        .from("anonymous_users")
        .insert({ device_id: deviceId })
        .select("id, device_id, created_at")
        .single<AnonymousUserRow>();

      assertNoError(inserted.error);
      return { id: requireData(inserted.data, "创建匿名用户失败").id };
    },

    async listWishTasksByDeviceId(deviceId) {
      const anonymousUser = await client
        .from("anonymous_users")
        .select("id, device_id, created_at")
        .eq("device_id", deviceId)
        .maybeSingle<AnonymousUserRow>();

      assertNoError(anonymousUser.error);

      if (!anonymousUser.data) {
        return [];
      }

      const result = await client
        .from("wish_tasks")
        .select("*")
        .eq("anonymous_user_id", anonymousUser.data.id)
        .order("created_at", { ascending: false })
        .returns<WishTaskRow[]>();

      assertNoError(result.error);
      return (result.data ?? []).map(mapWishTask);
    },

    async createWishTask(input) {
      const inserted = await client
        .from("wish_tasks")
        .insert({
          anonymous_user_id: input.anonymousUserId,
          title: input.title,
          intent: input.intent,
          status: input.status,
          city: input.city ?? null,
          budget: input.budget ?? null,
          time_window: input.timeWindow ?? null,
          raw_input: input.rawInput ?? null,
          ai_plan: input.aiPlan,
        })
        .select("*")
        .single<WishTaskRow>();

      assertNoError(inserted.error);
      return mapWishTask(requireData(inserted.data, "创建愿望失败"));
    },

    async getWishTaskById(id) {
      const result = await client.from("wish_tasks").select("*").eq("id", id).maybeSingle<WishTaskRow>();
      assertNoError(result.error);
      return result.data ? mapWishTask(result.data) : null;
    },

    async updateWishTask(id, patch) {
      const result = await client
        .from("wish_tasks")
        .update({
          title: patch.title,
          intent: patch.intent,
          status: patch.status,
          city: patch.city ?? null,
          budget: patch.budget ?? null,
          time_window: patch.timeWindow ?? null,
          raw_input: patch.rawInput ?? null,
          ai_plan: patch.aiPlan,
          confirmed_at: patch.confirmedAt ?? null,
        })
        .eq("id", id)
        .select("*")
        .single<WishTaskRow>();

      assertNoError(result.error);
      return mapWishTask(requireData(result.data, "更新愿望失败"));
    },

    async listValidationRounds(wishTaskId) {
      const result = await client
        .from("validation_rounds")
        .select("*")
        .eq("wish_task_id", wishTaskId)
        .order("round_number", { ascending: true })
        .returns<ValidationRoundRow[]>();

      assertNoError(result.error);
      return (result.data ?? []).map(mapValidationRound);
    },

    async createValidationRound(input) {
      const result = await client
        .from("validation_rounds")
        .insert({
          wish_task_id: input.wishTaskId,
          round_number: input.roundNumber,
          summary: input.summary,
          human_check_passed: input.humanCheckPassed,
        })
        .select("*")
        .single<ValidationRoundRow>();

      assertNoError(result.error);
      return mapValidationRound(requireData(result.data, "创建轮次记录失败"));
    },
  };
}
