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
  const [errorById, setErrorById] = useState<Record<number, string>>({});
  const [likingId, setLikingId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          正在加载广场内容…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* 状态指示器 */}
      <div
        className="rounded-3xl border px-4 py-3"
        style={{
          borderColor: "var(--border)",
          background: "var(--card)"
        }}
      >
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Community Feed
          </p>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            {isLive ? "已连接真实社区数据" : "当前展示本地种子内容"}
          </p>
        </div>
      </div>

      {/* 响应式网格布局 - 桌面版优化 */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.map((item) => {
          const expanded = expandedId === item.id;
          const comments = commentsById[item.id] ?? [];

          return (
            <Card
              key={item.id}
              className="group transition-all duration-300 cursor-pointer h-fit hover:scale-[1.02] glass-card"
              style={{
                border: `1px solid var(--border)`,
                background: "var(--card)",
                boxShadow: "var(--card-shadow)"
              }}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-medium border"
                    style={{
                      background: item.tagBg,
                      color: item.tagColor,
                      borderColor: `${item.tagColor}40`
                    }}
                  >
                    {item.tag}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.loc}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3
                    className="text-lg font-semibold line-clamp-2 group-hover:text-opacity-90 transition-all font-heading"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.meta}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                <p
                  className="text-sm leading-6 line-clamp-3"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.excerpt}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={likingId === item.id}
                    onClick={async () => {
                      setLikingId(item.id);
                      setErrorById((prev) => ({ ...prev, [item.id]: "" }));
                      try {
                        const success = await onLike(item.id);
                        if (!success) {
                          setErrorById((prev) => ({ ...prev, [item.id]: "点赞失败，请重试" }));
                        }
                      } catch (err) {
                        setErrorById((prev) => ({
                          ...prev,
                          [item.id]: err instanceof Error ? err.message : "点赞失败",
                        }));
                      } finally {
                        setLikingId(null);
                      }
                    }}
                    className="rounded-full font-medium text-sm hover:scale-105 transition-transform"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      opacity: likingId === item.id ? 0.7 : 1,
                    }}
                  >
                    {likingId === item.id ? "..." : `点赞 ${item.likes}`}
                  </Button>
                  {errorById[item.id] && !expanded && (
                    <span className="text-xs" style={{ color: "var(--destructive)" }}>
                      {errorById[item.id]}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full font-medium text-sm hover:scale-105 transition-transform"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--secondary)",
                      color: "var(--foreground)"
                    }}
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
                  <div
                    className="space-y-3 rounded-2xl border p-4 fade-in-up"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--secondary)"
                    }}
                  >
                    <div className="space-y-2">
                      {comments.length === 0 ? (
                        <p
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          还没有人留言，你可以成为第一个回应的人。
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-2xl px-3 py-2"
                            style={{ background: "var(--card)" }}
                          >
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {comment.authorName}
                            </p>
                            <p
                              className="mt-1 text-sm"
                              style={{ color: "var(--foreground)" }}
                            >
                              {comment.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      {errorById[item.id] && (
                        <p className="text-sm" style={{ color: "var(--destructive)" }}>
                          {errorById[item.id]}
                        </p>
                      )}
                      <Textarea
                        value={draftById[item.id] ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setDraftById((current) => ({ ...current, [item.id]: value }));
                          // 清除错误
                          if (errorById[item.id]) {
                            setErrorById((prev) => ({ ...prev, [item.id]: "" }));
                          }
                        }}
                        className="min-h-24 resize-none"
                        style={{
                          borderColor: errorById[item.id] ? "var(--destructive)" : "var(--border)",
                          background: "var(--input)",
                          color: "var(--foreground)"
                        }}
                        placeholder="说说你的想法，或留下一个想一起实现的信号。"
                      />
                      <Button
                        type="button"
                        disabled={submittingId === item.id}
                        className="rounded-full font-semibold hover:opacity-90 transition-opacity"
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--accent))",
                          color: "var(--background)",
                          opacity: submittingId === item.id ? 0.7 : 1,
                        }}
                        onClick={async () => {
                          const value = (draftById[item.id] ?? "").trim();
                          if (!value) return;
                          setSubmittingId(item.id);
                          setErrorById((prev) => ({ ...prev, [item.id]: "" }));
                          try {
                            const success = await onAddComment(item.id, value);
                            if (success) {
                              setDraftById((current) => ({ ...current, [item.id]: "" }));
                            } else {
                              setErrorById((prev) => ({ ...prev, [item.id]: "发送失败，请重试" }));
                            }
                          } catch (err) {
                            setErrorById((prev) => ({
                              ...prev,
                              [item.id]: err instanceof Error ? err.message : "发送失败",
                            }));
                          } finally {
                            setSubmittingId(null);
                          }
                        }}
                      >
                        {submittingId === item.id ? "..." : "发送回应"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
