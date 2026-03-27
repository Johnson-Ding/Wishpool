import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../../lib/http";
import type { FeedCommentRecord, FeedItemRecord, FeedRepository } from "./service";

type AnonymousUserRow = {
  id: string;
  device_id: string;
  created_at: string;
};

type FeedItemRow = {
  id: number;
  fulfillment_id: string | null;
  source_type: FeedItemRecord["sourceType"];
  type: FeedItemRecord["type"];
  tag: string;
  tag_color: string;
  tag_bg: string;
  title: string;
  meta: string;
  loc: string;
  excerpt: string;
  likes: number;
  link: string | null;
  is_active: boolean;
  created_at: string;
};

type FeedCommentRow = {
  id: string;
  drift_bottle_id: number;
  anonymous_user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
};

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

function mapFeedItem(row: FeedItemRow): FeedItemRecord {
  return {
    id: row.id,
    fulfillmentId: row.fulfillment_id ?? undefined,
    sourceType: row.source_type,
    type: row.type,
    tag: row.tag,
    tagColor: row.tag_color,
    tagBg: row.tag_bg,
    title: row.title,
    meta: row.meta,
    loc: row.loc,
    excerpt: row.excerpt,
    likes: row.likes,
    link: row.link ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapComment(row: FeedCommentRow): FeedCommentRecord {
  return {
    id: row.id,
    bottleId: row.drift_bottle_id,
    anonymousUserId: row.anonymous_user_id ?? undefined,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function createSupabaseFeedRepository(client: SupabaseClient): FeedRepository {
  return {
    async listFeed(limit) {
      const result = await client
        .from("drift_bottles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<FeedItemRow[]>();

      assertNoError(result.error);
      return (result.data ?? []).map(mapFeedItem);
    },

    async getFeedItem(id) {
      const result = await client
        .from("drift_bottles")
        .select("*")
        .eq("id", id)
        .maybeSingle<FeedItemRow>();

      assertNoError(result.error);
      return result.data ? mapFeedItem(result.data) : null;
    },

    async incrementLike(id) {
      const current = await this.getFeedItem(id);
      if (!current) {
        throw new HttpError(404, "feed_item_not_found", "漂流瓶内容不存在");
      }

      const result = await client
        .from("drift_bottles")
        .update({ likes: current.likes + 1 })
        .eq("id", id)
        .select("*")
        .single<FeedItemRow>();

      assertNoError(result.error);
      return mapFeedItem(requireData(result.data, "更新点赞失败"));
    },

    async listComments(bottleId) {
      const result = await client
        .from("drift_bottle_comments")
        .select("*")
        .eq("drift_bottle_id", bottleId)
        .order("created_at", { ascending: true })
        .returns<FeedCommentRow[]>();

      assertNoError(result.error);
      return (result.data ?? []).map(mapComment);
    },

    async createComment(bottleId, input) {
      const result = await client
        .from("drift_bottle_comments")
        .insert({
          drift_bottle_id: bottleId,
          anonymous_user_id: input.anonymousUserId ?? null,
          author_name: input.authorName,
          content: input.content,
        })
        .select("*")
        .single<FeedCommentRow>();

      assertNoError(result.error);
      return mapComment(requireData(result.data, "创建评论失败"));
    },

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
  };
}
