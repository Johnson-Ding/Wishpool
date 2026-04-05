import { useState } from "react";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const currentVersion = "0.5.0"; // Mock version

  const handleCheckUpdate = () => {
    setChecking(true);
    // Mock: 不真实检查更新
    setTimeout(() => {
      setChecking(false);
      alert("当前已是最新版本（Mock）");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          更新检查
        </span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          v{currentVersion}
        </span>
      </div>
      <button
        onClick={handleCheckUpdate}
        disabled={checking}
        className="px-4 py-2 rounded text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: "var(--secondary)",
          color: "var(--secondary-foreground)"
        }}
      >
        {checking ? "检查中..." : "检查更新"}
      </button>
    </div>
  );
}
