import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { PlazaBottle } from "../hooks/usePlazaFeed";
import type { FeedComment } from "@/lib/api";

interface PlazaFeedProps {
  items: PlazaBottle[];
  commentsById: Record<number, FeedComment[]>;
  loading: boolean;
  isLive: boolean;
  onLike: (id: number) => Promise<boolean>;
  onLoadComments: (id: number) => Promise<FeedComment[]>;
  onAddComment: (id: number, content: string) => Promise<boolean>;
}

export function PlazaFeed({
  items,
  commentsById,
  loading,
  isLive,
  onLike,
  onLoadComments,
  onAddComment,
}: PlazaFeedProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draftById, setDraftById] = useState<Record<number, string>>({});

  if (loading) {
    return <p className="text-sm text-white/60">正在加载广场内容…</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Community Feed</p>
          <p className="text-sm text-white/80">{isLive ? "已连接真实社区数据" : "当前展示本地种子内容"}</p>
        </div>
      </div>

      {items.map((item) => {
        const expanded = expandedId === item.id;
        const comments = commentsById[item.id] ?? [];

        return (
          <Card
            key={item.id}
            className="border-white/10 bg-white/[0.04] shadow-none backdrop-blur"
          >
            <CardHeader className="space-y-3 pb-2">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: item.tagBg, color: item.tagColor }}
                >
                  {item.tag}
                </span>
                <span className="text-xs text-white/45">{item.loc}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-white/55">{item.meta}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/78">{item.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void onLike(item.id)}
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  点赞 {item.likes}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/8"
                  onClick={async () => {
                    if (!expanded) {
                      await onLoadComments(item.id);
                    }
                    setExpandedId(expanded ? null : item.id);
                  }}
                >
                  {expanded ? "收起讨论" : `查看讨论 ${comments.length > 0 ? comments.length : ""}`.trim()}
                </Button>
              </div>

              {expanded && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="space-y-2">
                    {comments.length === 0 ? (
                      <p className="text-sm text-white/50">还没有人留言，你可以成为第一个回应的人。</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="rounded-2xl bg-white/[0.04] px-3 py-2">
                          <p className="text-xs text-white/45">{comment.authorName}</p>
                          <p className="mt-1 text-sm text-white/78">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      value={draftById[item.id] ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraftById((current) => ({ ...current, [item.id]: value }));
                      }}
                      className="min-h-24 border-white/10 bg-white/[0.04] text-white placeholder:text-white/35"
                      placeholder="说说你的想法，或留下一个想一起实现的信号。"
                    />
                    <Button
                      type="button"
                      className="rounded-full bg-[color:var(--primary)] text-black hover:opacity-90"
                      onClick={async () => {
                        const value = (draftById[item.id] ?? "").trim();
                        if (!value) return;
                        const success = await onAddComment(item.id, value);
                        if (success) {
                          setDraftById((current) => ({ ...current, [item.id]: "" }));
                        }
                      }}
                    >
                      发送回应
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
