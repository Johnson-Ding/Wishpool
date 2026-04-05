import { useTheme } from "@/contexts/ThemeContext";

export function ThemeStyleEntry() {
  const { theme, toggleTheme, switchable } = useTheme();

  const handleThemeChange = () => {
    if (toggleTheme) {
      toggleTheme();
    }
  };

  const themeName = theme === "dark" ? "深色" : "浅色";

  return (
    <button
      onClick={handleThemeChange}
      disabled={!switchable}
      className="flex items-center justify-between p-4 rounded-lg transition-all active:scale-98 disabled:opacity-50"
      style={{ background: "var(--card)" }}
    >
      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
        主题风格
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {themeName}
        </span>
        <span style={{ color: "var(--muted-foreground)" }}>›</span>
      </div>
    </button>
  );
}
