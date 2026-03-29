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
    return <p className="text-sm text-white/60">正在同步你的愿望列表…</p>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">还没有任何愿望</h2>
        <p className="mt-2 text-sm text-white/60">去“发愿”里提交第一个愿望后，这里会成为你的持续管理面。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/8"
          onClick={() => void onRefresh()}
        >
          刷新列表
        </Button>
      </div>
      {items.map((wish) => (
        <Card key={wish.id} className="border-white/10 bg-white/[0.04] shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{wish.title}</h3>
                <p className="text-sm text-white/55">{wish.city || "城市待补充"} · {wish.timeWindow || "时间待补充"}</p>
              </div>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/78">
                {getStatusLabel(wish.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-7 text-white/76">{getWishSummary(wish)}</p>
            <div className="grid gap-2 text-sm text-white/55 md:grid-cols-3">
              <div>预算：{wish.budget || "未填写"}</div>
              <div>创建时间：{new Date(wish.createdAt).toLocaleDateString("zh-CN")}</div>
              <div>更新时间：{new Date(wish.updatedAt).toLocaleDateString("zh-CN")}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
