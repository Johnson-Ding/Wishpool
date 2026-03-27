import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFeed, likeFeedItem, postComment, fetchComments, type FeedItem, type FeedComment } from "@/lib/api";
import { DRIFT_BOTTLES } from "./data";

export type BottleItem = {
  id: number;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  meta: string;
  loc: string;
  excerpt: string;
  type: "story" | "mumble" | "news" | "rec" | "goodnews" | "poem" | "quote";
  likes: number;
  link?: string;
};

function feedItemToBottle(item: FeedItem): BottleItem {
  return {
    id: item.id,
    tag: item.tag,
    tagColor: item.tagColor,
    tagBg: item.tagBg,
    title: item.title,
    meta: item.meta,
    loc: item.loc,
    excerpt: item.excerpt,
    type: item.type,
    likes: item.likes,
    link: item.link,
  };
}

export function useFeedData() {
  const [bottles, setBottles] = useState<BottleItem[]>(DRIFT_BOTTLES);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchFeed(30)
      .then((items) => {
        if (items.length > 0) {
          setBottles(items.map(feedItemToBottle));
          setIsLive(true);
        }
      })
      .catch(() => {
        // API 不可用时静默回退到静态数据
      })
      .finally(() => setLoading(false));
  }, []);

  const doLike = useCallback(async (id: number) => {
    try {
      const updated = await likeFeedItem(id);
      setBottles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, likes: updated.likes } : b)),
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const doComment = useCallback(async (bottleId: number, content: string, authorName?: string) => {
    try {
      await postComment(bottleId, content, authorName);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getComments = useCallback(async (bottleId: number): Promise<FeedComment[]> => {
    try {
      return await fetchComments(bottleId);
    } catch {
      return [];
    }
  }, []);

  return { bottles, isLive, loading, doLike, doComment, getComments };
}
