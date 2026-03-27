import { HttpError } from "../../lib/http";

export type WishStatus =
  | "draft"
  | "clarifying"
  | "planning"
  | "validating"
  | "locking"
  | "ready"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export interface WishTaskRecord {
  id: string;
  anonymousUserId: string;
  title: string;
  intent: string;
  status: WishStatus;
  city?: string;
  budget?: string;
  timeWindow?: string;
  rawInput?: string;
  aiPlan: Record<string, unknown>;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationRoundRecord {
  id: string;
  wishTaskId: string;
  roundNumber: number;
  summary: string;
  humanCheckPassed: boolean | null;
  createdAt: string;
}

export interface CreateWishInput {
  deviceId: string;
  intent: string;
  title?: string;
  city?: string;
  budget?: string;
  timeWindow?: string;
  rawInput?: string;
}

export interface ClarifyWishInput {
  title?: string;
  intent?: string;
  city?: string;
  budget?: string;
  timeWindow?: string;
  rawInput?: string;
}

export interface WishesRepository {
  getOrCreateAnonymousUser(deviceId: string): Promise<{ id: string }>;
  createWishTask(input: Omit<WishTaskRecord, "id" | "createdAt" | "updatedAt" | "confirmedAt">): Promise<WishTaskRecord>;
  getWishTaskById(id: string): Promise<WishTaskRecord | null>;
  updateWishTask(id: string, patch: Partial<WishTaskRecord>): Promise<WishTaskRecord>;
  listValidationRounds(wishTaskId: string): Promise<ValidationRoundRecord[]>;
  createValidationRound(input: Omit<ValidationRoundRecord, "id" | "createdAt">): Promise<ValidationRoundRecord>;
}

function buildAiPlan(task: {
  title: string;
  intent: string;
  city?: string;
  budget?: string;
  timeWindow?: string;
}) {
  return {
    source: "system_placeholder",
    summary: `围绕“${task.title}”生成的初版执行方案`,
    constraints: {
      city: task.city,
      budget: task.budget,
      timeWindow: task.timeWindow,
    },
    steps: [
      {
        key: "clarify",
        title: "补充关键约束",
        owner: "user_and_ai",
        status: "completed",
      },
      {
        key: "planning",
        title: "生成可执行方案",
        owner: "ai",
        status: "in_progress",
      },
      {
        key: "validation",
        title: "进入轮次校验与执行推进",
        owner: "system",
        status: "pending",
      },
    ],
    intent: task.intent,
  };
}

function deriveTitle(intent: string, explicitTitle?: string) {
  const title = explicitTitle?.trim();
  if (title) {
    return title;
  }

  const normalized = intent.trim();
  return normalized.length <= 20 ? normalized : `${normalized.slice(0, 20)}...`;
}

export interface WishesService {
  createWish(input: CreateWishInput): Promise<WishTaskRecord>;
  getWish(id: string): Promise<WishTaskRecord>;
  clarifyWish(id: string, input: ClarifyWishInput): Promise<WishTaskRecord>;
  confirmWishPlan(id: string): Promise<WishTaskRecord>;
  listRounds(id: string): Promise<ValidationRoundRecord[]>;
}

export function createWishesService(repository: WishesRepository): WishesService {
  return {
    async createWish(input) {
      const anonymousUser = await repository.getOrCreateAnonymousUser(input.deviceId);
      const title = deriveTitle(input.intent, input.title);

      return repository.createWishTask({
        anonymousUserId: anonymousUser.id,
        title,
        intent: input.intent.trim(),
        status: "clarifying",
        city: input.city,
        budget: input.budget,
        timeWindow: input.timeWindow,
        rawInput: input.rawInput ?? input.intent,
        aiPlan: buildAiPlan({
          title,
          intent: input.intent.trim(),
          city: input.city,
          budget: input.budget,
          timeWindow: input.timeWindow,
        }),
      });
    },

    async getWish(id) {
      const wish = await repository.getWishTaskById(id);
      if (!wish) {
        throw new HttpError(404, "wish_not_found", "愿望不存在");
      }
      return wish;
    },

    async clarifyWish(id, input) {
      const current = await repository.getWishTaskById(id);
      if (!current) {
        throw new HttpError(404, "wish_not_found", "愿望不存在");
      }

      const title = deriveTitle(input.intent ?? current.intent, input.title ?? current.title);
      const nextWish = await repository.updateWishTask(id, {
        title,
        intent: input.intent?.trim() ?? current.intent,
        city: input.city ?? current.city,
        budget: input.budget ?? current.budget,
        timeWindow: input.timeWindow ?? current.timeWindow,
        rawInput: input.rawInput ?? current.rawInput,
        status: "planning",
        aiPlan: buildAiPlan({
          title,
          intent: input.intent?.trim() ?? current.intent,
          city: input.city ?? current.city,
          budget: input.budget ?? current.budget,
          timeWindow: input.timeWindow ?? current.timeWindow,
        }),
      });

      const rounds = await repository.listValidationRounds(id);
      await repository.createValidationRound({
        wishTaskId: id,
        roundNumber: rounds.length + 1,
        summary: "已补充关键约束，等待系统生成并校验方案。",
        humanCheckPassed: null,
      });

      return nextWish;
    },

    async confirmWishPlan(id) {
      const current = await repository.getWishTaskById(id);
      if (!current) {
        throw new HttpError(404, "wish_not_found", "愿望不存在");
      }

      const confirmedAt = new Date().toISOString();
      const nextWish = await repository.updateWishTask(id, {
        status: "ready",
        confirmedAt,
      });

      const rounds = await repository.listValidationRounds(id);
      await repository.createValidationRound({
        wishTaskId: id,
        roundNumber: rounds.length + 1,
        summary: "用户已确认初版方案，进入执行准备阶段。",
        humanCheckPassed: true,
      });

      return nextWish;
    },

    async listRounds(id) {
      await this.getWish(id);
      return repository.listValidationRounds(id);
    },
  };
}
