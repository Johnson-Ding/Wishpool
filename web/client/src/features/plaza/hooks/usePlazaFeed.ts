import { useCallback, useEffect, useRef, useState } from "react";
import { DRIFT_BOTTLES } from "@/features/demo-flow/data";
import {
  fetchComments,
  fetchFeed,
  likeFeedItem,
  postComment,
  type FeedComment,
  type FeedItem,
} from "@/lib/api";

export type PlazaBottle = Pick<
  FeedItem,
  "id" | "tag" | "tagColor" | "tagBg" | "title" | "meta" | "loc" | "excerpt" | "type" | "likes" | "link"
>;

function toPlazaBottle(item: FeedItem): PlazaBottle {
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

export function usePlazaFeed() {
  const [items, setItems] = useState<PlazaBottle[]>(DRIFT_BOTTLES);
  const [commentsById, setCommentsById] = useState<Record<number, FeedComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const fetchOnceRef = useRef(false);

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;

    fetchFeed(24)
      .then((rows) => {
        if (rows.length > 0) {
          setItems(rows.map(toPlazaBottle));
          setIsLive(true);
        }
      })
      .catch(() => {
        // 静默回退到本地 seeds
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const like = useCallback(async (id: number) => {
    try {
      const updated = await likeFeedItem(id);
      setItems((current) => current.map((item) => (
        item.id === id ? { ...item, likes: updated.likes } : item
      )));
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadComments = useCallback(async (bottleId: number) => {
    try {
      const comments = await fetchComments(bottleId);
      setCommentsById((current) => ({ ...current, [bottleId]: comments }));
      return comments;
    } catch {
      return [];
    }
  }, []);

  const addComment = useCallback(async (bottleId: number, content: string) => {
    try {
      const comment = await postComment(bottleId, content);
      setCommentsById((current) => ({
        ...current,
        [bottleId]: [...(current[bottleId] ?? []), comment],
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    items,
    commentsById,
    loading,
    isLive,
    like,
    loadComments,
    addComment,
  };
}
