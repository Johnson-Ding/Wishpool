export interface WishpoolSupabaseClient {
  from(table: string): any;
  rpc(name: string, args?: Record<string, unknown>): any;
}

export interface FeedItem {
  id: number;
  fulfillmentId?: string;
  sourceType: string;
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

export interface FeedComment {
  id: string;
  bottleId: number;
  userId?: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface WishTask {
  id: string;
  userId: string;
  title: string;
  intent: string;
  status: string;
  city?: string;
  budget?: string;
  timeWindow?: string;
  rawInput?: string;
  aiPlan: Record<string, unknown>;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function toFeedItem(row: Record<string, unknown>): FeedItem {
  return {
    id: row.id as number,
    fulfillmentId: row.fulfillment_id as string | undefined,
    sourceType: row.source_type as string,
    type: row.type as FeedItem["type"],
    tag: row.tag as string,
    tagColor: row.tag_color as string,
    tagBg: row.tag_bg as string,
    title: row.title as string,
    meta: row.meta as string,
    loc: row.loc as string,
    excerpt: row.excerpt as string,
    likes: row.likes as number,
    link: row.link as string | undefined,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export function toFeedComment(row: Record<string, unknown>): FeedComment {
  return {
    id: row.id as string,
    bottleId: row.drift_bottle_id as number,
    userId: row.user_id as string | undefined,
    authorName: row.author_name as string,
    content: row.content as string,
    createdAt: row.created_at as string,
  };
}

export function toWishTask(row: Record<string, unknown>): WishTask {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    intent: row.intent as string,
    status: row.status as string,
    city: row.city as string | undefined,
    budget: row.budget as string | undefined,
    timeWindow: row.time_window as string | undefined,
    rawInput: row.raw_input as string | undefined,
    aiPlan: (row.ai_plan ?? {}) as Record<string, unknown>,
    confirmedAt: row.confirmed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function toWishTasks(rows: Record<string, unknown>[] | null | undefined): WishTask[] {
  return (rows ?? []).map(toWishTask);
}

export function createWishpoolApi(supabase: WishpoolSupabaseClient) {
  return {
    async fetchFeed(limit = 20): Promise<FeedItem[]> {
      const { data, error } = await supabase
        .from("drift_bottles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return ((data ?? []) as Record<string, unknown>[]).map(toFeedItem);
    },

    async likeFeedItem(id: number): Promise<FeedItem> {
      const { data, error } = await supabase.rpc("like_bottle", {
        p_bottle_id: id,
      });

      if (error) throw new Error(error.message);
      return toFeedItem(data as Record<string, unknown>);
    },

    async fetchComments(bottleId: number): Promise<FeedComment[]> {
      const { data, error } = await supabase
        .from("drift_bottle_comments")
        .select("*")
        .eq("drift_bottle_id", bottleId)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return ((data ?? []) as Record<string, unknown>[]).map(toFeedComment);
    },

    async postComment(
      bottleId: number,
      content: string,
      authorName?: string,
    ): Promise<FeedComment> {
      const { data, error } = await supabase
        .from("drift_bottle_comments")
        .insert({
          drift_bottle_id: bottleId,
          content,
          author_name: authorName ?? "匿名用户",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return toFeedComment(data as Record<string, unknown>);
    },

    async createWish(input: {
      intent: string;
      title?: string;
      city?: string;
      budget?: string;
      timeWindow?: string;
      rawInput?: string;
    }): Promise<WishTask> {
      const { data, error } = await supabase.rpc("create_wish", {
        p_intent: input.intent,
        p_title: input.title ?? "untitled wish",
        p_city: input.city ?? null,
        p_budget: input.budget ?? null,
        p_time_window: input.timeWindow ?? null,
        p_raw_input: input.rawInput ?? null,
      });

      if (error) throw new Error(error.message);
      return toWishTask(data as Record<string, unknown>);
    },

    async clarifyWish(input: {
      wishId: string;
      title?: string;
      intent?: string;
      city?: string;
      budget?: string;
      timeWindow?: string;
      rawInput?: string;
    }): Promise<WishTask> {
      const { data, error } = await supabase.rpc("clarify_wish", {
        p_wish_id: input.wishId,
        p_title: input.title ?? null,
        p_intent: input.intent ?? null,
        p_city: input.city ?? null,
        p_budget: input.budget ?? null,
        p_time_window: input.timeWindow ?? null,
        p_raw_input: input.rawInput ?? null,
      });

      if (error) throw new Error(error.message);
      return toWishTask(data as Record<string, unknown>);
    },

    async confirmWishPlan(wishId: string): Promise<WishTask> {
      const { data, error } = await supabase.rpc("confirm_wish_plan", {
        p_wish_id: wishId,
      });

      if (error) throw new Error(error.message);
      return toWishTask(data as Record<string, unknown>);
    },

    async listMyWishes(): Promise<WishTask[]> {
      const { data, error } = await supabase.rpc("list_my_wishes");

      if (error) throw new Error(error.message);
      return toWishTasks((data ?? []) as Record<string, unknown>[]);
    },
  };
}
