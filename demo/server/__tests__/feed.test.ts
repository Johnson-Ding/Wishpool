import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import {
  createFeedService,
  type FeedCommentRecord,
  type FeedItemRecord,
  type FeedRepository,
} from "../modules/feed/service";

class InMemoryFeedRepository implements FeedRepository {
  private anonymousUsers = new Map<string, { id: string }>();
  private items = new Map<number, FeedItemRecord>();
  private comments = new Map<number, FeedCommentRecord[]>();
  private commentCounter = 1;

  constructor() {
    this.items.set(1, {
      id: 1,
      sourceType: "seed",
      type: "story",
      tag: "城市活动",
      tagColor: "var(--accent)",
      tagBg: "oklch(var(--accent-lch) / 14%)",
      title: "第一次参加城市夜跑，认识了固定搭子",
      meta: "3人助力 · 6天完成",
      loc: "上海 · 上周",
      excerpt: "seed data",
      likes: 132,
      isActive: true,
      createdAt: new Date("2026-03-27T08:00:00.000Z").toISOString(),
    });
  }

  async listFeed() {
    return [...this.items.values()];
  }

  async getFeedItem(id: number) {
    return this.items.get(id) ?? null;
  }

  async incrementLike(id: number) {
    const current = this.items.get(id);
    if (!current) {
      throw new Error("feed item not found");
    }
    const updated = { ...current, likes: current.likes + 1 };
    this.items.set(id, updated);
    return updated;
  }

  async listComments(bottleId: number) {
    return this.comments.get(bottleId) ?? [];
  }

  async createComment(bottleId: number, input: { anonymousUserId?: string; authorName: string; content: string }) {
    const comment: FeedCommentRecord = {
      id: `comment-${this.commentCounter++}`,
      bottleId,
      anonymousUserId: input.anonymousUserId,
      authorName: input.authorName,
      content: input.content,
      createdAt: new Date("2026-03-27T09:00:00.000Z").toISOString(),
    };
    const comments = this.comments.get(bottleId) ?? [];
    comments.push(comment);
    this.comments.set(bottleId, comments);
    return comment;
  }

  async getOrCreateAnonymousUser(deviceId: string) {
    const existing = this.anonymousUsers.get(deviceId);
    if (existing) {
      return existing;
    }

    const created = { id: `anon-${this.anonymousUsers.size + 1}` };
    this.anonymousUsers.set(deviceId, created);
    return created;
  }
}

describe("feed routes", () => {
  let repository: InMemoryFeedRepository;

  beforeEach(() => {
    repository = new InMemoryFeedRepository();
  });

  it("lists feed items and increments likes", async () => {
    const app = createApp({
      wishesService: {
        createWish: async () => {
          throw new Error("not implemented");
        },
        getWish: async () => {
          throw new Error("not implemented");
        },
        clarifyWish: async () => {
          throw new Error("not implemented");
        },
        confirmWishPlan: async () => {
          throw new Error("not implemented");
        },
        listRounds: async () => [],
      },
      feedService: createFeedService(repository),
    });

    const listResponse = await request(app).get("/api/feed");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);

    const likeResponse = await request(app).post("/api/feed/1/like").send({});
    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body.data.likes).toBe(133);
  });

  it("creates and lists comments for a feed item", async () => {
    const app = createApp({
      wishesService: {
        createWish: async () => {
          throw new Error("not implemented");
        },
        getWish: async () => {
          throw new Error("not implemented");
        },
        clarifyWish: async () => {
          throw new Error("not implemented");
        },
        confirmWishPlan: async () => {
          throw new Error("not implemented");
        },
        listRounds: async () => [],
      },
      feedService: createFeedService(repository),
    });

    const createResponse = await request(app).post("/api/feed/1/comments").send({
      deviceId: "device-003",
      authorName: "松松",
      content: "这个故事看完真的会想出发。",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.authorName).toBe("松松");

    const listResponse = await request(app).get("/api/feed/1/comments");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].content).toContain("想出发");
  });
});
