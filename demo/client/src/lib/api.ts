const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.error?.message ?? `API ${res.status}`);
  }

  return body.data as T;
}

// ── Feed ────────────────────────────────────────────────────────────

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
  anonymousUserId?: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export function fetchFeed(limit = 20): Promise<FeedItem[]> {
  return request<FeedItem[]>(`/feed?limit=${limit}`);
}

export function likeFeedItem(id: number): Promise<FeedItem> {
  return request<FeedItem>(`/feed/${id}/like`, { method: "POST" });
}

export function fetchComments(bottleId: number): Promise<FeedComment[]> {
  return request<FeedComment[]>(`/feed/${bottleId}/comments`);
}

export function postComment(
  bottleId: number,
  content: string,
  authorName?: string,
): Promise<FeedComment> {
  return request<FeedComment>(`/feed/${bottleId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, authorName }),
  });
}

// ── Wishes ──────────────────────────────────────────────────────────

export interface WishTask {
  id: string;
  anonymousUserId: string;
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

export function createWish(input: {
  deviceId: string;
  intent: string;
  title?: string;
  city?: string;
  budget?: string;
  timeWindow?: string;
  rawInput?: string;
}): Promise<WishTask> {
  return request<WishTask>("/wishes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
