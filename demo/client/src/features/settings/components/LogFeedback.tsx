import { useState } from "react";

export function LogFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    // Mock: 不真实上传
    console.log("Feedback submitted:", feedback);
    setFeedback("");
    setIsOpen(false);
    alert("反馈已提交（Mock）");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between p-4 rounded-lg transition-all active:scale-98"
        style={{ background: "var(--card)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          log反馈
        </span>
        <span style={{ color: "var(--muted-foreground)" }}>›</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          log反馈
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          取消
        </button>
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="描述遇到的问题..."
        className="w-full p-2 rounded text-xs resize-none"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          minHeight: "80px"
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim()}
        className="px-4 py-2 rounded text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          color: "var(--primary-foreground)"
        }}
      >
        提交反馈
      </button>
    </div>
  );
}
