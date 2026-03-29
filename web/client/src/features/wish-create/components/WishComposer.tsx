import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateAIPlan, type GeneratedPlan } from "@/lib/agent-api";
import { clarifyWish, confirmWishPlan, createWish, type WishTask } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/device";
import { deriveWishStage, getStatusLabel } from "../flow";

interface ClarifyFormState {
  city: string;
  budget: string;
  timeWindow: string;
}

function getPlanTitle(wish: WishTask, generatedPlan: GeneratedPlan | null) {
  if (generatedPlan?.wishText) {
    return generatedPlan.wishText;
  }
  return wish.title || wish.intent;
}

export function WishComposer() {
  const [intent, setIntent] = useState("");
  const [wish, setWish] = useState<WishTask | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [clarify, setClarify] = useState<ClarifyFormState>({
    city: "",
    budget: "",
    timeWindow: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = useMemo(() => deriveWishStage(wish?.status), [wish?.status]);

  const handleCreateWish = async () => {
    const nextIntent = intent.trim();
    if (!nextIntent) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const deviceId = getOrCreateDeviceId();
      const created = await createWish({
        deviceId,
        intent: nextIntent,
        rawInput: nextIntent,
        title: nextIntent.length > 18 ? `${nextIntent.slice(0, 18)}…` : nextIntent,
      });

      setWish(created);
      setMessage("愿望已创建，继续补充几个关键约束后就能进入方案确认。");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "创建愿望失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClarifyWish = async () => {
    if (!wish) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const clarified = await clarifyWish({
        wishId: wish.id,
        title: wish.title,
        intent: wish.intent,
        rawInput: intent || wish.rawInput,
        city: clarify.city || undefined,
        budget: clarify.budget || undefined,
        timeWindow: clarify.timeWindow || undefined,
      });
      setWish(clarified);

      const planResult = await generateAIPlan(intent || wish.intent, getOrCreateDeviceId());
      setGeneratedPlan(planResult.plan ?? null);
      setMessage("关键信息已补齐，下面是本次愿望的执行方案。");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "补充信息失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWish = async () => {
    if (!wish) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const confirmed = await confirmWishPlan(wish.id);
      setWish(confirmed);
      setMessage("方案已确认，这条愿望已经进入“准备开始”状态。");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "确认方案失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5">
      <Card className="border-white/10 bg-white/[0.04] shadow-none">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Wish Entry</p>
          <h2 className="text-2xl font-semibold text-white">把一个心愿说出口</h2>
          <p className="max-w-2xl text-sm leading-7 text-white/65">
            正式 Web 端不再把这一步藏在 demo 叙事里，而是把它作为产品主入口的一部分。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            className="min-h-32 border-white/10 bg-black/10 text-white placeholder:text-white/35"
            placeholder="比如：我想下周找个周末去海边吹吹风，最好别太折腾。"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-full bg-white text-black hover:bg-white/90"
              disabled={submitting}
              onClick={() => void handleCreateWish()}
            >
              {submitting && stage === "draft" ? "正在创建…" : "开始发愿"}
            </Button>
            <span className="text-sm text-white/55">当前阶段：{getStatusLabel(wish?.status)}</span>
          </div>
          {message && <p className="text-sm text-emerald-200">{message}</p>}
          {error && <p className="text-sm text-red-200">{error}</p>}
        </CardContent>
      </Card>

      {stage === "clarifying" && wish && (
        <Card className="border-white/10 bg-white/[0.04] shadow-none">
          <CardHeader className="space-y-2">
            <h3 className="text-xl font-semibold text-white">补充关键信息</h3>
            <p className="text-sm text-white/60">首期先收城市、预算和时间窗口，完成后进入方案确认。</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Input
              value={clarify.city}
              onChange={(event) => setClarify((current) => ({ ...current, city: event.target.value }))}
              className="border-white/10 bg-black/10 text-white placeholder:text-white/35"
              placeholder="城市"
            />
            <Input
              value={clarify.budget}
              onChange={(event) => setClarify((current) => ({ ...current, budget: event.target.value }))}
              className="border-white/10 bg-black/10 text-white placeholder:text-white/35"
              placeholder="预算"
            />
            <Input
              value={clarify.timeWindow}
              onChange={(event) => setClarify((current) => ({ ...current, timeWindow: event.target.value }))}
              className="border-white/10 bg-black/10 text-white placeholder:text-white/35"
              placeholder="时间窗口"
            />
            <div className="md:col-span-3">
              <Button
                type="button"
                className="rounded-full bg-[color:var(--primary)] text-black hover:opacity-90"
                disabled={submitting}
                onClick={() => void handleClarifyWish()}
              >
                {submitting ? "正在生成方案…" : "补齐信息并进入方案确认"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(stage === "planning" || stage === "ready") && wish && (
        <Card className="border-white/10 bg-white/[0.04] shadow-none">
          <CardHeader className="space-y-2">
            <h3 className="text-xl font-semibold text-white">方案确认</h3>
            <p className="text-sm text-white/60">这里接住了原本在 demo 里的方案页，但现在已经是正式产品流程的一部分。</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Wish</p>
              <h4 className="mt-2 text-lg font-semibold text-white">{getPlanTitle(wish, generatedPlan)}</h4>
              <p className="mt-2 text-sm text-white/65">{generatedPlan?.durationText || "预计 3-7 天推进到 ready"}</p>
            </div>

            <div className="grid gap-3">
              {(generatedPlan?.planSteps ?? []).map((step) => (
                <div key={step.num} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{step.num} {step.title}</span>
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: `${step.typeColor}20`, color: step.typeColor }}>
                      {step.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/60">{step.desc}</p>
                </div>
              ))}
            </div>

            {stage === "planning" ? (
              <Button
                type="button"
                className="rounded-full bg-white text-black hover:bg-white/90"
                disabled={submitting}
                onClick={() => void handleConfirmWish()}
              >
                {submitting ? "正在确认…" : "确认方案，进入准备开始"}
              </Button>
            ) : (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                这条愿望已经进入 ready 状态，后续可以由“我的愿望”持续承接。
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
