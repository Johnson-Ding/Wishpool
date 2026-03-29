import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WishTask } from "@/lib/api";
import { getStatusLabel } from "@/features/wish-create/flow";

interface WishManagementPanelProps {
  items: WishTask[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void> | void;
}

function getWishSummary(wish: WishTask) {
  if (typeof wish.aiPlan.summary === "string") {
    return wish.aiPlan.summary;
  }
  return wish.intent;
}

export function WishManagementPanel({
  items,
  loading,
  error,
  onRefresh,
}: WishManagementPanelProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          正在同步你的愿望列表…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div
          className="rounded-3xl border p-4 text-sm"
          style={{
            borderColor: "var(--destructive)",
            background: "var(--destructive)/10",
            color: "var(--destructive-foreground)"
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)"
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            还没有任何愿望
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            去"发愿"里提交第一个愿望后，这里会成为你的持续管理面。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="rounded-full font-medium"
          style={{
            borderColor: "var(--border)",
            background: "var(--secondary)",
            color: "var(--foreground)"
          }}
          onClick={() => void onRefresh()}
        >
          刷新列表
        </Button>
      </div>

      {/* 响应式网格布局 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((wish) => (
          <Card
            key={wish.id}
            className="glass-card transition-all duration-300 hover:scale-[1.02]"
            style={{
              border: "1px solid var(--border)",
              background: "var(--card)",
              boxShadow: "var(--card-shadow)"
            }}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3
                    className="text-lg font-semibold font-heading line-clamp-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    {wish.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {wish.city || "城市待补充"} · {wish.timeWindow || "时间待补充"}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-medium border"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    borderColor: "var(--primary)"
                  }}
                >
                  {getStatusLabel(wish.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p
                className="text-sm leading-6 line-clamp-3"
                style={{ color: "var(--foreground)" }}
              >
                {getWishSummary(wish)}
              </p>
              <div
                className="grid gap-2 text-xs p-3 rounded-xl"
                style={{
                  background: "var(--secondary)",
                  color: "var(--muted-foreground)"
                }}
              >
                <div>预算：{wish.budget || "未填写"}</div>
                <div>创建：{new Date(wish.createdAt).toLocaleDateString("zh-CN")}</div>
                <div>更新：{new Date(wish.updatedAt).toLocaleDateString("zh-CN")}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}