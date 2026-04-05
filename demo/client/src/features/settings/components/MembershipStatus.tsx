export function MembershipStatus() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          会员体系
        </span>
        <span className="text-xs px-2 py-1 rounded-full" style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          color: "var(--primary-foreground)"
        }}>
          已开通会员
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        当前阶段默认全员会员，享受完整功能体验
      </p>
    </div>
  );
}
