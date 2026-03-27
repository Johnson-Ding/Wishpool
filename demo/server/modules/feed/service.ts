import { HttpError } from "../../lib/http";

export interface FeedItemRecord {
  id: number;
  fulfillmentId?: string;
  sourceType: "seed" | "major_completion" | "moment_capture";
  type: "story" | "mumble" | "news" | "rec" | "goodnews" | "poem" | "quote";
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  meta: string;
  loc: string;
  excerpt: string;
  likes: number;
  link?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FeedCommentRecord {
  id: string;
  bottleId: number;
  anonymousUserId?: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CreateFeedCommentInput {
  deviceId?: string;
  authorName?: string;
  content: string;
}

export interface FeedRepository {
  listFeed(limit: number): Promise<FeedItemRecord[]>;
  getFeedItem(id: number): Promise<FeedItemRecord | null>;
  incrementLike(id: number): Promise<FeedItemRecord>;
  listComments(bottleId: number): Promise<FeedCommentRecord[]>;
  createComment(bottleId: number, input: { anonymousUserId?: string; authorName: string; content: string }): Promise<FeedCommentRecord>;
  getOrCreateAnonymousUser(deviceId: string): Promise<{ id: string }>;
}

export interface FeedService {
  listFeed(limit?: number): Promise<FeedItemRecord[]>;
  likeFeedItem(id: number): Promise<FeedItemRecord>;
  listComments(id: number): Promise<FeedCommentRecord[]>;
  createComment(id: number, input: CreateFeedCommentInput): Promise<FeedCommentRecord>;
}

export function createFeedService(repository: FeedRepository): FeedService {
  return {
    async listFeed(limit = 20) {
      return repository.listFeed(limit);
    },

    async likeFeedItem(id) {
      const item = await repository.getFeedItem(id);
      if (!item || !item.isActive) {
        throw new HttpError(404, "feed_item_not_found", "漂流瓶内容不存在");
      }

      return repository.incrementLike(id);
    },

    async listComments(id) {
      const item = await repository.getFeedItem(id);
      if (!item || !item.isActive) {
        throw new HttpError(404, "feed_item_not_found", "漂流瓶内容不存在");
      }

      return repository.listComments(id);
    },

    async createComment(id, input) {
      const item = await repository.getFeedItem(id);
      if (!item || !item.isActive) {
        throw new HttpError(404, "feed_item_not_found", "漂流瓶内容不存在");
      }

      const anonymousUserId = input.deviceId
        ? (await repository.getOrCreateAnonymousUser(input.deviceId)).id
        : undefined;

      return repository.createComment(id, {
        anonymousUserId,
        authorName: input.authorName?.trim() || "匿名用户",
        content: input.content.trim(),
      });
    },
  };
}
