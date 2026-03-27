import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import {
  createWishesService,
  type ValidationRoundRecord,
  type WishTaskRecord,
  type WishesRepository,
} from "../modules/wishes/service";

class InMemoryWishesRepository implements WishesRepository {
  private anonymousUsers = new Map<string, { id: string }>();
  private wishes = new Map<string, WishTaskRecord>();
  private rounds = new Map<string, ValidationRoundRecord[]>();
  private wishCounter = 1;
  private roundCounter = 1;

  async getOrCreateAnonymousUser(deviceId: string) {
    const existing = this.anonymousUsers.get(deviceId);
    if (existing) {
      return existing;
    }

    const created = { id: `anon-${this.anonymousUsers.size + 1}` };
    this.anonymousUsers.set(deviceId, created);
    return created;
  }

  async createWishTask(input: Omit<WishTaskRecord, "id" | "createdAt" | "updatedAt" | "confirmedAt">) {
    const now = new Date("2026-03-27T08:00:00.000Z").toISOString();
    const created: WishTaskRecord = {
      id: `00000000-0000-4000-8000-${String(this.wishCounter++).padStart(12, "0")}`,
      confirmedAt: undefined,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    this.wishes.set(created.id, created);
    return created;
  }

  async getWishTaskById(id: string) {
    return this.wishes.get(id) ?? null;
  }

  async updateWishTask(id: string, patch: Partial<WishTaskRecord>) {
    const current = this.wishes.get(id);
    if (!current) {
      throw new Error("wish not found");
    }

    const updated: WishTaskRecord = {
      ...current,
      ...patch,
      updatedAt: new Date("2026-03-27T09:00:00.000Z").toISOString(),
    };
    this.wishes.set(id, updated);
    return updated;
  }

  async listValidationRounds(wishTaskId: string) {
    return this.rounds.get(wishTaskId) ?? [];
  }

  async createValidationRound(input: Omit<ValidationRoundRecord, "id" | "createdAt">) {
    const created: ValidationRoundRecord = {
      id: `round-${this.roundCounter++}`,
      createdAt: new Date("2026-03-27T10:00:00.000Z").toISOString(),
      ...input,
    };
    const rounds = this.rounds.get(input.wishTaskId) ?? [];
    rounds.push(created);
    this.rounds.set(input.wishTaskId, rounds);
    return created;
  }
}

describe("wish routes", () => {
  let repository: InMemoryWishesRepository;

  beforeEach(() => {
    repository = new InMemoryWishesRepository();
  });

  it("creates a wish and returns the generated placeholder plan", async () => {
    const app = createApp({
      wishesService: createWishesService(repository),
      feedService: {
        listFeed: async () => [],
        likeFeedItem: async () => {
          throw new Error("not implemented");
        },
        listComments: async () => [],
        createComment: async () => {
          throw new Error("not implemented");
        },
      },
    });

    const response = await request(app).post("/api/wishes").send({
      deviceId: "device-001",
      intent: "我想下个月去滑雪，最好有人一起",
      city: "北京",
      budget: "1500",
      timeWindow: "下个月",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("clarifying");
    expect(response.body.data.aiPlan.steps).toHaveLength(3);
  });

  it("clarifies and confirms a wish while recording validation rounds", async () => {
    const service = createWishesService(repository);
    const app = createApp({
      wishesService: service,
      feedService: {
        listFeed: async () => [],
        likeFeedItem: async () => {
          throw new Error("not implemented");
        },
        listComments: async () => [],
        createComment: async () => {
          throw new Error("not implemented");
        },
      },
    });

    const created = await service.createWish({
      deviceId: "device-002",
      intent: "我想参加一次城市夜跑",
    });

    const clarifyResponse = await request(app)
      .patch(`/api/wishes/${created.id}/clarify`)
      .send({ city: "上海", budget: "200", timeWindow: "本周末" });

    expect(clarifyResponse.status).toBe(200);
    expect(clarifyResponse.body.data.status).toBe("planning");

    const confirmResponse = await request(app).post(`/api/wishes/${created.id}/plan/confirm`).send({});

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.data.status).toBe("ready");
    expect(confirmResponse.body.data.confirmedAt).toBeTruthy();

    const roundsResponse = await request(app).get(`/api/wishes/${created.id}/rounds`);

    expect(roundsResponse.status).toBe(200);
    expect(roundsResponse.body.data).toHaveLength(2);
    expect(roundsResponse.body.data[1].humanCheckPassed).toBe(true);
  });
});
